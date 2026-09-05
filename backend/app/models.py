from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Ward(Base):
    __tablename__ = "wards"

    id = Column(String, primary_key=True, index=True)
    name_en = Column(String, nullable=False)
    name_gu = Column(String, nullable=False)
    zone_en = Column(String, nullable=False)
    zone_gu = Column(String, nullable=False)
    corporator_en = Column(String, nullable=False)
    corporator_gu = Column(String, nullable=False)
    name_hi = Column(String, nullable=True, default="")
    zone_hi = Column(String, nullable=True, default="")
    corporator_hi = Column(String, nullable=True, default="")
    mla_en = Column(String, nullable=True, default="Darshana Vaghela")
    mla_gu = Column(String, nullable=True, default="દર્શના વાઘેલા")
    mla_hi = Column(String, nullable=True, default="दर्शना वाघेला")
    mla_party = Column(String, nullable=True, default="BJP")
    mp_en = Column(String, nullable=True, default="Hasmukh Patel")
    mp_gu = Column(String, nullable=True, default="હસમુખ પટેલ")
    mp_hi = Column(String, nullable=True, default="हसमुख पटेल")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    reports = relationship("Report", back_populates="ward", cascade="all, delete-orphan")
    events = relationship("CleanupEvent", back_populates="ward", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    ward_id = Column(String, ForeignKey("wards.id"), nullable=False)
    description_en = Column(String, nullable=False)
    description_gu = Column(String, nullable=False)
    description_hi = Column(String, nullable=True, default="")
    severity = Column(String, nullable=False)  # minor, moderate, severe, critical
    status = Column(String, nullable=False)    # unresolved, resolved
    category = Column(String, nullable=False, default="mixed_waste") # mixed_waste, construction_dump, overflowing_bin, roadside_garbage, drainage_blockage
    amc_ticket_id = Column(String, nullable=True, index=True) # platform tracking ref, e.g. AS-2026-88412 (not an official AMC ticket)
    amc_status = Column(String, nullable=True, default="Assigned to SWM Inspector") # Registered, Assigned, In Progress, Resolved
    amc_department = Column(String, nullable=True, default="Solid Waste Management (SWM)")
    rwa_partner = Column(String, nullable=True, default="Ahmedabad Citizen Network")
    image_url = Column(String, nullable=True)
    verified_image_url = Column(String, nullable=True)
    upvotes = Column(Integer, default=0, nullable=False)
    flagged = Column(Integer, default=0, nullable=False)
    flag_reason = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Community verification (see ADR-0007/0008 round-2 decisions)
    verification_state = Column(String, default="unreviewed", nullable=False)  # unreviewed | pending_review | certified | disputed
    reporter_device_id = Column(String, nullable=True, default="")
    verifier_device_ids = Column(String, nullable=True, default="[]")  # JSON list of distinct device ids
    verification_lat = Column(Float, nullable=True)
    verification_lng = Column(Float, nullable=True)
    location_proof = Column(String, nullable=True, default="none")  # gps | none

    ward = relationship("Ward", back_populates="reports")

class CleanupEvent(Base):
    __tablename__ = "cleanup_events"

    id = Column(String, primary_key=True, index=True)
    ward_id = Column(String, ForeignKey("wards.id"), nullable=True)
    title_en = Column(String, nullable=False)
    title_gu = Column(String, nullable=False)
    title_hi = Column(String, nullable=True, default="")
    description_en = Column(String, nullable=False)
    description_gu = Column(String, nullable=False)
    description_hi = Column(String, nullable=True, default="")
    location_name = Column(String, nullable=False)
    date_time = Column(String, nullable=False) # e.g. "Sunday, Aug 30 • 7:00 AM"
    organizer_name = Column(String, nullable=False, default="Amdavad Clean Citizen Squad")
    organizer_contact = Column(String, nullable=True)
    target_volunteers = Column(Integer, default=25, nullable=False)
    volunteers_joined = Column(Integer, default=1, nullable=False)
    required_items = Column(String, default="Gloves, Trash Bags, Water Bottle", nullable=False)
    status = Column(String, default="upcoming", nullable=False) # upcoming, in_progress, completed
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ward = relationship("Ward", back_populates="events")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime, default=datetime.datetime.utcnow)
