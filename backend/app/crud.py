from sqlalchemy.orm import Session
from sqlalchemy import func
from math import asin, cos, radians, sin, sqrt
import uuid
import models, schemas

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
            (models.Report.id.ilike(term))
        )
    return query.order_by(models.Report.reported_at.desc()).all()


def get_report_by_id(db: Session, report_id: str):
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def create_report(db: Session, report: schemas.ReportCreate):
    ward_id = report.ward_id
    if not ward_id:
        ward, dist = get_nearest_ward(db, report.lat, report.lng)
        if not ward:
            raise ValueError(f"Location ({report.lat}, {report.lng}) is outside the Ahmedabad municipal jurisdiction area ({dist/1000:.1f} km away).")
        ward_id = ward.id

    db_report = models.Report(
        id=f"rpt_{uuid.uuid4().hex[:8]}",  # Generate short unique ID
        ward_id=ward_id,
        description_en=report.description_en,
        description_gu=report.description_gu,
        severity=report.severity,
        status=report.status,
        category=report.category or "mixed_waste",
        image_url=report.image_url,
        verified_image_url=report.verified_image_url,
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
    if verified_image_url:
        report.verified_image_url = verified_image_url
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
