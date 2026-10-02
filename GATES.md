# Gates: Integrate Live In-Browser Voice Demo & Simulator

OWNS: index.html, app.js, style.css, frontend/**, scripts/verify_web_demo.py, GATES.md

Scope: Integrate full interactive in-browser voice demo with live speech recognition, Web Audio earcons, simulated Windows desktop, and closed-loop verification into the web interface.

- [x] G1: Web application assets verified containing interactive simulator markup and speech controller
  CHECK: python3 scripts/verify_web_demo.py assets
  EXPECT: VERIFIED_WEB_DEMO_ASSETS
  EVIDENCE: automatic-evidence=v1; definition-sha256=ec0fe37ea6a32742afff4bcc1efa4f8ec3edffa94f2637e8923eaa5b5ae03c1f; exit=0; EXPECT=matched; output-sha256=3e9f5da03aee2e8b7a9952b23486e4ba96b3f40ef2f79d30daeb324f4ec0a215; output-bytes=25; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries

- [x] G2: Interactive simulator capabilities verified including Web Speech recognition, Web Audio synthesis, and UI automation simulation
  CHECK: python3 scripts/verify_web_demo.py features
  EXPECT: VERIFIED_SIMULATOR_FEATURES
  EVIDENCE: automatic-evidence=v1; definition-sha256=55763448e32a8e45a9e665c9e970e7ad3af96e003db1044c9451119ae6c330ad; exit=0; EXPECT=matched; output-sha256=4aadf1cdc2da32976b1ae2d1231ac6c955ca40b1d8c3b40cf801eb03cac7136f; output-bytes=28; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries

- [x] G3: Vercel static build and routing configuration verified for live interactive deployment
  CHECK: python3 scripts/verify_web_demo.py vercel
  EXPECT: VERIFIED_VERCEL_CONFIG
  EVIDENCE: automatic-evidence=v1; definition-sha256=af383dc8f4f36eae280b61f2bb93c855afb2c1678ba439f761cc704f1ddb41ee; exit=0; EXPECT=matched; output-sha256=4f26e156c54498d7b5a73baf4fb016164c55f527ec59cce33737747f99de38b6; output-bytes=23; shell=/bin/sh; cwd=/home/stealthtensor/EX/hacks/Relay; path=1997758aa877/20 entries
