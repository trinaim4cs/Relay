# Gates: Rebuild Windows 11 Desktop Replica and Relay Voice OS Demo

OWNS: index.html, app.js, style.css, frontend/**, scripts/verify_win11_replica.py, GATES.md

Scope: Rebuild web demo as a high-fidelity Windows 11 desktop replica with interactive apps, floating Voice HUD, UIA inspector overlay, and procedural earcons.

- [x] G1: Windows 11 desktop canvas and window manager verified with authentic Mica styling and taskbar components
  CHECK: python3 scripts/verify_win11_replica.py canvas
  EXPECT: VERIFIED_DESKTOP_CANVAS
  EVIDENCE: automatic-evidence=v1; definition-sha256=5ec13f50988ac9c7db898ec442414dc300e53f16eab9a3d6c63c69e6f10f89dc; exit=0; EXPECT=matched; output-sha256=b26e959f90a4934d5caa3840a8ead11eb71ef46b2eb9575dea740778714abc3c; output-bytes=24; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries

- [x] G2: Authentic Windows 11 application shells verified for Notepad, File Explorer, Edge, and Settings
  CHECK: python3 scripts/verify_win11_replica.py apps
  EXPECT: VERIFIED_APP_SHELLS
  EVIDENCE: automatic-evidence=v1; definition-sha256=746bbc13c9a992317dc09911d3080e3c95049f7a784616bd06c020beb913df35; exit=0; EXPECT=matched; output-sha256=fc5e8d596d72c42c9eac0f7c2e6a4fdd1f47fafefc86ce5c1e7544d04370a152; output-bytes=20; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries

- [x] G3: Relay Floating Voice HUD and UI Automation inspection overlay verified with Web Audio and Speech controllers
  CHECK: python3 scripts/verify_win11_replica.py hud
  EXPECT: VERIFIED_RELAY_HUD_AND_UIA
  EVIDENCE: automatic-evidence=v1; definition-sha256=6572bc716af9b6ae6790f7f75b8a2907128bbb827ae15f2f18e18d037cfce430; exit=0; EXPECT=matched; output-sha256=69bb274dda35450864792ada23c1327d3f84db404e8b3e43a4ad17f85109862e; output-bytes=27; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries

- [x] G4: Vercel static build and routing configuration verified for production deployment
  CHECK: python3 scripts/verify_win11_replica.py vercel
  EXPECT: VERIFIED_VERCEL_ROUTING
  EVIDENCE: automatic-evidence=v1; definition-sha256=4c73f754a205e1714474f214215565be20d4fbb5d81e6aa8abc4d97050a1f17e; exit=0; EXPECT=matched; output-sha256=d7a5831882fbbd05ab4eba1b568ee24a74501a03840a7a2d086c17f81a3ca44c; output-bytes=24; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries
