"""
Pashu Suraksha - Automated Test Suite
Verifies API endpoints, triage accuracy, geospatial calculations, IVR flow, and database integrity.
"""

import sys
import os
import json
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from core.triage_engine import assess_symptoms
from core.weather_risk import calculate_environmental_risk

class TestPashuSuraksha(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ONLINE")

    def test_02_triage_fmd(self):
        res = self.client.post("/api/triage/assess", json={
            "species": "Cattle",
            "symptoms": ["oral_vesicles", "hoof_lesions", "excessive_salivation"],
            "has_fever": True,
            "affected_count": 3
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["top_diagnosis"]["code"], "FMD")
        self.assertGreater(data["top_diagnosis"]["confidence"], 70)
        self.assertEqual(data["urgency"], "CRITICAL")
        self.assertTrue(data["trigger_containment_ring"])

    def test_03_triage_anthrax_biohazard(self):
        res = self.client.post("/api/triage/assess", json={
            "species": "Cattle",
            "symptoms": ["sudden_unexplained_death", "unclotted_dark_blood"],
            "has_fever": False,
            "mortality_count": 1
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["top_diagnosis"]["code"], "ANTHRAX")
        self.assertTrue(data["is_zoonotic"])
        self.assertIn("EXTREME DANGER", data["biohazard_alert"])

    def test_04_animal_ehr(self):
        res = self.client.get("/api/animals/100982347101")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["tag_number"], "100982347101")
        self.assertIn("vaccinations", data)
        self.assertIn("treatments", data)

    def test_05_ivr_flow(self):
        # Step 1: Start
        r1 = self.client.post("/api/ivr/process", json={"step": "START"})
        self.assertEqual(r1.status_code, 200)
        d1 = r1.get_json()
        self.assertEqual(d1["next_step"], "SPECIES_SELECTION")

        # Step 2: Select Cattle (1)
        r2 = self.client.post("/api/ivr/process", json={"step": "SPECIES_SELECTION", "digits": "1"})
        self.assertEqual(r2.status_code, 200)
        d2 = r2.get_json()
        self.assertEqual(d2["selected_species"], "Cattle")

        # Step 3: Select Blisters / Salivation (1)
        r3 = self.client.post("/api/ivr/process", json={
            "step": "SYMPTOM_SELECTION",
            "digits": "1",
            "selected_species": "Cattle",
            "caller_phone": "9998887776"
        })
        self.assertEqual(r3.status_code, 200)
        d3 = r3.get_json()
        self.assertEqual(d3["next_step"], "COMPLETED")
        self.assertEqual(d3["triage_code"], "FMD")

    def test_06_weather_risk(self):
        res = self.client.get("/api/weather-risk")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(len(data), 0)
        self.assertIn("meteorological_conditions", data[0])
        self.assertIn("indices", data[0])

    def test_07_multilingual_advisories(self):
        res = self.client.get("/api/advisories/preview?alert_type=FMD_OUTBREAK&lang=hi")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("खुरपका", data["title"])
        self.assertIn("लाल दवा", data["voice_script"])

    def test_08_dashboard_stats(self):
        res = self.client.get("/api/stats/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("metrics", data)
        self.assertIn("disease_breakdown", data)

    def test_09_auth_login_credentials(self):
        res = self.client.post("/api/auth/login", json={
            "username": "farmer",
            "password": "farm123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["role"], "FARMER")
        self.assertEqual(data["user"]["full_name"], "Ramcharan Yadav")

    def test_10_auth_role_quick_switch(self):
        res = self.client.post("/api/auth/login", json={"role": "DVO"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["role"], "DVO")
        self.assertEqual(data["user"]["username"], "dvo_hisar")

    def test_11_auth_otp_flow(self):
        # Step 1: Send OTP
        r1 = self.client.post("/api/auth/otp/send", json={"phone": "9876543210"})
        self.assertEqual(r1.status_code, 200)
        d1 = r1.get_json()
        self.assertTrue(d1["success"])
        self.assertEqual(d1["simulated_otp"], "1962")

        # Step 2: Verify OTP
        r2 = self.client.post("/api/auth/otp/verify", json={"phone": "9876543210", "otp": "1962"})
        self.assertEqual(r2.status_code, 200)
        d2 = r2.get_json()
        self.assertTrue(d2["success"])
        self.assertEqual(d2["user"]["phone"], "9876543210")

    def test_12_auth_logout(self):
        res = self.client.post("/api/auth/logout")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])

    def test_13_image_diagnosis(self):
        # 1. Test Presets list
        res_presets = self.client.get("/api/image-diagnosis/presets")
        self.assertEqual(res_presets.status_code, 200)
        presets_data = res_presets.get_json()
        self.assertIsInstance(presets_data, list)
        self.assertGreaterEqual(len(presets_data), 5)

        # 2. Test Image Diagnostic analysis on LSD sample
        res_diag = self.client.post("/api/image-diagnosis", json={
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AH//2Q==",
            "filename": "lsd_cow_skin_nodule.jpg",
            "hint": "lumpy skin nodule",
            "species": "Cattle"
        })
        self.assertEqual(res_diag.status_code, 200)
        diag_data = res_diag.get_json()
        self.assertTrue(diag_data["success"])
        self.assertEqual(diag_data["disease_code"], "LSD")
        self.assertGreater(diag_data["visual_confidence"], 60)
        self.assertIn("immediate_home_care", diag_data)

    def test_14_chatbot_query(self):
        # 1. Hindi query about FMD symptoms
        res_hi = self.client.post("/api/chatbot", json={
            "message": "गाय के पैर और मुंह में छाले हैं क्या करें?",
            "language": "hi",
            "species": "Cattle"
        })
        self.assertEqual(res_hi.status_code, 200)
        data_hi = res_hi.get_json()
        self.assertTrue(data_hi["success"])
        self.assertEqual(data_hi["intent"], "FMD_TREATMENT")
        self.assertTrue(data_hi["is_emergency"])
        self.assertIn("खुरपका", data_hi["reply"])

        # 2. English query about drug withdrawal period
        res_en = self.client.post("/api/chatbot", json={
            "message": "What is the milk withdrawal time for enrofloxacin?",
            "language": "en"
        })
        self.assertEqual(res_en.status_code, 200)
        data_en = res_en.get_json()
        self.assertTrue(data_en["success"])
        self.assertEqual(data_en["intent"], "WITHDRAWAL_STEWARDSHIP")
        # 3. Marathi query about FMD
        res_mr = self.client.post("/api/chatbot", json={
            "message": "गाईच्या तोंडात आणि खुरांमध्ये फोड आहेत, काय उपाय करावा?",
            "language": "mr"
        })
        self.assertEqual(res_mr.status_code, 200)
        data_mr = res_mr.get_json()
        self.assertEqual(data_mr["intent"], "FMD_TREATMENT")
        self.assertIn("लाळ्या खुरकूत", data_mr["reply"])

        # 4. Telugu query about LSD
        res_te = self.client.post("/api/chatbot", json={
            "message": "ఆవు ఒంటిపై గడ్డలు వచ్చాయి ఏం చేయాలి?",
            "language": "te"
        })
        self.assertEqual(res_te.status_code, 200)
        data_te = res_te.get_json()
        self.assertEqual(data_te["intent"], "LSD_CARE")
        self.assertIn("లంపీ", data_te["reply"])

    def test_15_healthy_cattle_vision(self):
        # A normal healthy scan with no hints should NOT diagnose anthrax or FMD
        res = self.client.post("/api/image-diagnosis", json={
            "hint": "healthy normal routine scan",
            "language": "mr"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["disease_code"], "HEALTHY")
        self.assertEqual(data["severity"], "NORMAL")
        self.assertIn("निरोगी", data["disease_name"])

    def test_16_role_customizations(self):
        # 1. Test owner filtering for Farmer portal
        res_farmer_animals = self.client.get("/api/animals?owner=Ramcharan+Yadav")
        self.assertEqual(res_farmer_animals.status_code, 200)
        farmer_herd = res_farmer_animals.get_json()
        self.assertGreater(len(farmer_herd), 0)
        for animal in farmer_herd:
            self.assertIn("Ramcharan", animal["owner_name"])

        # 2. Test Director KPIs on dashboard
        res_dash = self.client.get("/api/stats/dashboard")
        self.assertEqual(res_dash.status_code, 200)
        dash_data = res_dash.get_json()
        self.assertIn("director_kpis", dash_data)
        stock = dash_data["director_kpis"]["vaccine_stockpile"]
        self.assertGreater(stock["fmd_doses"], 100000)
        self.assertGreater(stock["lsd_goatpox_doses"], 50000)
        indices = dash_data["director_kpis"]["epidemiological_indices"]
        self.assertIn("r0_transmission_velocity", indices)

        # 3. Test quick login for each role
        for role in ["FARMER", "PARA_VET", "DVO", "DIRECTOR"]:
            res_login = self.client.post("/api/auth/login", json={"role": role})
            self.assertEqual(res_login.status_code, 200)
            login_data = res_login.get_json()
            self.assertTrue(login_data["success"])
            self.assertEqual(login_data["user"]["role"], role)

    def test_17_advisory_role_restriction(self):
        # 1. Farmer attempt to broadcast must be rejected with 403 Forbidden
        res_farmer = self.client.post("/api/advisories/broadcast", json={
            "role": "FARMER",
            "alert_type": "FMD_OUTBREAK",
            "language": "hi",
            "radius_km": 10.0
        })
        self.assertEqual(res_farmer.status_code, 403)
        farmer_data = res_farmer.get_json()
        self.assertFalse(farmer_data["success"])
        self.assertIn("Access Denied", farmer_data["error"])

        # 2. DVO (Vet) broadcast attempt must succeed with 200 OK
        res_dvo = self.client.post("/api/advisories/broadcast", json={
            "role": "DVO",
            "alert_type": "FMD_OUTBREAK",
            "language": "hi",
            "district": "Hisar",
            "block": "Hansi",
            "radius_km": 10.0
        })
        self.assertEqual(res_dvo.status_code, 200)
        dvo_data = res_dvo.get_json()
        self.assertTrue(dvo_data["success"])
        self.assertGreater(dvo_data["farmers_reached"], 0)
        self.assertIn("SMS", dvo_data["channels_used"])

        # 3. DIRECTOR broadcast attempt must succeed with 200 OK
        res_director = self.client.post("/api/advisories/broadcast", json={
            "role": "DIRECTOR",
            "alert_type": "ANTHRAX_BIOHAZARD",
            "language": "en",
            "district": "All Districts",
            "radius_km": 25.0
        })
        self.assertEqual(res_director.status_code, 200)
        dir_data = res_director.get_json()
        self.assertTrue(dir_data["success"])
        self.assertGreater(dir_data["farmers_reached"], 0)

    def test_18_vision_catalog_and_gemini_endpoints(self):
        # 1. Test catalog retrieval
        res_cat = self.client.get("/api/vision/catalog")
        self.assertEqual(res_cat.status_code, 200)
        catalog = res_cat.get_json()
        self.assertGreaterEqual(len(catalog), 13)
        
        # Verify healthy and diseased categories exist
        categories = {item["category"] for item in catalog}
        self.assertIn("HEALTHY", categories)
        self.assertIn("DISEASED", categories)
        
        # Verify multilingual fields in catalog entries
        first = catalog[0]
        self.assertIn("title_en", first)
        self.assertIn("title_hi", first)
        self.assertIn("title_mr", first)
        self.assertIn("title_te", first)
        self.assertIn("precaution_hi", first)
        
        # 2. Test Gemini status endpoint
        res_gemini = self.client.get("/api/vision/gemini-status")
        self.assertEqual(res_gemini.status_code, 200)
        gemini_status = res_gemini.get_json()
        self.assertIn("gemini_active", gemini_status)
        self.assertIn("default_model", gemini_status)

        # 3. Test setting/clearing Gemini session key
        res_set = self.client.post("/api/vision/gemini-key", json={"api_key": "test_dummy_key_123"})
        self.assertEqual(res_set.status_code, 200)
        res_check = self.client.get("/api/vision/gemini-status")
        self.assertTrue(res_check.get_json()["gemini_active"])
        
        # Clear key
        res_clear = self.client.post("/api/vision/gemini-key", json={"api_key": ""})
        self.assertEqual(res_clear.status_code, 200)

    def test_19_sample_photos_diagnosis_and_precautionary_advice(self):
        # Test diagnosis for a healthy sample filename
        res_healthy = self.client.post("/api/image-diagnosis", json={
            "filename": "healthy_cow_muzzle.jpg",
            "language": "hi"
        })
        self.assertEqual(res_healthy.status_code, 200)
        h_data = res_healthy.get_json()
        self.assertEqual(h_data["disease_code"], "HEALTHY")
        self.assertEqual(h_data["severity"], "NORMAL")
        self.assertIn("precautionary_advice", h_data)
        self.assertTrue(len(h_data["precautionary_advice"]) > 0)
        self.assertIn("ai_engine", h_data)

        # Test diagnosis for FMD diseased sample
        res_fmd = self.client.post("/api/image-diagnosis", json={
            "filename": "fmd_oral_vesicles.jpg",
            "language": "mr"
        })
        self.assertEqual(res_fmd.status_code, 200)
        fmd_data = res_fmd.get_json()
        self.assertEqual(fmd_data["disease_code"], "FMD")
        self.assertEqual(fmd_data["severity"], "CRITICAL")
        self.assertIn("लाळ्या खुरकूत", fmd_data["disease_name"])
        self.assertIn("precautionary_advice", fmd_data)
        self.assertIn("लाल औषध", fmd_data["precautionary_advice"])

        # Test diagnosis for Anthrax sample
        res_anthrax = self.client.post("/api/image-diagnosis", json={
            "filename": "anthrax_carcass_discharge.jpg",
            "language": "te"
        })
        self.assertEqual(res_anthrax.status_code, 200)
        anthrax_data = res_anthrax.get_json()
        self.assertEqual(anthrax_data["disease_code"], "ANTHRAX")
        self.assertTrue(anthrax_data["is_zoonotic"])
        self.assertIsNotNone(anthrax_data["biohazard_alert"])

if __name__ == "__main__":
    unittest.main()



