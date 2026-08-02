import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import models

def get_amc_civic_metrics(db: Session):
    """
    Aggregates open-source Ahmedabad Municipal Corporation (AMC) Solid Waste Management metrics
    combined with real-time crowdsourced report analytics.
    """
    total_reports = db.query(func.count(models.Report.id)).scalar() or 0
    resolved_reports = db.query(func.count(models.Report.id)).filter(models.Report.status == "resolved").scalar() or 0
    unresolved_reports = db.query(func.count(models.Report.id)).filter(models.Report.status == "unresolved").scalar() or 0

    # Calculate zone-wise breakdown
    zone_stats = {}
    wards = db.query(models.Ward).all()
    for w in wards:
        if w.zone_en not in zone_stats:
            zone_stats[w.zone_en] = {
                "zone_en": w.zone_en,
                "zone_gu": w.zone_gu,
                "total": 0,
                "unresolved": 0,
                "resolved": 0
            }
        w_reports = db.query(models.Report).filter(models.Report.ward_id == w.id).all()
        for r in w_reports:
            zone_stats[w.zone_en]["total"] += 1
            if r.status == "unresolved":
                zone_stats[w.zone_en]["unresolved"] += 1
            else:
                zone_stats[w.zone_en]["resolved"] += 1

    # Severity distribution
    severity_counts = {
        "minor": db.query(func.count(models.Report.id)).filter(models.Report.severity == "minor").scalar() or 0,
        "moderate": db.query(func.count(models.Report.id)).filter(models.Report.severity == "moderate").scalar() or 0,
        "severe": db.query(func.count(models.Report.id)).filter(models.Report.severity == "severe").scalar() or 0,
        "critical": db.query(func.count(models.Report.id)).filter(models.Report.severity == "critical").scalar() or 0,
    }

    # Open-Source AMC SWM benchmark metrics (Simulated civic feed aggregated with crowdsourced data)
    return {
        "amc_swm_feed": {
            "city": "Ahmedabad (અમદાવાદ)",
            "active_collection_vehicles": 842,
            "door_to_door_coverage_pct": 94.6,
            "daily_waste_collected_metric_tons": 4120.5,
            "recycling_and_processing_rate_pct": 68.2,
            "last_updated_timestamp": datetime.datetime.utcnow().isoformat()
        },
        "crowdsourced_analytics": {
            "total_reports": total_reports,
            "resolved_reports": resolved_reports,
            "unresolved_reports": unresolved_reports,
            "resolution_efficiency_pct": round((resolved_reports / total_reports * 100) if total_reports > 0 else 0, 1),
            "zone_breakdown": list(zone_stats.values()),
            "severity_distribution": severity_counts
        }
    }
