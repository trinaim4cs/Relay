#!/usr/bin/env python3
"""Verification oracle for Relay live in-browser demo and simulator integration."""

import sys
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def verify_assets() -> bool:
    index_html = REPO_ROOT / "index.html"
    app_js = REPO_ROOT / "app.js"
    style_css = REPO_ROOT / "style.css"

    if not index_html.exists() or not app_js.exists() or not style_css.exists():
        print("FAIL: Core web assets missing", file=sys.stderr)
        return False

    html_content = index_html.read_text(encoding="utf-8")
    
    # Check for live simulator components in index.html
    required_elements = [
        "sim-desktop",
        "simNotepadWindow",
        "simChromeWindow",
        "simFocusBox",
        "simSpeechText",
        "micTalkBtn",
    ]
    for el in required_elements:
        if el not in html_content:
            print(f"FAIL: index.html missing required simulator element: {el}", file=sys.stderr)
            return False

    print("VERIFIED_WEB_DEMO_ASSETS")
    return True

def verify_features() -> bool:
    app_js = REPO_ROOT / "app.js"
    if not app_js.exists():
        print("FAIL: app.js missing", file=sys.stderr)
        return False

    js_content = app_js.read_text(encoding="utf-8")

    # Check for required interactive features in app.js
    required_features = [
        "SpeechRecognition",     # Web Speech In
        "speechSynthesis",      # Web Speech Out
        "AudioContext",         # Web Audio earcons
        "listen",               # Earcon method
        "success",              # Earcon method
        "COMMAND_PRESETS",      # Interactive demo presets
        "positionFocusBox",     # UI Automation highlight simulation
        "setActiveApp",         # Window management simulation
    ]
    for feat in required_features:
        if feat not in js_content:
            print(f"FAIL: app.js missing required feature: {feat}", file=sys.stderr)
            return False

    print("VERIFIED_SIMULATOR_FEATURES")
    return True

def verify_vercel() -> bool:
    vercel_json = REPO_ROOT / "vercel.json"
    if not vercel_json.exists():
        print("FAIL: vercel.json missing", file=sys.stderr)
        return False
    content = vercel_json.read_text(encoding="utf-8")
    if "index.html" not in content or "app.js" not in content or "style.css" not in content:
        print("FAIL: vercel.json does not route core web assets", file=sys.stderr)
        return False

    print("VERIFIED_VERCEL_CONFIG")
    return True

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode == "assets":
        if not verify_assets():
            sys.exit(1)
    elif mode == "features":
        if not verify_features():
            sys.exit(1)
    elif mode == "vercel":
        if not verify_vercel():
            sys.exit(1)
    else:
        if not (verify_assets() and verify_features() and verify_vercel()):
            sys.exit(1)
