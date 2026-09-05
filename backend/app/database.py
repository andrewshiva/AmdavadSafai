import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_PATH = Path(__file__).resolve().parent / "amdavad_safai.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH.as_posix()}")

# Adjust connect_args and pool settings for high concurrency
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False, "timeout": 30} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_size=50,
    max_overflow=50,
    pool_timeout=30,
)

if is_sqlite:
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA busy_timeout=30000;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def apply_sqlite_migrations():
    """Safely adds newly introduced columns if running against an existing SQLite DB."""
    if not DATABASE_URL.startswith("sqlite"):
        return
    from sqlalchemy import text
    with engine.connect() as conn:
        # Check and add new columns to wards table
        try:
            res = conn.execute(text("PRAGMA table_info(wards)")).fetchall()
            existing_cols = {row[1] for row in res}
            for col in ["name_hi", "zone_hi", "corporator_hi", "mla_hi", "mp_hi"]:
                if col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE wards ADD COLUMN {col} VARCHAR DEFAULT ''"))
                    conn.commit()
        except Exception as e:
            print(f"Ward migration notice: {e}")

        # Check and add new columns to reports table
        try:
            res = conn.execute(text("PRAGMA table_info(reports)")).fetchall()
            existing_cols = {row[1] for row in res}
            cols_to_add = {
                "description_hi": "VARCHAR DEFAULT ''",
                "amc_ticket_id": "VARCHAR DEFAULT ''",
                "amc_status": "VARCHAR DEFAULT 'Assigned to SWM Inspector'",
                "amc_department": "VARCHAR DEFAULT 'Solid Waste Management (SWM)'",
                "rwa_partner": "VARCHAR DEFAULT 'Ahmedabad Citizen Network'",
                "resolved_at": "DATETIME",
                "verification_state": "VARCHAR DEFAULT 'unreviewed'",
                "reporter_device_id": "VARCHAR DEFAULT ''",
                "verifier_device_ids": "VARCHAR DEFAULT '[]'",
                "verification_lat": "FLOAT",
                "verification_lng": "FLOAT",
                "location_proof": "VARCHAR DEFAULT 'none'"
            }
            for col, col_type in cols_to_add.items():
                if col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE reports ADD COLUMN {col} {col_type}"))
                    conn.commit()
        except Exception as e:
            print(f"Report migration notice: {e}")

# Dependency injection generator for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

