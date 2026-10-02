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

  // --- 4. COMMAND PRESETS & BEHAVIOR SUITE ---
  const COMMAND_PRESETS = [
    {
      id: 'notepad_write',
      text: "open Notepad and write hello world",
      app: 'notepad',
      spoken: "Opening Notepad. Document ready. Typed: hello world. Changes verified.",
      action(cb) {
        setActiveApp('notepad');
        positionFocusBox('#simNotepadContent');
        const content = document.getElementById('simNotepadContent');
        if (content) {
          content.innerHTML = '<span style="color:#aaa;">// Typing via SendInput API...</span><br/>';
          let str = "hello world from RELAY voice OS!";
          let i = 0;
          const typer = setInterval(() => {
            if (i < str.length) {
              content.innerHTML += str[i];
              i++;
              if (i % 4 === 0) earcons.click();
            } else {
              clearInterval(typer);
              content.innerHTML += '<br/><span style="color:#4caf50;">[VERIFIED: Document content observed]</span>';
              earcons.success();
              if (cb) cb();
            }
          }, 35);
        } else if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "faster-whisper transcribed audio clip in 180 ms" },
        { label: "Compound Intent", detail: "Split: [open_app(Notepad), type('hello world')]" },
        { label: "UI Automation", detail: "Notepad window launched; SendInput text injected" },
        { label: "Verification", detail: "Post-condition: IUIAutomationTextPattern confirmed text" },
        { label: "Narration", detail: "Spoken feedback delivered via Piper neural TTS" }
      ]
    },
    {
      id: 'screen_read',
      text: "read the screen",
      app: 'notepad',
      spoken: "Notepad is the active window. Document contains 28 words. Caret is at line 2.",
      action(cb) {
        setActiveApp('notepad');
        positionFocusBox('#simNotepadContent');
        earcons.success();
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
        positionFocusBox('#desktopClock');
        earcons.success();
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
      text: "switch to Chrome and read the page",
      app: 'chrome',
      spoken: "Switched to Chrome. Reading heading: Assistive Tech on Windows 11. Windows UI Automation provides direct structural access to buttons, text fields, and document trees without screenshots.",
      action(cb) {
        setActiveApp('chrome');
        positionFocusBox('#chromeArticleP1');
        earcons.success();
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'switch to Chrome and read the page'" },
        { label: "Intent Match", detail: "Compound: [SwitchWindow(Chrome), ReadPage()]" },
        { label: "UI Automation", detail: "SetForegroundWindow called; Chrome DOM hooked via UIA" },
        { label: "Verification", detail: "IUIAutomationElement.CurrentName confirms Chrome focus" },
        { label: "Narration", detail: "Sentence-by-sentence streaming audio playback" }
      ]
    },
    {
      id: 'bluetooth_toggle',
      text: "turn on Bluetooth",
      app: 'settings',
      spoken: "Navigated to Windows Settings. Bluetooth is now turned ON. Ready to pair.",
      action(cb) {
        setActiveApp('settings');
        positionFocusBox('#btToggleSwitch');
        const btn = document.getElementById('btToggleSwitch');
        if (btn) {
          btn.textContent = "ON";
          btn.style.background = "#00C853";
          btn.style.color = "#ffffff";
        }
        earcons.success();
        if (cb) cb();
      },
      steps: [
        { label: "Speech In", detail: "Transcribed: 'turn on Bluetooth'" },
        { label: "Intent Match", detail: "HardwareControl(device='bluetooth', state=True)" },
        { label: "UI Automation", detail: "Invoked UIA TogglePattern on Windows Settings toggle" },
        { label: "Verification", detail: "Queried ToggleState property: verified ON" },
        { label: "Narration", detail: "Confirmed setting change" }
      ]
    },
    {
      id: 'safety_delete',
      text: "delete this file",
      app: 'explorer',
      spoken: "Deleting report-draft.docx is irreversible. To proceed, say: confirm delete. A simple yes will not work.",
      isAlert: true,
      action(cb) {
        setActiveApp('explorer');
        positionFocusBox('#explorerSelectedItem');
        earcons.alert();
        state.pendingConfirmation = 'delete';
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
        positionFocusBox(null);
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

  // --- 5. WINDOW MANAGEMENT & FOCUS BOX ---
  function setActiveApp(appKey) {
    state.activeApp = appKey;
    const windows = {
      notepad: document.getElementById('simNotepadWindow'),
      chrome: document.getElementById('simChromeWindow'),
      explorer: document.getElementById('simExplorerWindow'),
      settings: document.getElementById('simSettingsWindow'),
    };
    const taskbarIcons = {
      notepad: document.getElementById('tbNotepad'),
      chrome: document.getElementById('tbChrome'),
      explorer: document.getElementById('tbExplorer'),
      settings: document.getElementById('tbSettings'),
    };

    Object.keys(windows).forEach((key) => {
      const win = windows[key];
      const icon = taskbarIcons[key];
      if (win) {
        if (key === appKey) {
          win.classList.remove('inactive');
          win.classList.add('active');
        } else {
          win.classList.add('inactive');
          win.classList.remove('active');
        }
      }
      if (icon) {
        icon.classList.toggle('running', key === appKey);
      }
    });

    const activeAppBadge = document.getElementById('currentActiveApp');
    if (activeAppBadge) activeAppBadge.textContent = appKey.charAt(0).toUpperCase() + appKey.slice(1);
  }

  function positionFocusBox(targetSelector) {
    const focusBox = document.getElementById('simFocusBox');
    const desktop = document.getElementById('simDesktop');
    if (!focusBox || !desktop) return;

    if (!targetSelector || targetSelector === '#simDesktop') {
      focusBox.classList.remove('visible');
      return;
    }

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) {
      focusBox.classList.remove('visible');
      return;
    }

    const dRect = desktop.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();

    const top = tRect.top - dRect.top;
    const left = tRect.left - dRect.left;
    const width = tRect.width;
    const height = tRect.height;

    focusBox.style.top = `${Math.max(4, top - 4)}px`;
    focusBox.style.left = `${Math.max(4, left - 4)}px`;
    focusBox.style.width = `${width + 8}px`;
    focusBox.style.height = `${height + 8}px`;
    focusBox.classList.add('visible');
  }

  // --- 6. PIPELINE STEPPER ANIMATION ---
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

  // --- 7. TERMINAL LOGGING ---
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

  // --- 8. COMMAND DISPATCHER & EXECUTION ---
  function executeCommand(preset) {
    if (state.emergencyHalted && preset.id !== 'continue') {
      logTerminal("BLOCKED: System is in Emergency Stop state. Say 'continue' to resume.");
      speak("System halted. Say continue to resume.");
      return;
    }

    logTerminal(`Voice Input: "${preset.text}"`);
    const speechEl = document.getElementById('simSpeechText');
    if (speechEl) speechEl.textContent = `Processing: "${preset.text}"...`;

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
    if (text.includes('emergency stop') || text.includes('halt everything')) {
      const preset = COMMAND_PRESETS.find(p => p.id === 'emergency_stop');
      executeCommand(preset);
      return;
    }

    // Check resume from emergency stop
    if (text === 'continue' || text === 'resume') {
      state.emergencyHalted = false;
      earcons.success();
      logTerminal("EMERGENCY STOP CLEARED. System resumed.");
      speak("Emergency stop cleared. Ready for your next command.");
      return;
    }

    // Check pending confirmation
    if (state.pendingConfirmation === 'delete') {
      if (text.includes('confirm delete')) {
        state.pendingConfirmation = null;
        earcons.success();
        const item = document.getElementById('explorerSelectedItem');
        if (item) item.style.display = 'none';
        logTerminal("[VERIFIED] Confirmed delete matched. report-draft.docx moved to Recycle Bin.");
        speak("Confirmed delete received. File moved to Recycle Bin.");
        return;
      } else if (text === 'yes' || text === 'yeah' || text === 'sure') {
        earcons.alert();
        logTerminal("REJECTED: Casual affirmation ('yes') rejected for safety. Say 'confirm delete'.");
        speak("A simple yes is not sufficient. Say confirm delete to proceed, or say cancel.");
        return;
      } else if (text.includes('cancel') || text.includes('stop')) {
        state.pendingConfirmation = null;
        earcons.cancel();
        logTerminal("CANCELLED: Deletion cancelled by user.");
        speak("Action cancelled.");
        return;
      }
    }

    // Match against presets or fuzzy intents
    let matched = null;
    if (text.includes('notepad') || text.includes('type') || text.includes('write')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'notepad_write');
    } else if (text.includes('time') || text.includes('battery') || text.includes('status')) {
      matched = COMMAND_PRESETS.find(p => p.id === 'time_status');
    } else if (text.includes('chrome') || text.includes('read the page') || text.includes('web')) {
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

  // --- 9. WEB SPEECH RECOGNITION (BROWSER MIC IN) ---
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
        micBtn.innerHTML = `
          <span class="mic-pulse-ring"></span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          <span>Listening... Speak now</span>
        `;
      }
      logTerminal("Microphone active. Listening for spoken command...");
    };

    rec.onresult = (evt) => {
      const transcript = evt.results[0][0].transcript;
      logTerminal(`Heard: "${transcript}" (Confidence: ${Math.round(evt.results[0][0].confidence * 100)}%)`);
      processNaturalUtterance(transcript);
    };

    rec.onerror = (err) => {
      console.error("SpeechRecognition error:", err);
      earcons.cancel();
      logTerminal(`SpeechRecognition error: ${err.error}`);
    };

    rec.onend = () => {
      state.isListening = false;
      const micBtn = document.getElementById('micTalkBtn');
      if (micBtn) {
        micBtn.classList.remove('listening');
        micBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          <span>Click to Speak (or press Alt+Space)</span>
        `;
      }
    };

    return rec;
  }

  // --- 10. EVENT BINDINGS & DOM WIRING ---
  document.addEventListener('DOMContentLoaded', () => {
    recognition = initSpeechRecognition();

    // 1. Mic Talk Button
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
            // Fallback for browsers without Web Speech (prompt)
            const input = prompt("Web Speech API not enabled in this browser. Enter your command to test Relay simulator:", "open Notepad and write hello world");
            if (input) processNaturalUtterance(input);
          }
        }
      });
    }

    // 2. Hotkey Alt+Space for Push-to-Talk
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        if (micBtn) micBtn.click();
      }
      // Emergency stop key: Ctrl+Alt+Backspace
      if (e.ctrlKey && e.altKey && e.key === 'Backspace') {
        e.preventDefault();
        const preset = COMMAND_PRESETS.find(p => p.id === 'emergency_stop');
        if (preset) executeCommand(preset);
      }
      // Stop speech: Escape or Ctrl+Alt+.
      if (e.key === 'Escape' || (e.ctrlKey && e.altKey && e.key === '.')) {
        stopSpeaking();
        earcons.cancel();
      }
    });

    // 3. Preset Action Pills
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const presetId = btn.getAttribute('data-preset');
        const preset = COMMAND_PRESETS.find(p => p.id === presetId);
        if (preset) executeCommand(preset);
      });
    });

    // 4. Manual Terminal Input
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

    // 5. Soundboard Buttons
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

    // 6. Interactive Jumping Logo Balls
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

    // 7. Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('relay_theme', next);
      });
    }

    // 8. Taskbar click handlers
    ['tbNotepad', 'tbChrome', 'tbExplorer', 'tbSettings'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          const app = id.replace('tb', '').toLowerCase();
          setActiveApp(app);
          earcons.click();
          logTerminal(`User switched active app to ${app.toUpperCase()} via taskbar`);
        });
      }
    });

    // Initial setup
    setActiveApp('notepad');
    positionFocusBox('#simNotepadContent');
    logTerminal("RELAY Browser Simulator initialized. Web Audio & Speech ready.");
  });

})();
