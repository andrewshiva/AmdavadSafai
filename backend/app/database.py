import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_PATH = Path(__file__).resolve().parent / "amdavad_safai.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH.as_posix()}")

# Adjust connect_args only when using SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
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
            if "description_hi" not in existing_cols:
                conn.execute(text("ALTER TABLE reports ADD COLUMN description_hi VARCHAR DEFAULT ''"))
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

