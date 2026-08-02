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
    mla_en = Column(String, nullable=True, default="Darshana Vaghela")
    mla_gu = Column(String, nullable=True, default="દર્શના વાઘેલા")
    mla_party = Column(String, nullable=True, default="BJP")
    mp_en = Column(String, nullable=True, default="Hasmukh Patel")
    mp_gu = Column(String, nullable=True, default="હસમુખ પટેલ")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    reports = relationship("Report", back_populates="ward", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    ward_id = Column(String, ForeignKey("wards.id"), nullable=False)
    description_en = Column(String, nullable=False)
    description_gu = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # minor, moderate, severe, critical
    status = Column(String, nullable=False)    # unresolved, resolved
    category = Column(String, nullable=False, default="mixed_waste") # mixed_waste, construction_dump, overflowing_bin, roadside_garbage, drainage_blockage
    image_url = Column(String, nullable=True)
    verified_image_url = Column(String, nullable=True)
    upvotes = Column(Integer, default=0, nullable=False)
    flagged = Column(Integer, default=0, nullable=False)
    flag_reason = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)

    ward = relationship("Ward", back_populates="reports")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime, default=datetime.datetime.utcnow)
