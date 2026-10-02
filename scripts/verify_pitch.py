#!/usr/bin/env python3
"""Verification oracle for Relay codebase analysis and elevator pitch deliverables."""

import sys
from pathlib import Path
import tomllib

REPO_ROOT = Path(__file__).resolve().parent.parent

def verify_codebase_integrity() -> bool:
    # 1. Verify pyproject.toml exists and has version 0.3.3
    pyproject_path = REPO_ROOT / "pyproject.toml"
    if not pyproject_path.exists():
        print("FAIL: pyproject.toml missing", file=sys.stderr)
        return False
    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)
    version = data.get("project", {}).get("version")
    if version != "0.3.3":
        print(f"FAIL: unexpected version {version}", file=sys.stderr)
        return False

    # 2. Verify core modules exist
    expected_modules = [
        "relay/audio",
        "relay/perception",
        "relay/intent",
        "relay/planner",
        "relay/executor",
        "relay/verifier",
        "relay/safety",
        "relay/memory",
        "relay/accessibility",
        "relay/system",
    ]
    for mod in expected_modules:
        mod_path = REPO_ROOT / mod
        if not mod_path.is_dir():
            print(f"FAIL: module directory {mod} missing", file=sys.stderr)
            return False

    # 3. Verify safety tiers definition
    safety_file = REPO_ROOT / "relay/safety/policy.py"
    if not safety_file.exists():
        print("FAIL: safety/policy.py missing", file=sys.stderr)
        return False
    safety_text = safety_file.read_text(encoding="utf-8")
    for tier in ["SAFE", "REVERSIBLE", "CAUTION", "CONFIRM", "ELEVATED", "BLOCKED"]:
        if tier not in safety_text:
            print(f"FAIL: tier {tier} missing from policy.py", file=sys.stderr)
            return False

    # 4. Verify system knowledge engine exists (new Perplexity Computer voice feature)
    knowledge_file = REPO_ROOT / "relay/system/knowledge.py"
    if not knowledge_file.exists():
        print("FAIL: relay/system/knowledge.py missing", file=sys.stderr)
        return False

    print("VERIFIED_CODEBASE_INTEGRITY")
    return True

def verify_pitch_deliverable() -> bool:
    # Verify delivery file or doc exists
    pitch_file = REPO_ROOT / "docs" / "ELEVATOR_PITCH.md"
    if not pitch_file.exists():
        print("FAIL: docs/ELEVATOR_PITCH.md does not exist", file=sys.stderr)
        return False
    content = pitch_file.read_text(encoding="utf-8")

    required_keywords = [
        "Tagline",
        "Elevator Pitch",
        "Windows",
        "offline",
        "voice",
        "blind",
        "UI Automation",
        "verification",
        "safety",
        "Knowledge",
        "multi-step",
    ]
    for kw in required_keywords:
        if kw.lower() not in content.lower():
            print(f"FAIL: missing keyword {kw} in docs/ELEVATOR_PITCH.md", file=sys.stderr)
            return False

    print("VERIFIED_ELEVATOR_PITCH")
    return True

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode == "codebase":
        if not verify_codebase_integrity():
            sys.exit(1)
    elif mode == "pitch":
        if not verify_pitch_deliverable():
            sys.exit(1)
    else:
        if not verify_codebase_integrity() or not verify_pitch_deliverable():
            sys.exit(1)
