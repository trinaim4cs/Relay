# RELAY — Project Taglines & Elevator Pitch

## 1. Project Taglines

### Recommended Primary Taglines

#### 1. The Short & Punchy Tagline (< 10 words)
> **"Speak. It acts. It proves it."**

#### 2. The Comprehensive Product Tagline
> **"The voice operating system for Windows — 100% offline, verified by design."**

### Taglines by Dimension & Use Case

| Dimension | Tagline | Best For |
|---|---|---|
| **Operating System / Voice Computer** | *Your hands-free voice computer for Windows: from instant Q&A to multi-step desktop automation.* | Website Hero, Product Hunt, Demo Header |
| **Accessibility & Inclusion** | *Built for blind and low-vision individuals, powerful for every hands-free user.* | Accessibility forums, assistive tech grants, community |
| **Technical Core** | *Offline voice operating system with closed-loop UI Automation, RapidOCR, and deterministic safety.* | GitHub repo tagline, technical papers, developer pitches |
| **Trust & Integrity** | *Never assumes. Always observes. Honest PC control by voice.* | Security reviews, enterprise compliance, privacy advocates |

---

## 2. Elevator Pitches

### 30-Second Elevator Pitch (The Core)
> Traditional voice assistants either hijack your privacy by streaming everything to cloud servers, guess interfaces from screenshots, or falsely claim an action succeeded without checking. 
> 
> **RELAY** is an offline-first **Voice Operating System for Windows 10 & 11**, designed specifically for blind and low-vision people—and fast enough for any hands-free power user. You simply talk, and Relay executes: launching apps, navigating menus, dictating documents, researching instant answers, and driving multi-step autonomous desktop workflows. 
> 
> Unlike brittle chatbot wrappers, Relay combines native Windows UI Automation and RapidOCR with closed-loop verification—re-observing the system to confirm every action before speaking—and enforces a deterministic 6-tier safety engine. It runs 100% locally on standard 4 GB RAM laptops with zero subscriptions, zero cloud accounts, and seamless NVDA screen reader coexistence.

---

### 60-Second Deep Technical Pitch (Architecture & Voice Computer)
> Computer control shouldn't demand visual sight, expensive GPUs, or blind faith in probabilistic AI output. 
> 
> **RELAY** transforms Windows into an autonomous, voice-driven computer built around five tightly integrated layers:
> 1. **Offline Neural Speech & Knowledge Engine:** Embedded Whisper INT8 recognition and Piper neural TTS run locally in ~400 MB RAM on dual-core CPUs. A built-in Wikipedia Knowledge Engine delivers instant factual Q&A and extractive web summarization without cloud tokens.
> 2. **Hybrid Semantic & Visual Perception:** Bypasses brute-force screenshot polling by combining event-driven Microsoft UI Automation (`UIAutomationCore` / WinEvents) for native control trees with on-demand RapidOCR for visual-only canvas elements and legacy software.
> 3. **Autonomous Multi-Step Execution:** Supports 10+ step autonomous voice sequences (e.g. *"open Notepad, write the meeting notes, save to Documents, and email to team"*). Compound intents are split and sequenced through a deterministic runner in sub-millisecond time.
> 4. **Closed-Loop Verification:** Dispatched input is never assumed to be a success. A dedicated Verifier re-queries OS window tables, process lists, and UI element trees, classifying outcomes as `VERIFIED`, `UNCERTAIN`, or `FAILED`. Uncertain actions are journaled and never repeated blind.
> 5. **Deterministic 6-Tier Safety Broker:** Enforces strict risk gating (`SAFE`, `REVERSIBLE`, `CAUTION`, `CONFIRM`, `ELEVATED`, `BLOCKED`). High-stakes actions require exact spoken verification phrases (*"confirm delete"*, *"confirm send"*), rejecting casual *"yes"* affirmations.

---

## 3. The Problem - Solution - Proof Matrix

| Dimension | The Status Quo | What RELAY Solves | Architectural Proof in Code |
|---|---|---|---|
| **Feedback Loop** | Assistants say *"I did it"* after merely dispatching a hotkey. | Closed-loop verification checks actual system state before declaring success. | `relay/verifier/verifier.py` observes windows, processes, and UI control state. |
| **Safety & Trust** | A simple *"yes"* or background noise can trigger destructive actions. | 6 deterministic risk tiers require action-specific spoken phrases (*"confirm delete"*). | `relay/safety/policy.py` (`SAFE`, `REVERSIBLE`, `CAUTION`, `CONFIRM`, `ELEVATED`, `BLOCKED`). |
| **Privacy & Offline** | Speech and screen content stream to cloud servers. | 100% offline core; zero data leaves the machine. | `relay/audio/stt.py` (Whisper INT8), `relay/audio/tts.py` (Piper), `relay/intent/grammar.py`. |
| **Multi-Step Tasks** | Single-command brittle execution; fails on chained workflows. | 10+ step autonomous voice sequences across intent splitting and planner runner. | `relay/intent/compound.py`, `relay/planner/runner.py`, `relay/skills.py`. |
| **Knowledge & Research** | Requires paid LLM subscriptions or external browser tabs. | Built-in offline knowledge engine for instant Q&A and page summarization. | `relay/system/knowledge.py` (Wikipedia & instant research synthesis). |
| **Performance** | Bloated Electron apps and heavy vision models demanding 16 GB RAM + GPU. | Runs on budget dual-core laptops with 4 GB RAM (< 400 MB peak footprint). | Native Python/C vector bindings, cache requests, event-driven winhooks in `relay/perception/`. |
| **Screen Readers** | Voice tools hijack focus or clash noisily with NVDA/Narrator. | Cooperative detection suppresses duplicate speech and manages audio channels. | `relay/accessibility/coexist.py`, `relay/audio/devices.py` (auto-headphone routing). |
