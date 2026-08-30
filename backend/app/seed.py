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
        # 1. Insert Wards if missing
        if db.query(models.Ward).count() == 0:
            print("Seeding wards...")
            candidate_ward_paths = [
                os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "wards.json"),
                os.path.join(os.path.dirname(__file__), "data", "wards.json"),
                os.path.join(os.getcwd(), "src", "data", "wards.json"),
                os.path.join(os.getcwd(), "backend", "app", "data", "wards.json"),
            ]
            wards_file_path = next((p for p in candidate_ward_paths if os.path.exists(p)), None)
            if wards_file_path:
                with open(wards_file_path, "r", encoding="utf-8") as f:
                    wards_data = json.load(f)
                print(f"Inserting {len(wards_data)} wards...")
                for ward_item in wards_data:
                    db_ward = models.Ward(
                        id=ward_item["id"],
                        name_en=ward_item["name_en"],
                        name_gu=ward_item["name_gu"],
                        name_hi=ward_item.get("name_hi", ward_item["name_en"]),
                        zone_en=ward_item["zone_en"],
                        zone_gu=ward_item["zone_gu"],
                        zone_hi=ward_item.get("zone_hi", ward_item["zone_en"]),
                        corporator_en=ward_item["corporator_en"],
                        corporator_gu=ward_item["corporator_gu"],
                        corporator_hi=ward_item.get("corporator_hi", ward_item["corporator_en"]),
                        mla_en=ward_item.get("mla_en", "Darshana Vaghela"),
                        mla_gu=ward_item.get("mla_gu", "દર્શના વાઘેલા"),
                        mla_hi=ward_item.get("mla_hi", "दर्शना वाघेला"),
                        mla_party=ward_item.get("mla_party", "BJP"),
                        mp_en=ward_item.get("mp_en", "Hasmukh Patel"),
                        mp_gu=ward_item.get("mp_gu", "હસમુખ પટેલ"),
                        mp_hi=ward_item.get("mp_hi", "हसमुख पटेल"),
                        lat=ward_item["lat"],
                        lng=ward_item["lng"]
                    )
                    db.add(db_ward)
                db.commit()

        # 2. Insert Reports if missing
        if db.query(models.Report).count() == 0:
            print("Seeding reports...")
            candidate_report_paths = [
                os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "reports.json"),
                os.path.join(os.path.dirname(__file__), "data", "reports.json"),
                os.path.join(os.getcwd(), "src", "data", "reports.json"),
                os.path.join(os.getcwd(), "backend", "app", "data", "reports.json"),
            ]
            reports_file_path = next((p for p in candidate_report_paths if os.path.exists(p)), None)
            if reports_file_path:
                with open(reports_file_path, "r", encoding="utf-8") as f:
                    reports_data = json.load(f)
                print(f"Inserting {len(reports_data)} reports...")
                for report_item in reports_data:
                    import datetime
                    dt_str = report_item["reported_at"].replace("Z", "+00:00")
                    dt = datetime.datetime.fromisoformat(dt_str)
                    resolved_dt = None
                    if report_item.get("resolved_at"):
                        res_str = report_item["resolved_at"].replace("Z", "+00:00")
                        resolved_dt = datetime.datetime.fromisoformat(res_str)
                    db_report = models.Report(
                        id=report_item["id"],
                        ward_id=report_item["ward_id"],
                        description_en=report_item["description_en"],
                        description_gu=report_item["description_gu"],
                        description_hi=report_item.get("description_hi", report_item["description_en"]),
                        severity=report_item["severity"],
                        status=report_item["status"],
                        category=report_item.get("category", "mixed_waste"),
                        amc_ticket_id=report_item.get("amc_ticket_id"),
                        amc_status=report_item.get("amc_status", "Assigned to SWM Inspector"),
                        amc_department=report_item.get("amc_department", "Solid Waste Management (SWM)"),
                        rwa_partner=report_item.get("rwa_partner", "Ahmedabad Citizen Network"),
                        image_url=report_item.get("image_url"),
                        verified_image_url=report_item.get("verified_image_url"),
                        upvotes=report_item.get("upvotes", 0),
                        flagged=report_item.get("flagged", 0),
                        lat=report_item["lat"],
                        lng=report_item["lng"],
                        reported_at=dt,
                        resolved_at=resolved_dt
                    )
                    db.add(db_report)
                db.commit()

        # 3. Insert Cleanup Events if missing
        if db.query(models.CleanupEvent).count() == 0:
            candidate_event_paths = [
                os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "events.json"),
                os.path.join(os.path.dirname(__file__), "data", "events.json"),
                os.path.join(os.getcwd(), "src", "data", "events.json"),
                os.path.join(os.getcwd(), "backend", "app", "data", "events.json"),
            ]
            events_file_path = next((p for p in candidate_event_paths if os.path.exists(p)), None)
            if events_file_path:
                with open(events_file_path, "r", encoding="utf-8") as f:
                    events_data = json.load(f)
                print(f"Inserting {len(events_data)} cleanup events...")
                for evt_item in events_data:
                    db_event = models.CleanupEvent(
                        id=evt_item["id"],
                        ward_id=evt_item.get("ward_id"),
                        title_en=evt_item["title_en"],
                        title_gu=evt_item["title_gu"],
                        title_hi=evt_item.get("title_hi", evt_item["title_en"]),
                        description_en=evt_item["description_en"],
                        description_gu=evt_item["description_gu"],
                        description_hi=evt_item.get("description_hi", evt_item["description_en"]),
                        location_name=evt_item["location_name"],
                        date_time=evt_item["date_time"],
                        organizer_name=evt_item.get("organizer_name", "Amdavad Clean Citizen Squad"),
                        organizer_contact=evt_item.get("organizer_contact"),
                        target_volunteers=evt_item.get("target_volunteers", 25),
                        volunteers_joined=evt_item.get("volunteers_joined", 1),
                        required_items=evt_item.get("required_items", "Gloves, Trash Bags, Water Bottle"),
                        status=evt_item.get("status", "upcoming"),
                        lat=evt_item["lat"],
                        lng=evt_item["lng"]
                    )
                    db.add(db_event)
                db.commit()

        print("Database seeding completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
