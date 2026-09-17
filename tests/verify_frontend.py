import urllib.request
import re

url = "http://127.0.0.1:5000/"
html = urllib.request.urlopen(url).read().decode("utf-8")

views = [
    "view-home",
    "view-map",
    "view-vision",
    "view-triage",
    "view-ehr",
    "view-labs",
    "view-advisories",
    "view-ivr",
    "view-dashboard",
    "view-chat"
]

all_found = True
for v in views:
    needle = f'id="{v}"'
    if needle in html:
        print(f"PASS: Found {v}")
    else:
        print(f"FAIL: Missing {v}")
        all_found = False

print("\nTag Counts:")
print("Open sections:", html.count("<section"))
print("Close sections:", html.count("</section>"))
assert html.count("<section") == html.count("</section>") == 10

scripts = [
    "offline_sync.js",
    "voice_advisory.js",
    "vision_ui.js",
    "chatbot_ui.js",
    "map_ui.js",
    "triage_ui.js",
    "ehr_ui.js",
    "lab_ui.js",
    "ivr_ui.js",
    "app.js"
]

for s in scripts:
    if f'/static/js/{s}' in html:
        print(f"PASS: Script {s} linked")
    else:
        print(f"FAIL: Script {s} not linked")
        all_found = False

if all_found:
    print("\nALL FRONTEND INTEGRITY CHECKS PASSED SUCCESSFULLY!")
else:
    print("\nSOME CHECKS FAILED!")
