import sys, os
import datetime
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional

try:
    import models, schemas, crud, geojson_data, civic_data, ai_service
    from database import engine, get_db, apply_sqlite_migrations
    from seed import seed_database
except ImportError:
    from app import models, schemas, crud, geojson_data, civic_data, ai_service
    from app.database import engine, get_db, apply_sqlite_migrations
    from app.seed import seed_database

# Apply schema migrations and create SQLAlchemy database tables
apply_sqlite_migrations()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AmdavadSafai API",
    description="Backend API for crowdsourced garbage reporting map of Ahmedabad",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as err:
        print(f"Startup seed notice: {err}")

# Configured CORS origins (adheres to CORS spec with allow_credentials=True)
ALLOWED_ORIGINS = [
    "https://amdavad-safai-9i9g.vercel.app",
    "https://amdavadsafai.onrender.com",
    "http://localhost:5173",
    "http://localhost:5180",
    "http://localhost:5182",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5180",
    "http://127.0.0.1:5182",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount user uploaded images static directory
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- Root & Health Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AmdavadSafai Backend API",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def read_health():
    return {"status": "ok"}

# --- Endpoints ---

@app.get("/api/wards", response_model=List[schemas.WardOut])
def read_wards(db: Session = Depends(get_db)):
    return crud.get_wards(db)

@app.get("/api/wards/geojson")
def read_wards_geojson(db: Session = Depends(get_db)):
    return geojson_data.get_wards_geojson(db)

@app.post("/api/wards/resolve", response_model=schemas.LocationResolveOut)
def resolve_ward_for_location(location: schemas.LocationResolveRequest, db: Session = Depends(get_db)):
    ward, distance_m = crud.get_nearest_ward(db, lat=location.lat, lng=location.lng)
    if not ward:
        raise HTTPException(
            status_code=400,
            detail=f"Location ({location.lat:.4f}, {location.lng:.4f}) is outside Ahmedabad municipal jurisdiction area ({distance_m/1000:.1f} km away)."
        )
    return {"ward": ward, "distance_m": distance_m}

@app.get("/api/civic-metrics")
def read_civic_metrics(db: Session = Depends(get_db)):
    return civic_data.get_amc_civic_metrics(db)

@app.get("/api/reports", response_model=List[schemas.ReportOut])
def read_reports(
    severity: Optional[str] = Query('all', description="Filter reports by severity"),
    status: Optional[str] = Query('all', description="Filter reports by status"),
    category: Optional[str] = Query('all', description="Filter reports by waste category"),
    ward_id: Optional[str] = Query('all', description="Filter reports by ward ID"),
    search: Optional[str] = Query('', description="Search report description or ID"),
    db: Session = Depends(get_db)
):
    return crud.get_reports(db, severity=severity, status=status, category=category, ward_id=ward_id, search=search)


@app.get("/api/reports/{report_id}", response_model=schemas.ReportOut)
def read_report_by_id(report_id: str, db: Session = Depends(get_db)):
    report = crud.get_report_by_id(db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.post("/api/reports", response_model=schemas.ReportOut)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    # Manual ward selection remains supported; otherwise resolve from report coordinates.
    ward = crud.get_ward_by_id(db, ward_id=report.ward_id) if report.ward_id else None
    if report.ward_id and not ward:
        raise HTTPException(status_code=400, detail="Specified ward_id does not exist")
    try:
        return crud.create_report(db=db, report=report)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

@app.post("/api/reports/{report_id}/upvote", response_model=schemas.UpvoteOut)
def upvote_report(report_id: str, db: Session = Depends(get_db)):
    report = crud.upvote_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"id": report.id, "upvotes": report.upvotes}

@app.post("/api/reports/{report_id}/verify", response_model=schemas.ReportOut)
def verify_cleanup(report_id: str, payload: schemas.VerifyCleanupRequest, db: Session = Depends(get_db)):
    report = crud.verify_report_cleanup(
        db=db,
        report_id=report_id,
        verified_image_url=payload.verified_image_url,
        device_id=payload.device_id,
        verification_lat=payload.verification_lat,
        verification_lng=payload.verification_lng
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.post("/api/reports/{report_id}/flag", response_model=schemas.ReportOut)
def flag_report(report_id: str, payload: schemas.FlagReportRequest, db: Session = Depends(get_db)):
    report = crud.flag_report(db=db, report_id=report_id, reason=payload.reason)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.post("/api/reports/{report_id}/dispute", response_model=schemas.ReportOut)
def dispute_resolution(report_id: str, payload: schemas.DisputeResolutionRequest, db: Session = Depends(get_db)):
    report = crud.dispute_report_resolution(
        db=db,
        report_id=report_id,
        dispute_image_url=payload.dispute_image_url,
        reason=payload.reason
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/api/stats", response_model=schemas.StatsOut)
def read_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

# --- Pressure pipeline (see ADR-0007) ---

def _escalation_threshold() -> int:
    try:
        return max(1, int(os.getenv("ESCALATION_THRESHOLD", "10")))
    except ValueError:
        return 10

@app.get("/api/escalations")
def read_escalations(db: Session = Depends(get_db)):
    """Wards at/over the unresolved-report escalation threshold."""
    threshold = _escalation_threshold()
    return {"threshold": threshold, "escalated_wards": crud.get_escalated_wards(db, threshold=threshold)}

@app.get("/api/digest/wards")
def read_ward_digest(db: Session = Depends(get_db)):
    """Machine-readable ward digest for the weekly authority mailer (no email sent)."""
    return {"generated_at": datetime.datetime.utcnow().isoformat(), "wards": crud.get_ward_digest(db)}

@app.post("/api/subscribe", response_model=schemas.SubscriptionOut)
def create_subscription(subscription: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    db_sub = crud.get_subscription_by_email(db, email=subscription.email)
    if db_sub:
        return db_sub
    return crud.create_subscription(db=db, subscription=subscription)

# --- Cleanup Events Endpoints ---
@app.get("/api/events", response_model=List[schemas.CleanupEventOut])
def read_events(
    ward_id: Optional[str] = Query('all', description="Filter cleanup events by ward ID"),
    status: Optional[str] = Query('all', description="Filter cleanup events by status"),
    db: Session = Depends(get_db)
):
    return crud.get_events(db, ward_id=ward_id, status=status)

@app.get("/api/events/{event_id}", response_model=schemas.CleanupEventOut)
def read_event_by_id(event_id: str, db: Session = Depends(get_db)):
    event = crud.get_event_by_id(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Cleanup event not found")
    return event

@app.post("/api/events", response_model=schemas.CleanupEventOut)
def create_cleanup_event(event: schemas.CleanupEventCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_event(db=db, event=event)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

@app.post("/api/events/{event_id}/join", response_model=schemas.JoinEventOut)
def join_cleanup_event(event_id: str, db: Session = Depends(get_db)):
    event = crud.join_event(db=db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Cleanup event not found")
    return {
        "id": event.id,
        "volunteers_joined": event.volunteers_joined,
        "message": f"Successfully joined {event.title_en}!"
    }

# --- Citizen Karma & Device Identity Sync Endpoint (ack-only, see ADR-0003) ---
@app.post("/api/karma/sync")
def sync_citizen_karma(payload: dict):
    # Validates and acknowledges persistent citizen device identity.
    # LocalStorage on the client is the source of truth; nothing is persisted here.
    raw_device = payload.get("device_id", "unknown")
    device_id = raw_device if isinstance(raw_device, str) and raw_device.strip() else "unknown"
    try:
        points = int(payload.get("points", 0))
    except (TypeError, ValueError):
        points = 0
    try:
        streak_days = int(payload.get("streak_days", 0))
    except (TypeError, ValueError):
        streak_days = 0
    return {
        "status": "synced",
        "device_id": device_id,
        "acknowledged_points": max(0, points),
        "streak_days": max(0, streak_days),
        "persisted": False,
        "mode": "ack_only"
    }


# --- Live AI Model Endpoints (AmdavadSafai Civic AI) ---

@app.get("/api/ai/status")
def get_ai_status():
    """Reports status of live AI models and compute availability."""
    return {
        "status": "active",
        "mode": "ml_models" if ai_service.TORCH_AVAILABLE else "heuristic_fallback",
        "torch_available": ai_service.TORCH_AVAILABLE,
        "compute_device": ai_service.DEVICE,
        "models": {
            "triage_and_chat": "AmdavadSafai Civic AI",
            "vision_verification": "AmdavadSafai Vision AI"
        }
    }

@app.post("/api/ai/triage", response_model=schemas.AITriageResponse)
def api_triage_report(payload: schemas.AITriageRequest):
    """Automatically triage report text into AMC department, severity, and category."""
    return ai_service.triage_civic_report(description=payload.description, category=payload.category)

@app.post("/api/ai/verify-vision", response_model=schemas.AIVerifyVisionResponse)
def api_verify_cleanup_vision(payload: schemas.AIVerifyVisionRequest):
    """Calculates photographic transformation score between before and after cleanup photos."""
    return ai_service.verify_cleanup_vision(before_url=payload.before_url, after_url=payload.after_url)

@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
def api_chat_civic_assistant(payload: schemas.AIChatRequest):
    """Interactive conversational civic assistant answering citizen questions on Ahmedabad civic services."""
    return ai_service.chat_civic_assistant(message=payload.message, history=payload.history, lang=payload.lang)



