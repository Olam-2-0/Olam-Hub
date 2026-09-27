/**
 * AURA LIQUID — Application Engine & State Architecture
 * Apple Minimalist x Liquid Glass Student Life & Wellness OS
 * Monochromatic Black & White Accents with Luxca / Glamore Editorial Styling
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Web Audio Synthesizer (Zero-dependency Ambient Sound & UI Feedback)
  // --------------------------------------------------------------------------
  class AuraAudioEngine {
    constructor() {
      this.ctx = null;
      this.currentMode = 'none'; // 'rain' | 'binaural' | 'cosmic' | 'none'
      this.nodes = [];
      this.volume = 0.4;
      this.masterGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      }
    }

    stopAmbient() {
      this.nodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.nodes = [];
      this.currentMode = 'none';
    }

    playAmbient(mode) {
      this.init();
      this.stopAmbient();

      if (mode === 'none') return;
      this.currentMode = mode;

      if (mode === 'rain') {
        // Filtered white/pink noise for rain on glass
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.18;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.masterGain);
        whiteNoise.start();
        this.nodes.push(whiteNoise, filter);

      } else if (mode === 'binaural') {
        // 40Hz Gamma Focus Binaural Beats (200Hz Left, 240Hz Right)
        const merger = this.ctx.createChannelMerger(2);

        const oscL = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, this.ctx.currentTime);

        const oscR = this.ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, this.ctx.currentTime);

        const gainL = this.ctx.createGain();
        gainL.gain.setValueAtTime(0.2, this.ctx.currentTime);

        const gainR = this.ctx.createGain();
        gainR.gain.setValueAtTime(0.2, this.ctx.currentTime);

        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        merger.connect(this.masterGain);

        oscL.start();
        oscR.start();
        this.nodes.push(oscL, oscR, gainL, gainR, merger);

      } else if (mode === 'cosmic') {
        // Deep resonant cosmic drone
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc2.start();
        this.nodes.push(osc, osc2, filter, gain);
      }
    }

    playChime(type = 'success') {
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        if (type === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === 'breath') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
        }
      } catch (e) {}
    }
  }

  const audio = new AuraAudioEngine();

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const STATE = {
    tasks: [
      { id: 't1', title: 'Data Structures: Red-Black Tree Implementation', course: 'CS 210', due: 'Tomorrow, 11:59 PM', weight: 'Deep', weightScore: 30, completed: false },
      { id: 't2', title: 'Discrete Math: Graph Theory Problem Set #4', course: 'MATH 240', due: 'In 2 days', weight: 'Deep', weightScore: 25, completed: false },
      { id: 't3', title: 'Cognitive Psychology: Sleep & Memory Synthesis', course: 'PSYC 101', due: 'Friday', weight: 'Moderate', weightScore: 15, completed: true },
      { id: 't4', title: 'Interactive Web Systems: Liquid Glass UI Prototype', course: 'INFO 350', due: 'In 3 days', weight: 'Moderate', weightScore: 20, completed: false },
      { id: 't5', title: 'Campus Peer Mentorship: Weekly Reflection Log', course: 'WELL 100', due: 'Sunday', weight: 'Light', weightScore: 10, completed: true }
    ],
    focusMinutesToday: 75,
    focusTargetMinutes: 100,
    activeTab: 'all',
    timer: {
      mode: 50, // minutes
      remainingSeconds: 50 * 60,
      totalSeconds: 50 * 60,
      isRunning: false,
      intervalId: null
    },
    wellness: {
      mood: 'balanced', // serene, balanced, stretched, heavy, overwhelmed
      journalWin: 'Completed Red-Black Tree rotation logic without syntax bugs.'
    },
    habits: [
      { id: 'h1', title: 'Morning Sunlight & 500ml Hydration', streak: 12, completed: true },
      { id: 'h2', title: '50-min Deep Academic Sprint (No Phone)', streak: 7, completed: true },
      { id: 'h3', title: 'Post-Lecture 10-Minute Concept Recall', streak: 4, completed: false },
      { id: 'h4', title: '4-7-8 Circadian Wind-down & Screen Dark Mode', streak: 18, completed: false }
    ],
    peerPods: [
      { id: 'p1', name: 'Silent Library 4th Floor Pod', count: 24, course: 'Deep Focus', joined: false },
      { id: 'p2', name: 'CS Algorithm & LeetCode Sprint', count: 12, course: 'CS 210 / Math', joined: true },
      { id: 'p3', name: 'Pre-Med Flashcard Accountability', count: 8, course: 'Bio & Psych', joined: false }
    ],
    gpaTarget: 3.85,
    credits: 16
  };

  // --------------------------------------------------------------------------
  // Core UI Updaters
  // --------------------------------------------------------------------------

  // Clock in Top Nav
  function updateNavClock() {
    const clockEl = document.getElementById('nav-live-clock');
    if (!clockEl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    clockEl.innerHTML = `<span style="opacity: 0.55;">${dayStr} • </span>${timeStr}`;
  }
  setInterval(updateNavClock, 1000);
  updateNavClock();

  // Apple-Style Concentric Rings Calculation
  function updateConcentricRings() {
    const totalTasks = STATE.tasks.length;
    const completedTasks = STATE.tasks.filter(t => t.completed).length;
    const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const focusPct = Math.min(100, Math.round((STATE.focusMinutesToday / STATE.focusTargetMinutes) * 100));

    const totalHabits = STATE.habits.length;
    const completedHabits = STATE.habits.filter(h => h.completed).length;
    const habitPct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // SVG stroke-dashoffset (Circumference: 2 * PI * r)
    // Ring 1: r = 70 -> Circ = 439.8
    const r1 = document.getElementById('ring-progress-1');
    if (r1) {
      const circ1 = 2 * Math.PI * 70;
      r1.style.strokeDasharray = `${circ1}`;
      r1.style.strokeDashoffset = `${circ1 * (1 - taskPct / 100)}`;
    }

    // Ring 2: r = 52 -> Circ = 326.7
    const r2 = document.getElementById('ring-progress-2');
    if (r2) {
      const circ2 = 2 * Math.PI * 52;
      r2.style.strokeDasharray = `${circ2}`;
      r2.style.strokeDashoffset = `${circ2 * (1 - focusPct / 100)}`;
    }

    // Ring 3: r = 34 -> Circ = 213.6
    const r3 = document.getElementById('ring-progress-3');
    if (r3) {
      const circ3 = 2 * Math.PI * 34;
      r3.style.strokeDasharray = `${circ3}`;
      r3.style.strokeDashoffset = `${circ3 * (1 - habitPct / 100)}`;
    }

    // Overall Holistic Score
    const holisticScore = Math.round((taskPct * 0.4) + (focusPct * 0.35) + (habitPct * 0.25));
    const scoreValEl = document.getElementById('rings-center-val');
    if (scoreValEl) scoreValEl.textContent = `${holisticScore}%`;

    // Legend texts
    const leg1 = document.getElementById('legend-val-tasks');
    if (leg1) leg1.textContent = `${completedTasks}/${totalTasks}`;

    const leg2 = document.getElementById('legend-val-focus');
    if (leg2) leg2.textContent = `${STATE.focusMinutesToday}m`;

    const leg3 = document.getElementById('legend-val-habits');
    if (leg3) leg3.textContent = `${completedHabits}/${totalHabits}`;
  }

  // --------------------------------------------------------------------------
  // Module 1: Academic Workload & Cognitive Balance
  // --------------------------------------------------------------------------
  function calculateCognitiveLoad() {
    const pendingTasks = STATE.tasks.filter(t => !t.completed);
    let totalScore = 0;
    pendingTasks.forEach(t => {
      totalScore += t.weightScore;
    });

    const meterScoreEl = document.getElementById('cog-score-val');
    const meterDescEl = document.getElementById('cog-score-desc');
    if (!meterScoreEl) return;

    if (totalScore <= 35) {
      meterScoreEl.textContent = `${totalScore}% • OPTIMAL FLOW`;
      meterScoreEl.style.background = 'var(--btn-primary-bg)';
      meterScoreEl.style.color = 'var(--btn-primary-text)';
      if (meterDescEl) meterDescEl.textContent = 'Workload is balanced. High cognitive clarity for deep conceptual retention.';
    } else if (totalScore <= 65) {
      meterScoreEl.textContent = `${totalScore}% • MODERATE LOAD`;
      meterScoreEl.style.background = 'rgba(234, 179, 8, 0.15)';
      meterScoreEl.style.color = '#ca8a04';
      if (meterDescEl) meterDescEl.textContent = 'Significant commitments approaching. Stagger deadlines & avoid multi-tasking.';
    } else {
      meterScoreEl.textContent = `${totalScore}% • HIGH STRAIN ALERT`;
      meterScoreEl.style.background = 'rgba(239, 68, 68, 0.15)';
      meterScoreEl.style.color = '#dc2626';
      if (meterDescEl) meterDescEl.textContent = 'High cognitive strain detected. Recommend delegating non-essentials or taking 4-7-8 breathing breaks.';
    }
  }

  function renderTasks(filter = 'all') {
    const listEl = document.getElementById('academic-task-list');
    if (!listEl) return;

    let filtered = STATE.tasks;
    if (filter === 'due-today') {
      filtered = STATE.tasks.filter(t => t.due.toLowerCase().includes('tomorrow') || t.due.toLowerCase().includes('today'));
    } else if (filter === 'deep-work') {
      filtered = STATE.tasks.filter(t => t.weight === 'Deep');
    } else if (filter === 'cs') {
      filtered = STATE.tasks.filter(t => t.course.startsWith('CS') || t.course.startsWith('INFO'));
    }

    listEl.innerHTML = '';

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-row ${task.completed ? 'done' : ''}`;
      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" aria-label="Mark task done">
          <div>
            <div class="task-name">${task.title}</div>
            <div class="task-meta">📅 ${task.due} • ⚡ ${task.weight} Intensity (${task.weightScore} pts)</div>
          </div>
        </div>
        <div class="task-badges">
          <span class="pill-badge" style="font-size: 0.6875rem;">${task.course}</span>
          <button class="btn-icon-pill" style="width: 28px; height: 28px; background: transparent; border: none; color: var(--text-muted); cursor: pointer;" data-delete="${task.id}" title="Remove task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      // Checkbox listener
      const checkbox = item.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        if (task.completed) {
          audio.playChime('success');
          showToast(`Task completed! Cognitive load decreased.`);
        }
        renderTasks(filter);
        calculateCognitiveLoad();
        updateConcentricRings();
      });

      // Delete listener
      const delBtn = item.querySelector('[data-delete]');
      delBtn.addEventListener('click', () => {
        STATE.tasks = STATE.tasks.filter(t => t.id !== task.id);
        renderTasks(filter);
        calculateCognitiveLoad();
        updateConcentricRings();
        showToast('Task removed from roadmap.');
      });

      listEl.appendChild(item);
    });

    calculateCognitiveLoad();
    updateConcentricRings();
  }

  // --------------------------------------------------------------------------
  // Module 2: Liquid Focus & Time Studio (Apple Pomodoro & Sound Synth)
  // --------------------------------------------------------------------------
  function updateFocusTimerDisplay() {
    const digitsEl = document.getElementById('focus-timer-digits');
    const circleProg = document.getElementById('focus-dial-circle-progress');
    if (!digitsEl || !circleProg) return;

    const mins = Math.floor(STATE.timer.remainingSeconds / 60);
    const secs = STATE.timer.remainingSeconds % 60;
    digitsEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // SVG Circular progress (Radius = 90 -> Circ = 565.48)
    const circumference = 2 * Math.PI * 90;
    const progress = STATE.timer.remainingSeconds / STATE.timer.totalSeconds;
    circleProg.style.strokeDasharray = `${circumference}`;
    circleProg.style.strokeDashoffset = `${circumference * (1 - progress)}`;
  }

  function toggleFocusTimer() {
    const playBtn = document.getElementById('btn-focus-toggle');
    if (STATE.timer.isRunning) {
      clearInterval(STATE.timer.intervalId);
      STATE.timer.isRunning = false;
      if (playBtn) playBtn.innerHTML = `<span>Resume Flow</span>`;
    } else {
      audio.init();
      STATE.timer.isRunning = true;
      if (playBtn) playBtn.innerHTML = `<span>Pause Session</span>`;

      STATE.timer.intervalId = setInterval(() => {
        if (STATE.timer.remainingSeconds > 0) {
          STATE.timer.remainingSeconds--;
          updateFocusTimerDisplay();
        } else {
          clearInterval(STATE.timer.intervalId);
          STATE.timer.isRunning = false;
          audio.playChime('success');
          showToast('Focus session complete! Take a relaxing breath.');
          STATE.focusMinutesToday += STATE.timer.mode;
          updateConcentricRings();
          if (playBtn) playBtn.innerHTML = `<span>Start Session</span>`;
        }
      }, 1000);
    }
  }

  function resetFocusTimer() {
    clearInterval(STATE.timer.intervalId);
    STATE.timer.isRunning = false;
    STATE.timer.remainingSeconds = STATE.timer.totalSeconds;
    updateFocusTimerDisplay();
    const playBtn = document.getElementById('btn-focus-toggle');
    if (playBtn) playBtn.innerHTML = `<span>Start Flow</span>`;
  }

  function setFocusPreset(minutes) {
    clearInterval(STATE.timer.intervalId);
    STATE.timer.isRunning = false;
    STATE.timer.mode = minutes;
    STATE.timer.totalSeconds = minutes * 60;
    STATE.timer.remainingSeconds = minutes * 60;
    updateFocusTimerDisplay();

    const playBtn = document.getElementById('btn-focus-toggle');
    if (playBtn) playBtn.innerHTML = `<span>Start Flow</span>`;

    document.querySelectorAll('.focus-preset-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.mins, 10) === minutes);
    });
  }

  // --------------------------------------------------------------------------
  // Module 3: 4-7-8 Guided Breathing Sanctuary
  // --------------------------------------------------------------------------
  let breathState = {
    isRunning: false,
    intervalId: null,
    phase: 'idle',
    counter: 4
  };

  function startBreathingSession() {
    const bubble = document.getElementById('breathing-bubble-core');
    const phaseLabel = document.getElementById('breath-phase-caption');
    const counterLabel = document.getElementById('breath-seconds-counter');
    const instructLabel = document.getElementById('breath-instruction');
    const toggleBtn = document.getElementById('btn-breath-toggle');

    if (breathState.isRunning) {
      clearInterval(breathState.intervalId);
      breathState.isRunning = false;
      if (bubble) bubble.style.transform = 'scale(1)';
      if (phaseLabel) phaseLabel.textContent = 'Liquid Sanctuary';
      if (counterLabel) counterLabel.textContent = '4-7-8';
      if (instructLabel) instructLabel.textContent = 'Tap button to begin rhythmic parasympathetic reset.';
      if (toggleBtn) toggleBtn.textContent = 'Begin 4-7-8 Breath';
      return;
    }

    breathState.isRunning = true;
    if (toggleBtn) toggleBtn.textContent = 'Pause Breathing';
    audio.playChime('breath');

    let currentPhase = 'inhale';
    let phaseSeconds = 4;

    function applyPhase() {
      if (!breathState.isRunning) return;

      if (currentPhase === 'inhale') {
        if (bubble) bubble.style.transform = 'scale(1.45)';
        if (phaseLabel) phaseLabel.textContent = 'Inhale Smoothly';
        if (instructLabel) instructLabel.textContent = 'Breathe deep into diaphragm through nose...';
      } else if (currentPhase === 'hold') {
        if (bubble) bubble.style.transform = 'scale(1.45)';
        if (phaseLabel) phaseLabel.textContent = 'Hold Serenely';
        if (instructLabel) instructLabel.textContent = 'Retain breath comfortably. Notice peaceful silence.';
      } else if (currentPhase === 'exhale') {
        if (bubble) bubble.style.transform = 'scale(0.85)';
        if (phaseLabel) phaseLabel.textContent = 'Release & Exhale';
        if (instructLabel) instructLabel.textContent = 'Whoosh out fully through mouth. Tension dissolves.';
      }

      audio.playChime('breath');
    }

    applyPhase();

    breathState.intervalId = setInterval(() => {
      phaseSeconds--;
      if (counterLabel) counterLabel.textContent = `${phaseSeconds}s`;

      if (phaseSeconds <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          phaseSeconds = 7;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          phaseSeconds = 8;
        } else if (currentPhase === 'exhale') {
          currentPhase = 'inhale';
          phaseSeconds = 4;
        }
        applyPhase();
      }
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // Module 4: Circadian Rhythm & Habit Check-ins
  // --------------------------------------------------------------------------
  function renderHabits() {
    const container = document.getElementById('habits-list-container');
    if (!container) return;

    container.innerHTML = '';
    STATE.habits.forEach(habit => {
      const row = document.createElement('div');
      row.className = `habit-row ${habit.completed ? 'completed' : ''}`;
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" class="task-checkbox" ${habit.completed ? 'checked' : ''} data-habit="${habit.id}">
          <span style="font-size: 0.8125rem; font-weight: 500; color: var(--text-primary);">${habit.title}</span>
        </div>
        <div class="pill-badge" style="font-size: 0.6875rem;">🔥 ${habit.streak}d streak</div>
      `;

      const chk = row.querySelector('.task-checkbox');
      chk.addEventListener('change', () => {
        habit.completed = chk.checked;
        if (habit.completed) {
          habit.streak += 1;
          audio.playChime('success');
          showToast(`Habit locked in! Streak: ${habit.streak} days.`);
        } else {
          habit.streak = Math.max(0, habit.streak - 1);
        }
        renderHabits();
        updateConcentricRings();
      });

      container.appendChild(row);
    });
  }

  function highlightCircadianPhase() {
    const hour = new Date().getHours();
    const blocks = document.querySelectorAll('.circadian-block');
    blocks.forEach(b => b.classList.remove('active-phase'));

    if (hour >= 6 && hour < 11) {
      const b = document.getElementById('phase-morning');
      if (b) b.classList.add('active-phase');
    } else if (hour >= 11 && hour < 16) {
      const b = document.getElementById('phase-deep');
      if (b) b.classList.add('active-phase');
    } else if (hour >= 16 && hour < 21) {
      const b = document.getElementById('phase-recharge');
      if (b) b.classList.add('active-phase');
    } else {
      const b = document.getElementById('phase-winddown');
      if (b) b.classList.add('active-phase');
    }
  }

  // --------------------------------------------------------------------------
  // Module 5: GPA & Semester Horizon Simulator
  // --------------------------------------------------------------------------
  function updateGPASimulation() {
    const gpaSlider = document.getElementById('slider-target-gpa');
    const creditSlider = document.getElementById('slider-credit-load');
    const gpaDisplay = document.getElementById('display-target-gpa');
    const creditDisplay = document.getElementById('display-credit-load');
    const studyHoursEl = document.getElementById('calc-study-hours');
    const cognitiveMarginEl = document.getElementById('calc-cognitive-margin');

    if (!gpaSlider || !creditSlider) return;

    const targetGPA = parseFloat(gpaSlider.value);
    const credits = parseInt(creditSlider.value, 10);

    if (gpaDisplay) gpaDisplay.textContent = targetGPA.toFixed(2);
    if (creditDisplay) creditDisplay.textContent = `${credits} Credits`;

    const weeklyHours = Math.round(credits * (1.75 + (targetGPA - 2.0) * 0.65));
    if (studyHoursEl) studyHoursEl.textContent = `${weeklyHours}h/wk`;

    let margin = 'HEALTHY (+3.2h)';
    if (weeklyHours > 36) margin = 'TIGHT (-1.5h)';
    if (weeklyHours > 42) margin = 'CRITICAL OVERLOAD';
    if (cognitiveMarginEl) {
      cognitiveMarginEl.textContent = margin;
      cognitiveMarginEl.style.color = weeklyHours > 42 ? '#ef4444' : (weeklyHours > 36 ? '#eab308' : '#10b981');
    }
  }

  // --------------------------------------------------------------------------
  // Module 6: Peer Pods & Campus SOS
  // --------------------------------------------------------------------------
  function renderPeerPods() {
    const container = document.getElementById('peer-pods-container');
    if (!container) return;

    container.innerHTML = '';
    STATE.peerPods.forEach(pod => {
      const card = document.createElement('div');
      card.className = 'pod-card';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="pill-badge" style="font-weight: 700;">${pod.count}</div>
          <div>
            <div style="font-weight: 600; font-size: 0.875rem; color: var(--text-primary);">${pod.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${pod.course} • ${pod.count} peers active</div>
          </div>
        </div>
        <button class="${pod.joined ? 'btn-glass-pill' : 'btn-primary-pill'}" style="padding: 6px 16px; font-size: 0.75rem;" data-join="${pod.id}">
          ${pod.joined ? 'Active in Pod' : 'Join Quiet Table'}
        </button>
      `;

      const joinBtn = card.querySelector('[data-join]');
      joinBtn.addEventListener('click', () => {
        pod.joined = !pod.joined;
        pod.count += pod.joined ? 1 : -1;
        audio.playChime('success');
        showToast(pod.joined ? `Joined ${pod.name}!` : `Left ${pod.name}.`);
        renderPeerPods();
      });

      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // Apple Liquid Toast Helper
  // --------------------------------------------------------------------------
  function showToast(msg) {
    let container = document.getElementById('toast-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-root';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pill-badge';
    toast.style.background = 'var(--bg-surface-elevated)';
    toast.style.color = 'var(--text-primary)';
    toast.style.boxShadow = '0 12px 30px rgba(0,0,0,0.18)';
    toast.style.padding = '10px 22px';
    toast.style.fontSize = '0.8125rem';
    toast.style.fontWeight = '600';
    toast.style.border = 'var(--glass-border)';
    toast.style.backdropFilter = 'blur(20px)';
    toast.style.transition = 'all 0.3s ease';
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // Modal Handlers & Stitch Customizer
  // --------------------------------------------------------------------------
  function initModals() {
    // Add Task Modal
    const addTaskBtn = document.getElementById('btn-open-add-task');
    const taskModal = document.getElementById('modal-add-task');
    const closeTaskModal = document.getElementById('btn-close-task-modal');
    const taskForm = document.getElementById('form-add-task');

    if (addTaskBtn && taskModal) {
      addTaskBtn.addEventListener('click', () => taskModal.classList.add('active'));
    }
    if (closeTaskModal && taskModal) {
      closeTaskModal.addEventListener('click', () => taskModal.classList.remove('active'));
    }

    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-input-title').value.trim();
        const course = document.getElementById('task-input-course').value.trim();
        const due = document.getElementById('task-input-due').value.trim();
        const weight = document.getElementById('task-input-weight').value;

        let weightScore = 15;
        if (weight === 'Deep') weightScore = 30;
        else if (weight === 'Light') weightScore = 10;

        if (title) {
          STATE.tasks.unshift({
            id: 't_' + Date.now(),
            title,
            course: course || 'GENERAL',
            due: due || 'Upcoming',
            weight,
            weightScore,
            completed: false
          });

          renderTasks('all');
          taskModal.classList.remove('active');
          taskForm.reset();
          audio.playChime('success');
          showToast('New academic assignment mapped.');
        }
      });
    }

    // SOS Modal
    const sosTrigger = document.getElementById('trigger-sos-modal');
    const sosModal = document.getElementById('modal-sos');
    const closeSos = document.getElementById('btn-close-sos-modal');

    if (sosTrigger && sosModal) {
      sosTrigger.addEventListener('click', () => sosModal.classList.add('active'));
    }
    if (closeSos && sosModal) {
      closeSos.addEventListener('click', () => sosModal.classList.remove('active'));
    }

    // Modular Theme & Customizer Modal
    const themeTrigger = document.getElementById('btn-open-theme-settings');
    const themeModal = document.getElementById('modal-theme-settings');
    const closeTheme = document.getElementById('btn-close-theme-modal');

    if (themeTrigger && themeModal) {
      themeTrigger.addEventListener('click', () => themeModal.classList.add('active'));
    }
    if (closeTheme && themeModal) {
      closeTheme.addEventListener('click', () => themeModal.classList.remove('active'));
    }

    // Interactive Theme Switcher (Top Bar + Modal Presets)
    const btnThemeWhite = document.getElementById('btn-theme-white');
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const presetWhite = document.getElementById('preset-white-glass');
    const presetDark = document.getElementById('preset-dark-glass');

    function applyTheme(theme) {
      if (window.AuraBackground) {
        window.AuraBackground.setTheme(theme);
      }
      if (theme === 'liquid-white') {
        if (btnThemeWhite) btnThemeWhite.classList.add('active');
        if (btnThemeDark) btnThemeDark.classList.remove('active');
        if (presetWhite) presetWhite.classList.add('active');
        if (presetDark) presetDark.classList.remove('active');
        showToast('Liquid White Glass Theme active');
      } else {
        if (btnThemeWhite) btnThemeWhite.classList.remove('active');
        if (btnThemeDark) btnThemeDark.classList.add('active');
        if (presetWhite) presetWhite.classList.remove('active');
        if (presetDark) presetDark.classList.add('active');
        showToast('Antigravity Dark Mode active');
      }
    }

    if (btnThemeWhite) btnThemeWhite.addEventListener('click', () => applyTheme('liquid-white'));
    if (btnThemeDark) btnThemeDark.addEventListener('click', () => applyTheme('antigravity-dark'));
    if (presetWhite) presetWhite.addEventListener('click', () => applyTheme('liquid-white'));
    if (presetDark) presetDark.addEventListener('click', () => applyTheme('antigravity-dark'));

    // Interactive Dot Density Slider
    const dotSlider = document.getElementById('slider-dot-density');
    if (dotSlider) {
      dotSlider.addEventListener('input', (e) => {
        if (window.AuraBackground) {
          window.AuraBackground.setDensity(parseInt(e.target.value, 10));
        }
      });
    }

    // Repulsion force slider
    const repulsionSlider = document.getElementById('slider-dot-repulsion');
    if (repulsionSlider) {
      repulsionSlider.addEventListener('input', (e) => {
        if (window.AuraBackground) {
          window.AuraBackground.setRepulsion(parseFloat(e.target.value));
        }
      });
    }

    // Modular Stitch Visibility Toggles
    const toggleMap = [
      { id: 'toggle-mod-workload', target: 'academic-workload' },
      { id: 'toggle-mod-focus', target: 'focus-studio' },
      { id: 'toggle-mod-wellness', target: 'mental-wellness' },
      { id: 'toggle-mod-circadian', target: 'circadian-engine' },
      { id: 'toggle-mod-gpa', target: 'gpa-horizon' },
      { id: 'toggle-mod-support', target: 'peer-support' }
    ];

    toggleMap.forEach(item => {
      const chk = document.getElementById(item.id);
      const targetEl = document.getElementById(item.target);
      if (chk && targetEl) {
        chk.addEventListener('change', () => {
          targetEl.style.display = chk.checked ? 'block' : 'none';
          showToast(`${chk.nextElementSibling.textContent} ${chk.checked ? 'enabled' : 'hidden'}`);
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // Navigation Tabs Filter (Stitch Modular Switcher)
  // --------------------------------------------------------------------------
  function initNavTabs() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    const modules = document.querySelectorAll('[data-module-category]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;

        modules.forEach(mod => {
          if (cat === 'all' || mod.dataset.moduleCategory === cat) {
            mod.style.display = 'block';
            mod.style.animation = 'fadeIn 0.3s ease';
          } else {
            mod.style.display = 'none';
          }
        });

        showToast(`Filtered view: ${tab.textContent}`);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Setup Wellness Mood Pills
  // --------------------------------------------------------------------------
  function initWellnessMood() {
    const pills = document.querySelectorAll('.mood-selector-pill');
    const tipsBox = document.getElementById('wellness-ai-advice');

    const adviceMap = {
      serene: "✨ Optimal headspace: Great time for tackling hardest conceptual tasks or planning next week's horizon.",
      balanced: "⚖️ Harmonic balance: Maintain consistent 50-min sprints with 10-min screen-free breaks.",
      stretched: "⚡ Cognitive load rising: Take a 4-7-8 breathing pause before your next problem set.",
      heavy: "🌊 High pressure detected: Postpone non-essential reading, lock in sleep, hydrate.",
      overwhelmed: "🛑 Alert: Please step away from screens for 15 minutes. Consider reaching out to peer support or campus counselors."
    };

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mood = pill.dataset.mood;
        STATE.wellness.mood = mood;
        if (tipsBox) tipsBox.textContent = adviceMap[mood] || adviceMap.balanced;
        audio.playChime('success');
      });
    });
  }

  // --------------------------------------------------------------------------
  // Ambient Audio Controls
  // --------------------------------------------------------------------------
  function initAudioControls() {
    const chips = document.querySelectorAll('.sound-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const mode = chip.dataset.sound;
        audio.playAmbient(mode);
        showToast(mode === 'none' ? 'Ambient sound muted' : `Soundscape: ${chip.textContent.trim()}`);
      });
    });

    const volSlider = document.getElementById('sound-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        audio.setVolume(parseFloat(e.target.value));
      });
    }
  }

  // --------------------------------------------------------------------------
  // Task Filters
  // --------------------------------------------------------------------------
  function initTaskFilters() {
    const filters = document.querySelectorAll('.chip-filter');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks(btn.dataset.filter);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Initialize Application
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    renderTasks('all');
    updateFocusTimerDisplay();
    renderHabits();
    highlightCircadianPhase();
    updateGPASimulation();
    renderPeerPods();
    updateConcentricRings();
    initModals();
    initNavTabs();
    initWellnessMood();
    initAudioControls();
    initTaskFilters();

    // Timer Controls
    const btnFocusToggle = document.getElementById('btn-focus-toggle');
    if (btnFocusToggle) btnFocusToggle.addEventListener('click', toggleFocusTimer);

    const btnFocusReset = document.getElementById('btn-focus-reset');
    if (btnFocusReset) btnFocusReset.addEventListener('click', resetFocusTimer);

    document.querySelectorAll('.focus-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => setFocusPreset(parseInt(btn.dataset.mins, 10)));
    });

    // Breathing Controls
    const btnBreathToggle = document.getElementById('btn-breath-toggle');
    if (btnBreathToggle) btnBreathToggle.addEventListener('click', startBreathingSession);

    // GPA sliders
    const gpaSlider = document.getElementById('slider-target-gpa');
    const creditSlider = document.getElementById('slider-credit-load');
    if (gpaSlider) gpaSlider.addEventListener('input', updateGPASimulation);
    if (creditSlider) creditSlider.addEventListener('input', updateGPASimulation);

    // Micro-journal save
    const journalInput = document.getElementById('micro-journal-input');
    if (journalInput) {
      journalInput.value = STATE.wellness.journalWin;
      journalInput.addEventListener('change', (e) => {
        STATE.wellness.journalWin = e.target.value;
        showToast('Daily micro-win saved to memory.');
      });
    }
  });

})();
