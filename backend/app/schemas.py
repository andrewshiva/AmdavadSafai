from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import datetime

# --- Subscription Schemas ---
class SubscriptionBase(BaseModel):
    email: EmailStr

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    id: int
    subscribed_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Report Schemas ---
class ReportBase(BaseModel):
    ward_id: Optional[str] = None
    description_en: str
    description_gu: str
    severity: str = Field(pattern="^(minor|moderate|severe|critical)$")
    status: str = Field(default="unresolved", pattern="^(unresolved|resolved)$")
    category: Optional[str] = "mixed_waste"
    image_url: Optional[str] = None
    verified_image_url: Optional[str] = None
    upvotes: Optional[int] = 0
    flagged: Optional[int] = 0
    flag_reason: Optional[str] = None
    lat: float
    lng: float

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: str
    reported_at: datetime.datetime

    class Config:
        from_attributes = True

class UpvoteOut(BaseModel):
    id: str
    upvotes: int

class VerifyCleanupRequest(BaseModel):
    verified_image_url: Optional[str] = None
    notes: Optional[str] = None

class FlagReportRequest(BaseModel):
    reason: str
    flag_image_url: Optional[str] = None

# --- Ward Schemas ---
class WardBase(BaseModel):
    id: str
    name_en: str
    name_gu: str
    zone_en: str
    zone_gu: str
    corporator_en: str
    corporator_gu: str
    mla_en: Optional[str] = "Darshana Vaghela"
    mla_gu: Optional[str] = "દર્શના વાઘેલા"
    mla_party: Optional[str] = "BJP"
    mp_en: Optional[str] = "Hasmukh Patel"
    mp_gu: Optional[str] = "હસમુખ પટેલ"
    lat: float
    lng: float

class WardOut(WardBase):
    class Config:
        from_attributes = True

class LocationResolveRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)

class LocationResolveOut(BaseModel):
    ward: WardOut
    distance_m: float

# --- Stats Schemas ---
class WorstWardOut(BaseModel):
    ward_id: str
    name: str
    count: int

class WardLeaderboardOut(BaseModel):
    ward_id: str
    name_en: str
    name_gu: str
    zone_en: str
    zone_gu: str
    total_reports: int
    unresolved: int
    resolved: int
    resolution_rate_pct: float
    mla_en: str

class ZoneStatsOut(BaseModel):
    zone_en: str
    zone_gu: str
    total: int
    unresolved: int
    resolved: int

class SeverityStatsOut(BaseModel):
    minor: int
    moderate: int
    severe: int
    critical: int

class StatsOut(BaseModel):
    total_reports: int
    unresolved_reports: int
    resolution_rate: float
    worst_wards: List[WorstWardOut]
    ward_leaderboard: Optional[List[WardLeaderboardOut]] = None
    zone_breakdown: Optional[List[ZoneStatsOut]] = None
    severity_distribution: Optional[SeverityStatsOut] = None
