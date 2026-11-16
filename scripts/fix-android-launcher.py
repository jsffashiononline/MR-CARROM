from pathlib import Path
import xml.etree.ElementTree as ET

manifest_path = Path("android/app/src/main/AndroidManifest.xml")
if not manifest_path.exists():
    raise SystemExit("AndroidManifest.xml was not generated")

ET.register_namespace("android", "http://schemas.android.com/apk/res/android")
A = "{http://schemas.android.com/apk/res/android}"
tree = ET.parse(manifest_path)
root = tree.getroot()
application = root.find("application")
if application is None:
    raise SystemExit("Android manifest has no application element")

application.set(A + "label", "JSF Sales Management")
application.set(A + "icon", "@mipmap/ic_launcher")
application.set(A + "roundIcon", "@mipmap/ic_launcher")

launcher_found = False
for activity in list(application):
    if activity.tag not in ("activity", "activity-alias"):
        continue
    for intent_filter in activity.findall("intent-filter"):
        actions = [x.get(A + "name") for x in intent_filter.findall("action")]
        categories = [x.get(A + "name") for x in intent_filter.findall("category")]
        if "android.intent.action.MAIN" in actions and "android.intent.category.LAUNCHER" in categories:
            launcher_found = True
            activity.set(A + "exported", "true")
            activity.set(A + "icon", "@mipmap/ic_launcher")
            activity.set(A + "label", "JSF Sales Management")
            break
    if launcher_found:
        break

if not launcher_found:
    activity = application.find("activity")
    if activity is None:
        raise SystemExit("No Android activity found to register as launcher")
    activity.set(A + "exported", "true")
    activity.set(A + "icon", "@mipmap/ic_launcher")
    activity.set(A + "label", "JSF Sales Management")
    intent_filter = ET.SubElement(activity, "intent-filter")
    ET.SubElement(intent_filter, "action", {A + "name": "android.intent.action.MAIN"})
    ET.SubElement(intent_filter, "category", {A + "name": "android.intent.category.LAUNCHER"})

tree.write(manifest_path, encoding="utf-8", xml_declaration=True)
print("JSF launcher icon and MAIN/LAUNCHER entry configured.")
