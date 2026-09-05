from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from math import asin, cos, radians, sin, sqrt
import json
import os
import uuid
import random
import models, schemas
from image_storage import save_image_local

# Wards crud
def get_wards(db: Session):
    return db.query(models.Ward).all()

def get_ward_by_id(db: Session, ward_id: str):
    return db.query(models.Ward).filter(models.Ward.id == ward_id).first()

def get_nearest_ward(db: Session, lat: float, lng: float):
    """Return the closest configured Ahmedabad ward and its distance in metres. Rejects points > 35km outside city limits."""
    wards = get_wards(db)
    if not wards:
        return None, None

    def distance_m(ward):
        earth_radius_m = 6_371_000
        delta_lat = radians(ward.lat - lat)
        delta_lng = radians(ward.lng - lng)
        a = (
            sin(delta_lat / 2) ** 2
            + cos(radians(lat)) * cos(radians(ward.lat)) * sin(delta_lng / 2) ** 2
        )
        return 2 * earth_radius_m * asin(sqrt(a))

    nearest = min(wards, key=distance_m)
    dist = distance_m(nearest)

    # Strict Geofencing check: Maximum 35 km (35,000 meters) from nearest ward center
    if dist > 35_000:
        return None, round(dist, 1)

    return nearest, round(dist, 1)

# Reports crud
def get_reports(db: Session, severity: str = None, status: str = None, category: str = None, ward_id: str = None, search: str = None):
    query = db.query(models.Report)
    if severity and severity != 'all':
        query = query.filter(models.Report.severity == severity)
    if status and status != 'all':
        query = query.filter(models.Report.status == status)
    if category and category != 'all':
        query = query.filter(models.Report.category == category)
    if ward_id and ward_id != 'all':
        query = query.filter(models.Report.ward_id == ward_id)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (models.Report.description_en.ilike(term)) |
            (models.Report.description_gu.ilike(term)) |
            (models.Report.description_hi.ilike(term)) |
            (models.Report.amc_ticket_id.ilike(term)) |
            (models.Report.id.ilike(term))
        )
    return query.order_by(models.Report.reported_at.desc()).all()


def get_report_by_id(db: Session, report_id: str):
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def create_report(db: Session, report: schemas.ReportCreate):
    # Always resolve the closest ward from the coordinates to maintain data integrity
    ward, dist = get_nearest_ward(db, report.lat, report.lng)
    if not ward:
        raise ValueError(f"Location ({report.lat}, {report.lng}) is outside the Ahmedabad municipal jurisdiction area ({dist/1000:.1f} km away).")
    ward_id = ward.id

    # Process and save uploaded image into backend/uploads (local disk, served at /uploads)
    saved_image_url = save_image_local(report.image_url) if report.image_url else None
    saved_verified_url = save_image_local(report.verified_image_url) if report.verified_image_url else None

    # Platform tracking reference (NOT an official AMC CCRS ticket — see ADR-0005).
    # Citizens must file officially via AMC CCRS 311 helpline 155303.
    amc_id = report.amc_ticket_id or f"AS-2026-{random.randint(10000, 99999)}"

    db_report = models.Report(
        id=f"rpt_{uuid.uuid4().hex[:8]}",  # Generate short unique ID
        ward_id=ward_id,
        description_en=report.description_en,
        description_gu=report.description_gu,
        description_hi=report.description_hi or "",
        severity=report.severity,
        status=report.status,
        category=report.category or "mixed_waste",
        amc_ticket_id=amc_id,
        amc_status=report.amc_status or "Assigned to SWM Inspector",
        amc_department=report.amc_department or "Solid Waste Management (SWM)",
        rwa_partner=report.rwa_partner or "Ahmedabad Citizen Network",
        image_url=saved_image_url,
        verified_image_url=saved_verified_url,
        upvotes=0,
        flagged=0,
        lat=report.lat,
        lng=report.lng
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def upvote_report(db: Session, report_id: str):
    report = get_report_by_id(db, report_id)
    if not report:
        return None
    report.upvotes = (report.upvotes or 0) + 1
    db.commit()
    db.refresh(report)
    return report

def verify_report_cleanup(db: Session, report_id: str, verified_image_url: str = None):
    report = get_report_by_id(db, report_id)
    if not report:
        return None
    report.status = "resolved"
    report.amc_status = "Resolved by AMC SWM"
    report.resolved_at = datetime.datetime.utcnow()
    if verified_image_url:
        saved_url = save_image_local(verified_image_url)
        report.verified_image_url = saved_url
    db.commit()
    db.refresh(report)
    return report

def flag_report(db: Session, report_id: str, reason: str):
    report = get_report_by_id(db, report_id)
    if not report:
        return None
    report.flagged = (report.flagged or 0) + 1
    report.flag_reason = reason
    db.commit()
    db.refresh(report)
    return report

def dispute_report_resolution(db: Session, report_id: str, dispute_image_url: str = None, reason: str = None):
    report = get_report_by_id(db, report_id)
    if not report:
        return None
    report.status = "unresolved"
    report.amc_status = "Re-Opened by Citizen Audit (CCRS Escalated)"
    report.flag_reason = reason or "Citizen disputed false cleanup resolution"
    report.flagged = (report.flagged or 0) + 1
    if dispute_image_url:
        saved_url = save_image_local(dispute_image_url)
        report.image_url = saved_url
        report.verified_image_url = None
    db.commit()
    db.refresh(report)
    return report

# Subscriptions crud
def get_subscription_by_email(db: Session, email: str):
    return db.query(models.Subscription).filter(models.Subscription.email == email).first()

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate):
    db_sub = models.Subscription(email=subscription.email)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

