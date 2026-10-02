/**
 * RELAY — Interactive Voice OS In-Browser Simulator & Web Experience
 * Web Audio Earcons, Web Speech Recognition & Synthesis, UI Automation Desktop Simulator
 */

(function () {
  'use strict';

  // --- 1. STATE & STORAGE ---
  const state = {
    theme: localStorage.getItem('relay_theme') || 'dark',
    soundEnabled: true,
    speechEnabled: true,
    speechRate: 1.05,
    isSpeaking: false,
    isListening: false,
    activeApp: 'notepad', // notepad, chrome, explorer, settings
    pendingConfirmation: null,
    emergencyHalted: false,
  };

  // --- 2. WEB AUDIO SYNTHESIZER (RELAY PROCEDURAL EARCONS) ---
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx && AudioContext) {
      audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const earcons = {
    // Upbeat rising chirp (Wake word detected / Talk key pressed)
    listen() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    },

    // Falling chirp (Cancelled / Timeout / Ignored)
    cancel() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    },

    // Harmonic major triad chord (Verified Success)
    success() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.24);
      });
    },

    // Soft alert double-pulse (Spoken confirmation phrase needed)
    alert() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [0, 0.14].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now + delay);
        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.16, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.11);
      });
    },

    // Decisive halting siren drop (Emergency Stop)
    halt() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    },

    // Mechanical UI pattern click
    click() {
      if (!state.soundEnabled) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  };

  // --- 3. SPEECH SYNTHESIS (SPOKEN NARRATION) ---
  function speak(text, callback) {
    if (!state.speechEnabled || !('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.speechRate;
    utterance.pitch = 1.0;

    // Pick natural voice (prefer Indian English or natural US/UK)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN')) ||
                           voices.find(v => v.lang.includes('en-US')) ||
                           voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    const waveformBox = document.getElementById('simWaveform');
    utterance.onstart = () => {
      state.isSpeaking = true;
      if (waveformBox) waveformBox.classList.add('active');
    };
    utterance.onend = utterance.onerror = () => {
      state.isSpeaking = false;
      if (waveformBox) waveformBox.classList.remove('active');
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    state.isSpeaking = false;
    const waveformBox = document.getElementById('simWaveform');
    if (waveformBox) waveformBox.classList.remove('active');
  }

  // --- 4. HUD, SAFETY & UIA INSPECTOR HELPERS ---
  function updateHudStatus(tag, transcriptText) {
    const tagEl = document.getElementById('hudStatusTag');
    const transEl = document.getElementById('hudTranscript');
    if (tagEl && tag) tagEl.textContent = tag;
    if (transEl && transcriptText) transEl.textContent = transcriptText;
  }

  function updateSafetyTier(isElevated) {
    const tierEl = document.getElementById('hudSafetyTier');
    if (!tierEl) return;
    if (isElevated) {
      tierEl.textContent = 'TIER 5 (ELEVATED)';
      tierEl.classList.add('elevated');
    } else {
      tierEl.textContent = 'TIER 1 (SAFE)';
      tierEl.classList.remove('elevated');
    }
  }

  function renderUIAInspector(targetSelector, info = {}) {
    const overlay = document.getElementById('uiaInspectorOverlay');
    const badge = document.getElementById('uiaInspectorBadge');
    const desktop = document.getElementById('win11Desktop');
    if (!overlay || !desktop) return;

    if (!state.uiaOverlayEnabled || !targetSelector) {
      overlay.style.display = 'none';
      return;
    }

    const target = document.querySelector(targetSelector);
    if (!target) {
      overlay.style.display = 'none';
      return;
    }

    const dRect = desktop.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();

    const top = tRect.top - dRect.top;
    const left = tRect.left - dRect.left;
    const width = tRect.width;
    const height = tRect.height;

    overlay.style.top = `${Math.max(2, top - 3)}px`;
    overlay.style.left = `${Math.max(2, left - 3)}px`;
    overlay.style.width = `${width + 6}px`;
    overlay.style.height = `${height + 6}px`;
    overlay.style.display = 'block';

    if (badge) {
      const typeStr = info.controlType || 'UIA_Element';
      const nameStr = info.name || target.getAttribute('aria-label') || target.innerText?.slice(0, 18) || 'Item';
      badge.textContent = `[${typeStr}: ${nameStr}]`;
    }
  }

  // --- 5. WINDOW MANAGEMENT & APPS ---
  function bringToFront(winEl) {
    if (!winEl) return;
    document.querySelectorAll('.win11-window').forEach(w => {
      w.classList.remove('active');
    });
    winEl.classList.remove('minimized');
    winEl.style.display = 'flex';
    winEl.classList.add('active');
  }

  function updateTaskbarActive(appKey) {
    const items = {
      notepad: document.getElementById('tbAppNotepad'),
      explorer: document.getElementById('tbAppExplorer'),
      edge: document.getElementById('tbAppEdge'),
      settings: document.getElementById('tbAppSettings'),
    };
    Object.keys(items).forEach(k => {
      const el = items[k];
      if (el) {
        if (k === appKey) {
          el.classList.add('running', 'active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  function openNotepad() {
    state.activeApp = 'notepad';
    const win = document.getElementById('win11Notepad');
    bringToFront(win);
    updateTaskbarActive('notepad');
    renderUIAInspector('#notepadEditor', {
      controlType: 'UIA_EditControlTypeId',
      name: 'Document Text Area',
      automationId: 'txtNotepadEditor'
    });
    logTerminal("[UIA_INVOKE] Launched Microsoft Notepad via AppID: Microsoft.WindowsNotepad");
    return win;
  }

  function openExplorer() {
    state.activeApp = 'explorer';
    const win = document.getElementById('win11Explorer');
    bringToFront(win);
    updateTaskbarActive('explorer');
    renderUIAInspector('#fileRowReport', {
      controlType: 'UIA_ListItemControlTypeId',
      name: 'report-draft.docx',
      automationId: 'lstFileItem_0'
    });
    logTerminal("[UIA_INVOKE] Launched Windows File Explorer. Focused folder: Documents");
    return win;
  }

  function openEdge() {
    state.activeApp = 'edge';
    const win = document.getElementById('win11Edge');
    bringToFront(win);
    updateTaskbarActive('edge');
    renderUIAInspector('#edgeHeading', {
      controlType: 'UIA_HeadingControlTypeId',
      name: 'Repository Headline',
      automationId: 'h2RepoHeading'
    });
    logTerminal("[UIA_INVOKE] Launched Microsoft Edge. Navigated to https://github.com/trinaim4cs/Relay");
    return win;
  }

  function openSettings() {
    state.activeApp = 'settings';
    const win = document.getElementById('win11Settings');
    bringToFront(win);
    updateTaskbarActive('settings');
    renderUIAInspector('#settingsBtSwitch', {
      controlType: 'UIA_ButtonControlTypeId',
      name: 'Bluetooth Toggle Switch',
      automationId: 'btnToggleBluetooth'
    });
    logTerminal("[UIA_INVOKE] Launched Windows 11 Settings. Navigated to Bluetooth & devices");
    return win;
  }

  function typeIntoNotepad(textToType, callback) {
    openNotepad();
    const editor = document.getElementById('notepadEditor');
    if (!editor) {
      if (callback) callback();
      return;
    }
    editor.innerHTML = '';
    const str = textToType || "Meeting Notes - 12:45 PM\n1. RELAY Voice OS online.\n2. Closed-loop verification active.\n3. Zero mouse needed.";
    let i = 0;
    const typer = setInterval(() => {
      if (i < str.length) {
        const char = str[i];
        if (char === '\n') {
          editor.innerHTML += '<br/>';
        } else {
          editor.innerHTML += char;
        }
        i++;
        if (i % 3 === 0) earcons.click();
      } else {
        clearInterval(typer);
        editor.innerHTML += '<span class="typing-caret"></span>';
        earcons.success();
        logTerminal(`[UIA_VERIFIED] SendInput completed. Text verified in buffer (${str.length} chars).`);
        if (callback) callback();
      }
    }, 28);
  }

  // Expose global methods for verification tests and automation
  window.openNotepad = openNotepad;
  window.openExplorer = openExplorer;
  window.openEdge = openEdge;
  window.openSettings = openSettings;
  window.typeIntoNotepad = typeIntoNotepad;
  window.renderUIAInspector = renderUIAInspector;
  window.earcons = earcons;

  // --- 6. COMMAND PRESETS & BEHAVIOR SUITE ---
  const COMMAND_PRESETS = [
    {
      id: 'notepad_write',
      text: "open Notepad and write hello world",
      app: 'notepad',
      spoken: "Opening Notepad. Document ready. Typed: Meeting Notes. Changes verified.",
      action(cb) {
        updateHudStatus('RELAY VOICE OS • UIA INVOKE', 'Typing text via SendInput API...');
        typeIntoNotepad("Meeting Notes - Team Relay\n1. Windows 11 replica online.\n2. Sub-200ms voice control verified.\n3. Zero mouse needed.", () => {
          updateHudStatus('RELAY VOICE OS • VERIFIED', 'Notepad document content confirmed in memory.');
          if (cb) cb();
        });
      },
      steps: [
        { label: "Speech In", detail: "faster-whisper transcribed audio clip in 180 ms" },
        { label: "Compound Intent", detail: "Split: [open_app(Notepad), type('Meeting Notes')]" },
        { label: "UI Automation", detail: "Notepad window launched; SendInput text injected" },
        { label: "Verification", detail: "Post-condition: IUIAutomationTextPattern confirmed text" },
        { label: "Narration", detail: "Spoken feedback delivered via Piper neural TTS" }
      ]
    },
    {
      id: 'screen_read',
      text: "read the screen",
      app: 'notepad',
      spoken: "Screen read complete. Active window is Notepad notes.txt with 4 lines of verified text. Caret at end.",
      action(cb) {
        openNotepad();
        renderUIAInspector('#notepadEditor', {
          controlType: 'UIA_DocumentControlTypeId',
          name: 'notes.txt buffer'
        });
        earcons.success();
        updateHudStatus('RELAY VOICE OS • NARRATING', 'Describing screen controls via UIAutomationCore...');
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Heard: 'read the screen'" },
        { label: "Intent Match", detail: "Deterministic rule: DescribeScreen()" },
        { label: "UI Automation", detail: "Queried active foreground window via UIAutomationCore" },
        { label: "Verification", detail: "Cached element tree queried in single COM batch" },
        { label: "Narration", detail: "Spoken summary of active controls" }
      ]
    },
    {
      id: 'time_status',
      text: "what time is it",
      app: 'notepad',
      spoken: `It is currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Battery is at 88 percent. Wi-Fi is connected.`,
      action(cb) {
        renderUIAInspector('#win11TrayClock', {
          controlType: 'UIA_ClockControlTypeId',
          name: 'System Clock'
        });
        earcons.success();
        updateHudStatus('RELAY VOICE OS • VERIFIED', 'System time and battery query complete.');
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'what time is it'" },
        { label: "Intent Match", detail: "SystemQuery(topic='time_and_status')" },
        { label: "System API", detail: "Local system time and battery query via Win32" },
        { label: "Verification", detail: "Zero cloud lookup required (100% offline)" },
        { label: "Narration", detail: "Spoken answer generated in 0.16s" }
      ]
    },
    {
      id: 'switch_chrome',
      text: "switch to Edge and read the page",
      app: 'edge',
      spoken: "Switched to Microsoft Edge. Reading headline: Relay, Hands-Free Voice OS for Windows 10 & 11. Sub-200ms latency, zero cloud leaks.",
      action(cb) {
        openEdge();
        updateHudStatus('RELAY VOICE OS • READING WEB', 'Reading Edge article heading & paragraph...');
        renderUIAInspector('#edgeHeading', {
          controlType: 'UIA_HeadingControlTypeId',
          name: 'Repository Headline'
        });
        earcons.success();
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'switch to Edge and read the page'" },
        { label: "Intent Match", detail: "Compound: [SwitchWindow(Edge), ReadPage()]" },
        { label: "UI Automation", detail: "SetForegroundWindow called; Edge DOM hooked via UIA" },
        { label: "Verification", detail: "IUIAutomationElement.CurrentName confirms Edge focus" },
        { label: "Narration", detail: "Sentence-by-sentence streaming audio playback" }
      ]
    },
    {
      id: 'bluetooth_toggle',
      text: "turn on Bluetooth",
      app: 'settings',
      spoken: "Navigated to Windows Settings. Bluetooth is now toggled. Ready to pair.",
      action(cb) {
        openSettings();
        const sw = document.getElementById('settingsBtSwitch');
        const st = document.getElementById('settingsBtStatus');
        if (sw) sw.classList.toggle('on');
        const isOn = sw && sw.classList.contains('on');
        if (st) st.textContent = isOn ? 'Discoverable as "WORK-STATION-11" (Enabled)' : 'Bluetooth is turned Off';
        renderUIAInspector('#settingsBtSwitch', {
          controlType: 'UIA_TogglePattern',
          name: isOn ? 'Toggle ON' : 'Toggle OFF'
        });
        earcons.success();
        updateHudStatus('RELAY VOICE OS • VERIFIED', `Bluetooth setting state: ${isOn ? 'ON' : 'OFF'}`);
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'turn on Bluetooth'" },
        { label: "Intent Match", detail: "HardwareControl(device='bluetooth', state=True)" },
        { label: "UI Automation", detail: "Invoked UIA TogglePattern on Windows Settings toggle" },
        { label: "Verification", detail: "Queried ToggleState property: verified state" },
        { label: "Narration", detail: "Confirmed setting change" }
      ]
    },
    {
      id: 'safety_delete',
      text: "delete this file",
      app: 'explorer',
      spoken: "Deleting report-draft.docx is irreversible. To proceed, say: confirm delete. A simple yes will not work.",
      action(cb) {
        openExplorer();
        state.pendingConfirmation = 'delete';
        updateSafetyTier(true);
        renderUIAInspector('#fileRowReport', {
          controlType: 'UIA_ListItemControlTypeId',
          name: 'report-draft.docx [Gated Hold]'
        });
        earcons.alert();
        updateHudStatus('RELAY VOICE OS • GATED HOLD', 'Say "confirm delete" to authorize file deletion');
        logTerminal("SAFETY GATE TRIGGERED: Destructive Tier 5 Action.");
        logTerminal("Awaiting phrase 'confirm delete'. Casual 'yes' rejected.");
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'delete this file'" },
        { label: "Safety Broker", detail: "Classified as ELEVATED risk tier (destructive mutation)" },
        { label: "Gated Hold", detail: "Execution blocked; generated single-use phrase challenge" },
        { label: "Awaiting Voice", detail: "Requires verbatim phrase: 'confirm delete'" },
        { label: "Narration", detail: "Warning earcon sounded and confirmation requested" }
      ]
    },
    {
      id: 'emergency_stop',
      text: "emergency stop",
      app: 'notepad',
      spoken: "Emergency stop activated. All automation halted. Say continue when you are ready to resume.",
      action(cb) {
        earcons.halt();
        state.emergencyHalted = true;
        renderUIAInspector(null);
        updateHudStatus('RELAY VOICE OS • EMERGENCY HALT', 'All actions suspended. Say "continue" to resume.');
        logTerminal("EMERGENCY STOP HALT ENGAGED (Ctrl+Alt+Backspace).");
        logTerminal("All worker threads suspended until 'continue' command.");
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Heard: 'emergency stop'" },
        { label: "Emergency Bus", detail: "Direct interrupt bypassing execution queue" },
        { label: "Halt Signal", detail: "Dispatched cancellation tokens to all active runners" },
        { label: "Verification", detail: "All worker threads confirmed zero active mutation" },
        { label: "Narration", detail: "Halting siren played; system safely idle" }
      ]
    }
  ];

  // --- 7. PIPELINE STEPPER ANIMATION ---
  function updatePipelineStepper(steps) {
    const stepper = document.getElementById('pipelineStepper');
    if (!stepper) return;
    stepper.innerHTML = '';

    steps.forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = `pipe-card ${idx === 0 ? 'active-step' : ''}`;
      card.id = `pipeStep-${idx}`;
      card.innerHTML = `
        <span class="pipe-badge">Step 0${idx + 1}</span>
        <h4>${step.label}</h4>
        <p>${step.detail}</p>
      `;
      stepper.appendChild(card);
    });
  }

  function animateStepper(stepCount, onComplete) {
    let current = 0;
    const interval = setInterval(() => {
      const prev = document.getElementById(`pipeStep-${current - 1}`);
      if (prev) prev.classList.remove('active-step');

      const next = document.getElementById(`pipeStep-${current}`);
      if (next) {
        next.classList.add('active-step');
        current++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 280);
  }

  // --- 8. TERMINAL LOGGING ---
  function logTerminal(message) {
    const term = document.getElementById('simTerminalLog');
    if (!term) return;
    const line = document.createElement('div');
    line.className = 'term-line';
    const timestamp = new Date().toLocaleTimeString();
    line.innerHTML = `<span class="term-time">[${timestamp}]</span> <span class="term-msg">${message}</span>`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  // --- 9. COMMAND DISPATCHER & EXECUTION ---
  function executeCommand(preset) {
    if (state.emergencyHalted && preset.id !== 'continue') {
      logTerminal("BLOCKED: System is in Emergency Stop state. Say 'continue' to resume.");
      speak("System halted. Say continue to resume.");
      return;
    }

    logTerminal(`Voice Input: "${preset.text}"`);
    const speechEl = document.getElementById('simSpeechText');
    if (speechEl) speechEl.textContent = `Processing: "${preset.text}"...`;
    updateHudStatus('RELAY VOICE OS • PROCESSING', `Executing intent: "${preset.text}"`);

    // Render pipeline steps
    updatePipelineStepper(preset.steps);

    animateStepper(preset.steps.length, () => {
      preset.action(() => {
        if (speechEl) speechEl.textContent = preset.spoken;
        logTerminal(`[VERIFIED] ${preset.spoken}`);
        speak(preset.spoken);
      });
    });
  }

  function processNaturalUtterance(rawText) {
    const text = (rawText || '').trim().toLowerCase();
    if (!text) return;

    // Check emergency stop
    if (text.includes('emergency stop') || text.includes('halt everything') || text.includes('stop all')) {
      const preset = COMMAND_PRESETS.find(p => p.id === 'emergency_stop');
      executeCommand(preset);
      return;
    }

    // Check resume from emergency stop
    if (text === 'continue' || text === 'resume') {
      state.emergencyHalted = false;
      earcons.success();
      updateHudStatus('RELAY VOICE OS • STANDBY', 'Ready for your next command.');
      logTerminal("EMERGENCY STOP CLEARED. System resumed.");
      speak("Emergency stop cleared. Ready for your next command.");
      return;
    }

    // Check pending confirmation for destructive actions
    if (state.pendingConfirmation === 'delete') {
      if (text.includes('confirm delete')) {
        state.pendingConfirmation = null;
        updateSafetyTier(false);
        earcons.success();
        const item = document.getElementById('fileRowReport');
        if (item) item.style.display = 'none';
        renderUIAInspector(null);
        updateHudStatus('RELAY VOICE OS • VERIFIED', 'Confirmed delete executed. File removed to Recycle Bin.');
        logTerminal("[VERIFIED] Phrase 'confirm delete' matched. report-draft.docx moved to Recycle Bin.");
        speak("Confirmed delete received. File moved to Recycle Bin.");
        return;
      } else if (text === 'yes' || text === 'yeah' || text === 'sure') {
        earcons.alert();
        logTerminal("REJECTED: Casual affirmation ('yes') rejected for safety. Say 'confirm delete'.");
        speak("A simple yes is not sufficient. Say confirm delete to proceed, or say cancel.");
        return;
      } else if (text.includes('cancel') || text.includes('stop')) {
        state.pendingConfirmation = null;
        updateSafetyTier(false);
        earcons.cancel();
        renderUIAInspector(null);
        updateHudStatus('RELAY VOICE OS • STANDBY', 'Deletion cancelled by user.');
        logTerminal("CANCELLED: Deletion cancelled by user.");
        speak("Action cancelled.");
        return;
      }
    }

    // Match against presets or fuzzy intents
    let matched = null;
    if (text.includes('notepad') || text.includes('type') || text.includes('write')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'notepad_write');
    } else if (text.includes('time') || text.includes('battery') || text.includes('clock') || text.includes('status')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'time_status');
    } else if (text.includes('edge') || text.includes('chrome') || text.includes('read the page') || text.includes('web') || text.includes('browser')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'switch_chrome');
    } else if (text.includes('bluetooth') || text.includes('settings')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'bluetooth_toggle');
    } else if (text.includes('delete') || text.includes('remove file')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'safety_delete');
    } else if (text.includes('screen') || text.includes('read this') || text.includes('describe')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'screen_read');
    }

    if (matched) {
      executeCommand(matched);
    } else {
      earcons.cancel();
      logTerminal(`UNRECOGNIZED: "${rawText}". Asking clarification rather than guessing.`);
      speak(`I heard: ${rawText}. Say help to hear available commands.`);
    }
  }

  // --- 10. WEB SPEECH RECOGNITION (BROWSER MIC IN) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  function initSpeechRecognition() {
    if (!SpeechRecognition) {
      console.warn("Web SpeechRecognition API not supported in this browser.");
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      state.isListening = true;
      earcons.listen();
      const micBtn = document.getElementById('micTalkBtn');
      if (micBtn) {
        micBtn.classList.add('listening');
      }
      updateHudStatus('RELAY VOICE OS • LISTENING', 'Listening... speak clearly into microphone');
      logTerminal("Microphone active. Listening for spoken command...");
    };

    rec.onresult = (evt) => {
      const transcript = evt.results[0][0].transcript;
      updateHudStatus('RELAY VOICE OS • TRANSCRIBED', `Heard: "${transcript}"`);
      logTerminal(`Heard: "${transcript}" (Confidence: ${Math.round(evt.results[0][0].confidence * 100)}%)`);
      processNaturalUtterance(transcript);
    };

    rec.onerror = (err) => {
      console.error("SpeechRecognition error:", err);
      earcons.cancel();
      updateHudStatus('RELAY VOICE OS • STANDBY', 'Mic error. Click mic or type command below.');
      logTerminal(`SpeechRecognition error: ${err.error}`);
    };

    rec.onend = () => {
      state.isListening = false;
      const micBtn = document.getElementById('micTalkBtn');
      if (micBtn) {
        micBtn.classList.remove('listening');
      }
    };

    return rec;
  }

  // --- 11. WINDOW DRAGGING & CONTROLS ---
  function makeWindowDraggable(winEl, titlebarEl) {
    if (!winEl || !titlebarEl) return;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    titlebarEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('.caption-buttons') || e.target.closest('.win11-tab-close')) return;
      isDragging = true;
      bringToFront(winEl);
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = winEl.offsetLeft;
      initialTop = winEl.offsetTop;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const desktop = document.getElementById('win11Desktop');
      const maxLeft = desktop ? (desktop.clientWidth - 120) : 1000;
      const maxTop = desktop ? (desktop.clientHeight - 80) : 600;
      winEl.style.left = `${Math.max(0, Math.min(initialLeft + dx, maxLeft))}px`;
      winEl.style.top = `${Math.max(0, Math.min(initialTop + dy, maxTop))}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function setupWindowButtons(winId, minId, maxId, closeId) {
    const win = document.getElementById(winId);
    const minBtn = document.getElementById(minId);
    const maxBtn = document.getElementById(maxId);
    const closeBtn = document.getElementById(closeId);

    if (minBtn && win) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.classList.add('minimized');
        earcons.click();
      });
    }
    if (maxBtn && win) {
      maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.classList.toggle('maximized');
        earcons.click();
      });
    }
    if (closeBtn && win) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        win.style.display = 'none';
        win.classList.remove('active');
        earcons.click();
      });
    }
    if (win) {
      win.addEventListener('mousedown', () => {
        bringToFront(win);
      });
    }
  }

  function startLiveClock() {
    function tick() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
      const clockTime = document.getElementById('win11ClockTime');
      const clockDate = document.getElementById('win11ClockDate');
      if (clockTime) clockTime.textContent = timeStr;
      if (clockDate) clockDate.textContent = dateStr;
    }
    tick();
    setInterval(tick, 1000);
  }

  // --- 12. EVENT BINDINGS & DOM WIRING ---
  document.addEventListener('DOMContentLoaded', () => {
    recognition = initSpeechRecognition();
    startLiveClock();

    // 1. Draggable Windows
    makeWindowDraggable(document.getElementById('win11Notepad'), document.getElementById('notepadTitlebar'));
    makeWindowDraggable(document.getElementById('win11Explorer'), document.getElementById('explorerTitlebar'));
    makeWindowDraggable(document.getElementById('win11Edge'), document.getElementById('edgeTitlebar'));
    makeWindowDraggable(document.getElementById('win11Settings'), document.getElementById('settingsTitlebar'));

    // 2. Caption Buttons
    setupWindowButtons('win11Notepad', 'notepadBtnMin', 'notepadBtnMax', 'notepadBtnClose');
    setupWindowButtons('win11Explorer', 'explorerBtnMin', 'explorerBtnMax', 'explorerBtnClose');
    setupWindowButtons('win11Edge', 'edgeBtnMin', 'edgeBtnMax', 'edgeBtnClose');
    setupWindowButtons('win11Settings', 'settingsBtnMin', 'settingsBtnMax', 'settingsBtnClose');

    // 3. Desktop Icons Click Handlers
    const iconBinds = {
      dIconNotepad: openNotepad,
      dIconExplorer: openExplorer,
      dIconEdge: openEdge,
      dIconSettings: openSettings,
      dIconRelay: openNotepad,
      dIconRecycle: openExplorer,
    };
    Object.keys(iconBinds).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          getAudioCtx();
          earcons.click();
          iconBinds[id]();
        });
      }
    });

    // 4. Start Menu flyout & items
    const startBtn = document.getElementById('win11StartBtn');
    const startMenu = document.getElementById('win11StartMenu');
    if (startBtn && startMenu) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('open');
        earcons.click();
      });
      document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
          startMenu.classList.remove('open');
        }
      });
    }

    const startItemBinds = {
      startItemNotepad: openNotepad,
      startItemExplorer: openExplorer,
      startItemEdge: openEdge,
      startItemSettings: openSettings,
      startItemRelay: openNotepad,
    };
    Object.keys(startItemBinds).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (startMenu) startMenu.classList.remove('open');
          earcons.click();
          startItemBinds[id]();
        });
      }
    });

    // 5. Taskbar App Items
    const taskbarBinds = {
      tbAppNotepad: openNotepad,
      tbAppExplorer: openExplorer,
      tbAppEdge: openEdge,
      tbAppSettings: openSettings,
    };
    Object.keys(taskbarBinds).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          earcons.click();
          taskbarBinds[id]();
        });
      }
    });

    // 6. UIA Toggle button
    const uiaToggle = document.getElementById('hudToggleUia');
    if (uiaToggle) {
      uiaToggle.addEventListener('click', () => {
        state.uiaOverlayEnabled = !state.uiaOverlayEnabled;
        uiaToggle.classList.toggle('active', state.uiaOverlayEnabled);
        uiaToggle.textContent = state.uiaOverlayEnabled ? 'UIA: ON' : 'UIA: OFF';
        const overlay = document.getElementById('uiaInspectorOverlay');
        if (!state.uiaOverlayEnabled && overlay) {
          overlay.style.display = 'none';
        }
        earcons.click();
      });
    }

    // 7. Mic Talk Button
    const micBtn = document.getElementById('micTalkBtn');
    if (micBtn) {
      micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        getAudioCtx();
        if (state.isListening) {
          if (recognition) recognition.stop();
        } else {
          if (recognition) {
            try {
              recognition.start();
            } catch (err) {
              console.warn("Recognition already started or error:", err);
            }
          } else {
            const input = prompt("Web Speech API not enabled in this browser. Enter your command to test Relay simulator:", "open Notepad and write hello world");
            if (input) processNaturalUtterance(input);
          }
        }
      });
    }

    // 8. Hotkeys
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        if (micBtn) micBtn.click();
      }
      if (e.ctrlKey && e.altKey && e.key === 'Backspace') {
        e.preventDefault();
        const preset = COMMAND_PRESETS.find(p => p.id === 'emergency_stop');
        if (preset) executeCommand(preset);
      }
      if (e.key === 'Escape' || (e.ctrlKey && e.altKey && e.key === '.')) {
        stopSpeaking();
        earcons.cancel();
      }
    });

    // 9. Autonomous Scenario Pills
    document.querySelectorAll('.preset-pill-btn, .scenario-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const presetId = btn.getAttribute('data-preset');
        const preset = COMMAND_PRESETS.find(p => p.id === presetId);
        if (preset) executeCommand(preset);
      });
    });

    // 10. Manual Terminal Input
    const termInput = document.getElementById('simManualInput');
    const termBtn = document.getElementById('simSendBtn');
    if (termInput && termBtn) {
      const sendHandler = () => {
        const val = termInput.value.trim();
        if (val) {
          getAudioCtx();
          processNaturalUtterance(val);
          termInput.value = '';
        }
      };
      termBtn.addEventListener('click', sendHandler);
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendHandler();
      });
    }

    // 11. Soundboard Earcon Buttons
    document.querySelectorAll('.earcon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const sound = btn.getAttribute('data-sound');
        if (earcons[sound]) {
          earcons[sound]();
          logTerminal(`Earcon played: [${sound.toUpperCase()}]`);
        }
      });
    });

    // 12. Interactive Jumping Logo Balls
    const BALL_NOTES = {
      ballBlue: 329.63,   // E4
      ballYellow: 392.00, // G4
      ballGreen: 440.00,  // A4
      ballRed: 523.25     // C5
    };

    function triggerBallJump(ballElement, freq) {
      if (!ballElement) return;
      ballElement.classList.remove('jumping');
      void ballElement.offsetWidth;
      ballElement.classList.add('jumping');
      if (earcons && state.soundEnabled) {
        const ctx = getAudioCtx();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.26);
        }
      }
      setTimeout(() => {
        ballElement.classList.remove('jumping');
      }, 600);
    }

    ['ballBlue', 'ballYellow', 'ballGreen', 'ballRed'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('mouseenter', () => triggerBallJump(el, BALL_NOTES[id]));
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerBallJump(el, BALL_NOTES[id]);
      });
    });

    const logo = document.getElementById('logoInteractive');
    if (logo) {
      logo.addEventListener('click', () => {
        ['ballBlue', 'ballYellow', 'ballGreen', 'ballRed'].forEach((id, idx) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            triggerBallJump(el, BALL_NOTES[id]);
          }, idx * 75);
        });
      });
    }

    // 13. Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('relay_theme', next);
      });
    }

    // Initial launch: Notepad active
    openNotepad();
    logTerminal("RELAY Windows 11 Desktop Replica initialized. UI Automation active.");
  });

})();
