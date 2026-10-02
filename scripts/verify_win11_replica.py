#!/usr/bin/env python3
"""Verification oracle for Windows 11 Desktop Replica and Relay Voice OS demo."""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def verify_desktop_canvas() -> bool:
    index_html = REPO_ROOT / "index.html"
    style_css = REPO_ROOT / "style.css"

    if not index_html.exists() or not style_css.exists():
        print("FAIL: Core files missing", file=sys.stderr)
        return False

    html = index_html.read_text(encoding="utf-8")
    css = style_css.read_text(encoding="utf-8")

    # Check for Windows 11 desktop components
    required_html = [
        "win11-desktop",
        "win11-taskbar",
        "win11-start-btn",
        "win11-tray-clock",
        "win11-window",
    ]
    for tag in required_html:
        if tag not in html:
            print(f"FAIL: Missing HTML tag {tag}", file=sys.stderr)
            return False

    # Check for Windows 11 CSS tokens
    required_css = [
        "backdrop-filter",
        "win11-window",
        "win11-taskbar",
        "caption-btn",
    ]
    for token in required_css:
        if token not in css:
            print(f"FAIL: Missing CSS token {token}", file=sys.stderr)
            return False

    print("VERIFIED_DESKTOP_CANVAS")
    return True

def verify_app_shells() -> bool:
    index_html = REPO_ROOT / "index.html"
    app_js = REPO_ROOT / "app.js"

    html = index_html.read_text(encoding="utf-8")
    js = app_js.read_text(encoding="utf-8")

    # Check for app shells
    apps = [
        "win11-notepad",
        "win11-explorer",
        "win11-edge",
        "win11-settings",
    ]
    for app in apps:
        if app not in html:
            print(f"FAIL: Missing app shell {app}", file=sys.stderr)
            return False

    # Check for interactive app behaviors in JS
    js_behaviors = [
        "openNotepad",
        "openExplorer",
        "openEdge",
        "openSettings",
        "typeIntoNotepad",
    ]
    for b in js_behaviors:
        if b not in js:
            print(f"FAIL: Missing JS behavior {b}", file=sys.stderr)
            return False

    print("VERIFIED_APP_SHELLS")
    return True

def verify_relay_hud_and_uia() -> bool:
    index_html = REPO_ROOT / "index.html"
    app_js = REPO_ROOT / "app.js"

    html = index_html.read_text(encoding="utf-8")
    js = app_js.read_text(encoding="utf-8")

    required_hud = [
        "relay-voice-hud",
        "uia-inspector-overlay",
        "hud-transcript",
    ]
    for h in required_hud:
        if h not in html:
            print(f"FAIL: Missing HUD component {h}", file=sys.stderr)
            return False

    required_js = [
        "renderUIAInspector",
        "earcons",
        "SpeechRecognition",
        "speechSynthesis",
        "confirm delete",
    ]
    for r in required_js:
        if r not in js:
            print(f"FAIL: Missing HUD/UIA logic {r}", file=sys.stderr)
            return False

    print("VERIFIED_RELAY_HUD_AND_UIA")
    return True

def verify_vercel_routing() -> bool:
    vercel_json = REPO_ROOT / "vercel.json"
    if not vercel_json.exists():
        print("FAIL: vercel.json missing", file=sys.stderr)
        return False
    content = vercel_json.read_text(encoding="utf-8")
    if "index.html" not in content or "app.js" not in content or "style.css" not in content:
        print("FAIL: vercel.json incomplete", file=sys.stderr)
        return False

    print("VERIFIED_VERCEL_ROUTING")
    return True

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode == "canvas":
        if not verify_desktop_canvas(): sys.exit(1)
    elif mode == "apps":
        if not verify_app_shells(): sys.exit(1)
    elif mode == "hud":
        if not verify_relay_hud_and_uia(): sys.exit(1)
    elif mode == "vercel":
        if not verify_vercel_routing(): sys.exit(1)
    else:
        if not (verify_desktop_canvas() and verify_app_shells() and verify_relay_hud_and_uia() and verify_vercel_routing()):
            sys.exit(1)