# Stats calculator crud
def get_stats(db: Session):
    # Overall counters
    total = db.query(func.count(models.Report.id)).scalar() or 0
    unresolved = db.query(func.count(models.Report.id)).filter(models.Report.status == 'unresolved').scalar() or 0
    resolved = db.query(func.count(models.Report.id)).filter(models.Report.status == 'resolved').scalar() or 0
    
    rate = (resolved / total * 100) if total > 0 else 0.0
    rate = round(rate, 1)

    # Worst Wards calculation
    worst_raw = (
        db.query(models.Report.ward_id, func.count(models.Report.id).label('count'))
        .filter(models.Report.status == 'unresolved')
        .group_by(models.Report.ward_id)
        .order_by(func.count(models.Report.id).desc())
        .limit(5)
        .all()
    )

    worst_wards = []
    for ward_id, count in worst_raw:
        ward = db.query(models.Ward).filter(models.Ward.id == ward_id).first()
        worst_wards.append({
            "ward_id": ward_id,
            "name": ward.name_en if ward else "Unknown",
            "count": count
        })

    # Full Ward Leaderboard
    wards = db.query(models.Ward).all()
    ward_leaderboard = []
    for w in wards:
        w_total = db.query(func.count(models.Report.id)).filter(models.Report.ward_id == w.id).scalar() or 0
        w_unresolved = db.query(func.count(models.Report.id)).filter(models.Report.ward_id == w.id, models.Report.status == 'unresolved').scalar() or 0
        w_resolved = db.query(func.count(models.Report.id)).filter(models.Report.ward_id == w.id, models.Report.status == 'resolved').scalar() or 0
        res_rate = round((w_resolved / w_total * 100) if w_total > 0 else 100.0, 1)
        ward_leaderboard.append({
            "ward_id": w.id,
            "name_en": w.name_en,
            "name_gu": w.name_gu,
            "zone_en": w.zone_en,
            "zone_gu": w.zone_gu,
            "total_reports": w_total,
            "unresolved": w_unresolved,
            "resolved": w_resolved,
            "resolution_rate_pct": res_rate,
            "mla_en": getattr(w, 'mla_en', 'Darshana Vaghela') or 'Darshana Vaghela'
        })
    ward_leaderboard.sort(key=lambda x: (-x["resolution_rate_pct"], -x["total_reports"]))

    # Zone breakdown
    zone_map = {}
    for w in wards:
        if w.zone_en not in zone_map:
            zone_map[w.zone_en] = {
                "zone_en": w.zone_en,
                "zone_gu": w.zone_gu,
                "total": 0,
                "unresolved": 0,
                "resolved": 0
            }
        w_reports = db.query(models.Report).filter(models.Report.ward_id == w.id).all()
        for r in w_reports:
            zone_map[w.zone_en]["total"] += 1
            if r.status == "unresolved":
                zone_map[w.zone_en]["unresolved"] += 1
            else:
                zone_map[w.zone_en]["resolved"] += 1

    # Severity distribution
    severity_dist = {
        "minor": db.query(func.count(models.Report.id)).filter(models.Report.severity == "minor").scalar() or 0,
        "moderate": db.query(func.count(models.Report.id)).filter(models.Report.severity == "moderate").scalar() or 0,
        "severe": db.query(func.count(models.Report.id)).filter(models.Report.severity == "severe").scalar() or 0,
        "critical": db.query(func.count(models.Report.id)).filter(models.Report.severity == "critical").scalar() or 0,
    }

    return {
        "total_reports": total,
        "unresolved_reports": unresolved,
        "resolution_rate": rate,
        "worst_wards": worst_wards,
        "ward_leaderboard": ward_leaderboard,
        "zone_breakdown": list(zone_map.values()),
        "severity_distribution": severity_dist
    }

