import unittest
import sys
import os

# Add backend/app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import crud

class TestStrictGeofence(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_valid_ahmedabad_locations(self):
        valid_coords = [
            ("Maninagar", 23.0034, 72.6041),
            ("Navrangpura", 23.0373, 72.5620),
            ("Bopal", 23.0330, 72.4640),
            ("Gota", 23.0900, 72.5350),
            ("Naroda", 23.0750, 72.6600),
            ("Chandkheda", 23.1118, 72.5804),
            ("Sabarmati", 23.0800, 72.5900),
            ("Vastrapur", 23.0350, 72.5290),
        ]
        for name, lat, lng in valid_coords:
            ward, dist = crud.get_nearest_ward(self.db, lat, lng)
            self.assertIsNotNone(ward, f"Expected {name} ({lat}, {lng}) to be resolved inside Ahmedabad")

            res = self.client.post("/api/wards/resolve", json={"lat": lat, "lng": lng})
            self.assertEqual(res.status_code, 200, f"Resolve endpoint failed for {name}: {res.text}")
            self.assertIn("ward", res.json())

    def test_outside_ahmedabad_locations_rejected(self):
        outside_coords = [
            ("Gandhinagar Infocity", 23.1925, 72.6277),
            ("Bhat Gandhinagar", 23.1350, 72.6200),
            ("Koba Circle", 23.1600, 72.6300),
            ("Sanand GIDC", 22.9900, 72.3800),
            ("Kalol", 23.2300, 72.4900),
            ("Mumbai", 19.0760, 72.8777),
            ("Delhi", 28.6139, 77.2090),
            ("Surat", 21.1702, 72.8311),
        ]
        for name, lat, lng in outside_coords:
            ward, dist = crud.get_nearest_ward(self.db, lat, lng)
            self.assertIsNone(ward, f"Expected {name} ({lat}, {lng}) to be rejected as outside Ahmedabad")

            # Resolve endpoint must return 400
            res = self.client.post("/api/wards/resolve", json={"lat": lat, "lng": lng})
            self.assertEqual(res.status_code, 400, f"Resolve endpoint should have returned 400 for {name}")
            self.assertIn("outside Ahmedabad", res.json().get("detail", ""))

            # Create report must return 400
            report_res = self.client.post("/api/reports", json={
                "lat": lat,
                "lng": lng,
                "description_en": f"Testing outside {name}",
                "description_gu": f"બહાર {name}",
                "severity": "minor",
                "status": "unresolved",
                "category": "roadside_garbage"
            })
            self.assertEqual(report_res.status_code, 400, f"Report should have been rejected for {name}")
            self.assertIn("outside", report_res.json().get("detail", "").lower())

            # Create event must return 400
            event_res = self.client.post("/api/events", json={
                "lat": lat,
                "lng": lng,
                "title_en": f"Outside Clean Drive {name}",
                "title_gu": f"સફાઈ ડ્રાઈવ {name}",
                "description_en": f"Cleanup drive at {name}",
                "description_gu": f"સફાઈ અભિયાન {name}",
                "location_name": name,
                "date_time": "2026-09-10 10:00"
            })
            self.assertEqual(event_res.status_code, 400, f"Event should have been rejected for {name}")
            self.assertIn("outside", event_res.json().get("detail", "").lower())

if __name__ == "__main__":
    unittest.main()
