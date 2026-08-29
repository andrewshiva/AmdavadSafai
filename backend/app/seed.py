import json
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_database():
    # Make sure tables are created
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if database is already seeded
        if db.query(models.Ward).count() > 0:
            print("Database already seeded with wards. Skipping seed.")
            return

        print("Seeding database...")

        # Load wards seed data
        candidate_ward_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "wards.json"),
            os.path.join(os.path.dirname(__file__), "data", "wards.json"),
            os.path.join(os.getcwd(), "src", "data", "wards.json"),
            os.path.join(os.getcwd(), "backend", "app", "data", "wards.json"),
        ]
        wards_file_path = next((p for p in candidate_ward_paths if os.path.exists(p)), None)
        if not wards_file_path:
            print("Warning: wards.json seed file not found. Skipping seed.")
            return

        with open(wards_file_path, "r", encoding="utf-8") as f:
            wards_data = json.load(f)

        # Load reports seed data
        candidate_report_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "reports.json"),
            os.path.join(os.path.dirname(__file__), "data", "reports.json"),
            os.path.join(os.getcwd(), "src", "data", "reports.json"),
            os.path.join(os.getcwd(), "backend", "app", "data", "reports.json"),
        ]
        reports_file_path = next((p for p in candidate_report_paths if os.path.exists(p)), None)
        reports_data = []
        if reports_file_path and os.path.exists(reports_file_path):
            with open(reports_file_path, "r", encoding="utf-8") as f:
                reports_data = json.load(f)

        # 1. Insert Wards
        print(f"Inserting {len(wards_data)} wards...")
        for ward_item in wards_data:
            db_ward = models.Ward(
                id=ward_item["id"],
                name_en=ward_item["name_en"],
                name_gu=ward_item["name_gu"],
                zone_en=ward_item["zone_en"],
                zone_gu=ward_item["zone_gu"],
                corporator_en=ward_item["corporator_en"],
                corporator_gu=ward_item["corporator_gu"],
                mla_en=ward_item.get("mla_en", "Darshana Vaghela"),
                mla_gu=ward_item.get("mla_gu", "દર્શના વાઘેલા"),
                mla_party=ward_item.get("mla_party", "BJP"),
                mp_en=ward_item.get("mp_en", "Hasmukh Patel"),
                mp_gu=ward_item.get("mp_gu", "હસમુખ પટેલ"),
                lat=ward_item["lat"],
                lng=ward_item["lng"]
            )
            db.add(db_ward)
        
        db.commit()

        # 2. Insert Reports
        print(f"Inserting {len(reports_data)} reports...")
        for report_item in reports_data:
            import datetime
            dt_str = report_item["reported_at"].replace("Z", "+00:00")
            dt = datetime.datetime.fromisoformat(dt_str)
            
            db_report = models.Report(
                id=report_item["id"],
                ward_id=report_item["ward_id"],
                description_en=report_item["description_en"],
                description_gu=report_item["description_gu"],
                severity=report_item["severity"],
                status=report_item["status"],
                category=report_item.get("category", "mixed_waste"),
                image_url=report_item.get("image_url"),
                verified_image_url=report_item.get("verified_image_url"),
                upvotes=report_item.get("upvotes", 0),
                flagged=report_item.get("flagged", 0),
                lat=report_item["lat"],
                lng=report_item["lng"],
                reported_at=dt
            )
            db.add(db_report)
        
        db.commit()
        print("Database seeding completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