# --- Pressure pipeline: escalations & ward digest (see ADR-0007) ---
def get_pilot_ward_ids():
    """Pilot focus wards from src/data/pilot.json (see ADR-0008). Tolerant: empty set when absent."""
    try:
        here = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "pilot.json"))
        with open(here, encoding="utf-8") as f:
            ids = (json.load(f) or {}).get("pilot_ward_ids") or []
        return set(ids)
    except Exception:
        return set()
def get_escalated_wards(db: Session, threshold: int = 10):
    """Wards with unresolved counts at/over threshold, worst first."""
    rows = (
        db.query(models.Report.ward_id, func.count(models.Report.id).label('count'))
        .filter(models.Report.status == 'unresolved')
        .group_by(models.Report.ward_id)
        .order_by(func.count(models.Report.id).desc())
        .all()
    )
    out = []
    for ward_id, count in rows:
        if (count or 0) < threshold:
            continue
        ward = get_ward_by_id(db, ward_id=ward_id)
        out.append({
            "ward_id": ward_id,
            "name_en": ward.name_en if ward else ward_id,
            "zone_en": ward.zone_en if ward else "",
            "unresolved": count,
            "threshold": threshold,
            "escalated": True
        })
    return out


def get_ward_digest(db: Session, limit_per_ward: int = 5):
    """Machine-readable per-ward digest for the weekly authority mailer.

    Email sending is intentionally NOT implemented (no provider configured).
    A cron job should GET this endpoint and mail it to AMC contacts.
    """
    wards = get_wards(db)
    digest = []
    pilot_ids = get_pilot_ward_ids()
    for w in wards:
        w_reports = db.query(models.Report).filter(models.Report.ward_id == w.id).all()
        total = len(w_reports)
        unresolved = [r for r in w_reports if r.status == "unresolved"]
        resolved = total - len(unresolved)
        top = sorted(unresolved, key=lambda r: (r.upvotes or 0), reverse=True)[:limit_per_ward]
        digest.append({
            "ward_id": w.id,
            "name_en": w.name_en,
            "zone_en": w.zone_en,
            "pilot": w.id in pilot_ids,
            "total_reports": total,
            "unresolved": len(unresolved),
            "resolved": resolved,
            "resolution_rate_pct": round((resolved / total * 100) if total > 0 else 100.0, 1),
            "mla_en": getattr(w, 'mla_en', '') or '',
            "top_unresolved": [
                {
                    "id": r.id,
                    "tracking_ref": r.amc_ticket_id,
                    "severity": r.severity,
                    "category": r.category,
                    "lat": r.lat,
                    "lng": r.lng,
                    "upvotes": r.upvotes or 0,
                    "reported_at": r.reported_at.isoformat() if r.reported_at else None
                }
                for r in top
            ]
        })
    digest.sort(key=lambda d: (-d["unresolved"], d["ward_id"]))
    return digest

# --- Cleanup Events CRUD ---
def get_events(db: Session, ward_id: Optional[str] = 'all', status: Optional[str] = 'all'):
    query = db.query(models.CleanupEvent)
    if ward_id and ward_id != 'all':
        query = query.filter(models.CleanupEvent.ward_id == ward_id)
    if status and status != 'all':
        query = query.filter(models.CleanupEvent.status == status)
    return query.order_by(models.CleanupEvent.created_at.desc()).all()

def get_event_by_id(db: Session, event_id: str):
    return db.query(models.CleanupEvent).filter(models.CleanupEvent.id == event_id).first()

def create_event(db: Session, event: schemas.CleanupEventCreate):
    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    ward = None
    if event.ward_id:
        ward = get_ward_by_id(db, event.ward_id)
    if not ward:
        nearest_ward, _ = get_nearest_ward(db, event.lat, event.lng)
        ward_id = nearest_ward.id if nearest_ward else None
    else:
        ward_id = ward.id

    db_event = models.CleanupEvent(
        id=event_id,
        ward_id=ward_id,
        title_en=event.title_en,
        title_gu=event.title_gu,
        title_hi=event.title_hi or event.title_en,
        description_en=event.description_en,
        description_gu=event.description_gu,
        description_hi=event.description_hi or event.description_en,
        location_name=event.location_name,
        date_time=event.date_time,
        organizer_name=event.organizer_name or "Amdavad Clean Citizen Squad",
        organizer_contact=event.organizer_contact,
        target_volunteers=event.target_volunteers or 25,
        volunteers_joined=event.volunteers_joined or 1,
        required_items=event.required_items or "Gloves, Trash Bags, Water Bottle",
        status=event.status or "upcoming",
        lat=event.lat,
        lng=event.lng
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def join_event(db: Session, event_id: str):
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None
    db_event.volunteers_joined += 1
    db.commit()
    db.refresh(db_event)
    return db_event

