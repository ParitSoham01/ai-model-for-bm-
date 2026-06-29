(function() {
  'use strict';

  // Global Error Handler for Preview Debugging
  window.addEventListener('error', function(e) {
    const errorBox = document.createElement('div');
    errorBox.style.position = 'fixed';
    errorBox.style.bottom = '10px';
    errorBox.style.left = '10px';
    errorBox.style.right = '10px';
    errorBox.style.background = '#8a1414';
    errorBox.style.color = '#fff';
    errorBox.style.padding = '12px';
    errorBox.style.borderRadius = '6px';
    errorBox.style.fontSize = '12px';
    errorBox.style.fontFamily = 'monospace';
    errorBox.style.zIndex = '99999';
    errorBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    errorBox.innerHTML = `<strong>JS Error:</strong> ${e.message} at ${e.filename.split('/').slice(-1)[0]}:${e.lineno}:${e.colno}`;
    document.body.appendChild(errorBox);
  });

  // Preload detective images for synchronous Canvas drawing
  const imgDetective = new Image();
  imgDetective.src = 'detective.jpg';
  const imgDetectiveAlt = new Image();
  imgDetectiveAlt.src = 'detective_alt.jpg';
  const imgDetectiveCutouts = new Image();
  imgDetectiveCutouts.src = 'detective_cutouts.jpg';

  /* ─────────────── SOUND SYNTHESISER (Web Audio API) ─────────────── */
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const now = audioCtx.currentTime;
      
      if (type === 'click') {
        // High tech short blip
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'stamp') {
        // Heavy stamp thud
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        // Low pass filter to make it duller/heavier
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'scanner') {
        // Sweep scanner hum
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.8);
        osc.frequency.linearRampToValueAtTime(220, now + 1.6);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      } else if (type === 'leak') {
        // Descending high tech warning blip
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch(e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  }

  // Toggle sound
  const btnSound = document.getElementById('soundToggle');
  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    btnSound.classList.toggle('muted-active', !soundEnabled);
    playSound('click');
  });

  /* ─────────────── FLOATING PARTICLES ─────────────── */
  const pContainer = document.getElementById('particleContainer');
  const symbols = ['₹', '%', 'DNA', 'F.B.I.', '•', 'MRI'];
  
  function createParticles() {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.fontSize = (10 + Math.random() * 8) + 'px';
      p.style.animationDuration = (10 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 8) + 's';
      pContainer.appendChild(p);
    }
  }
  createParticles();
  startTeletypeText();

  /* ─────────────── APPLICATION STATE ─────────────── */
  const state = {
    // User profile
    name: 'Rahul',
    age: 23,
    occupation: 'Developer',
    goal: 'KTM Duke',
    goalCost: 250000,
    
    // Financials resolved
    income: 90000,
    savings: 10000,
    investments: 0,
    expenses: 80000,
    
    // Categories targeted
    selectedLeaks: [],
    monthlyLeakTotal: 0,
    
    // Assessment profile
    savingsHabit: 'occasional',
    investReady: false,
    confidence: 'medium',

    // Compounding constants
    annualRate: 0.15,
    dailyRate: 0.15 / 365,
  };

  /* ─────────────── QUESTIONS DATABASE ─────────────── */
  const questions = [
    {
      text: "Investigator: \"When your salary arrives... who gets paid first?\"",
      key: "savingsHabit",
      options: [
        { text: "My investments", val: "first" },
        { text: "My savings", val: "first" },
        { text: "My bills", val: "leftover" },
        { text: "Whatever needs money most", val: "none" }
      ]
    },
    {
      text: "Investigator: \"If your income vanished tomorrow... how long could you stay hidden from financial danger?\"",
      key: "reservesDuration",
      options: [
        { text: "Less than 1 month", val: "short" },
        { text: "1–3 months", val: "short" },
        { text: "3–6 months", val: "medium" },
        { text: "More than 6 months", val: "long" }
      ]
    },
    {
      text: "Investigator: \"What do you believe is standing between you and wealth?\"",
      key: "wealthBarrier",
      options: [
        { text: "I need more income", val: "income" },
        { text: "I need more discipline", val: "discipline" },
        { text: "I need a better system", val: "system" },
        { text: "I'm not sure what the problem is", val: "unsure" }
      ]
    },
    {
      text: "Investigator: \"How do you currently invest?\"",
      key: "statusText",
      options: [
        { text: "I invest consistently", val: "optimize" },
        { text: "Occasionally", val: "occasional" },
        { text: "Rarely", val: "disappears" },
        { text: "I haven't started", val: "notstarted" }
      ]
    },
    {
      text: "Investigator: \"When you think about investing today, what stops you most?\"",
      key: "investObjection",
      options: [
        { text: "I don't know where to start", val: "start" },
        { text: "I think I need more money first", val: "money" },
        { text: "I keep postponing it", val: "postpone" },
        { text: "I don't trust most platforms", val: "trust" },
        { text: "I already invest regularly", val: "already" }
      ]
    }
  ];

  let currentQuestionIdx = 0;

  /* ─────────────── MATH MODELS ─────────────── */
  function computeFV(daily, yrs) {
    const n = yrs * 365;
    const r = state.dailyRate;
    return daily * ((Math.pow(1 + r, n) - 1) / r);
  }

  function getCategoryCost(cat, income) {
    const baseRates = {
      food: 0.08,
      lifestyle: 0.06,
      subscriptions: 0.03,
      travel: 0.05,
      debt: 0.10,
      habits: 0.04
    };
    return Math.round(income * (baseRates[cat] || 0.05));
  }

  function recalculateFinancials() {
    // Total monthly leakage from categories
    let leakTotal = 0;
    state.selectedLeaks.forEach(cat => {
      leakTotal += getCategoryCost(cat, state.income);
    });
    
    // Sanity limit: cap total leak at 35% of income
    const maxAllowedLeak = Math.round(state.income * 0.35);
    if (leakTotal > maxAllowedLeak) leakTotal = maxAllowedLeak;
    state.monthlyLeakTotal = leakTotal;

    // Base savings / investments
    if (state.savingsHabit === 'first') {
      state.savings = Math.round(state.income * 0.2);
      state.investments = Math.round(state.income * 0.1);
    } else if (state.savingsHabit === 'leftover') {
      state.savings = Math.round(state.income * 0.1);
      state.investments = 0;
    } else {
      state.savings = 0;
      state.investments = 0;
    }
    state.expenses = state.income - state.savings - state.investments;

    // Timeline predictions
    const recoveryAmount = Math.round(state.monthlyLeakTotal * 0.75); // Recover 75%
    const totalDailyInvestedCurrent = (state.savings + state.investments) / 30;
    const totalDailyInvestedOpt = (state.savings + state.investments + recoveryAmount) / 30;

    // Current timeline goal achievement
    const currentGoalMonths = totalDailyInvestedCurrent > 0 ? Math.round(state.goalCost / ((state.savings + state.investments) || 1)) : 120;
    const optGoalMonths = totalDailyInvestedOpt > 0 ? Math.round(state.goalCost / ((state.savings + state.investments + recoveryAmount) || 1)) : 12;
    state.goalDelayMonths = Math.max(0, currentGoalMonths - optGoalMonths);
  }

  function formatCurrency(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function shorthand(n) {
    n = Math.round(n);
    if (n < 100000) return formatCurrency(n);
    if (n < 10000000) return '₹' + (n / 100000).toFixed(1) + ' Lakh';
    return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  }

  /* ─────────────── SCREEN TRANSITION SYSTEM ─────────────── */
  const screenHistory = [];

  function navigateTo(targetScreenId, isBack = false) {
    window.scrollTo(0, 0);
    const screens = document.querySelectorAll('.screen');
    const targetScreen = document.getElementById(targetScreenId);
    if (!targetScreen) return;
    
    // Play transition sounds
    if (targetScreenId === 'screenScan') {
      playSound('scanner');
    } else {
      playSound('click');
    }

    const currentScreen = document.querySelector('.screen.active');
    if (!isBack && currentScreen && currentScreen.id !== targetScreenId) {
      screenHistory.push(currentScreen.id);
    }

    // Reset/Setup screen states contextually when going back
    if (targetScreenId === 'screenCaseInitiation') {
      const btnVerify = document.getElementById('btnVerifyDossier');
      if (btnVerify) btnVerify.disabled = false;
      document.querySelectorAll('#screenCaseInitiation input, #screenCaseInitiation select').forEach(el => el.disabled = false);
      document.querySelectorAll('.dossier-row-group').forEach(el => el.classList.remove('stamped'));
      const folderInside = document.getElementById('folderInside');
      if (folderInside) folderInside.style.display = 'none';
      const twistReveal = document.getElementById('twistReveal');
      if (twistReveal) twistReveal.style.display = 'none';
      const btnGoToInterrogation = document.getElementById('btnGoToInterrogation');
      if (btnGoToInterrogation) btnGoToInterrogation.style.display = 'none';
    } else if (targetScreenId === 'screenEvidenceCollection') {
      startEvidenceCollection();
    } else if (targetScreenId === 'screenForensicLab') {
      initForensicUpload();
    } else if (targetScreenId === 'screenLeaks') {
      initFinancialCrimeNetwork();
    }

    screens.forEach(s => {
      if (s.classList.contains('active')) {
        s.style.opacity = '0';
        s.style.transform = 'translateY(-12px)';
        setTimeout(() => {
          s.classList.remove('active');
          
          targetScreen.classList.add('active');
          // trigger layout recalculation
          window.dispatchEvent(new Event('resize'));
          setTimeout(() => {
            targetScreen.style.opacity = '1';
            targetScreen.style.transform = 'translateY(0)';
          }, 50);
        }, 350);
      }
    });
  }

  // Wire up back button clicks globally
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('.btn-back');
    if (backBtn) {
      e.preventDefault();
      if (screenHistory.length > 0) {
        const prevScreenId = screenHistory.pop();
        navigateTo(prevScreenId, true);
      }
    }
  });

  /* ─────────────── SCREEN 0A: COLD OPEN ─────────────── */
  const btnEnterCrimeScene = document.getElementById('btnEnterCrimeScene');
  if (btnEnterCrimeScene) {
    btnEnterCrimeScene.addEventListener('click', () => {
      navigateTo('screenOpeningSequence');
      startTeletypeText();
    });
  }

  /* ─────────────── SCREEN 0B: TERMINAL TELEX DISPATCH ─────────────── */
  const dispatchText = 
`FEDERAL BUREAU OF INVESTIGATION (F.B.I.)
FINANCIAL BEHAVIOR INTELLIGENCE
CLASSIFIED CASE FILE
STATUS: OPEN

--------------------------------------------------
SUBJECT:        UNKNOWN
MISSING ASSET:  UNKNOWN
CAUSE:          UNKNOWN
--------------------------------------------------

A potential wealth disappearance has been detected.
The timeline investigation is active.`;

  function startTeletypeText() {
    const el = document.getElementById('teletypeTerminal');
    if (!el) return;
    
    let index = 0;
    el.innerHTML = '';
    
    playSirenHum();

    function type() {
      if (index < dispatchText.length) {
        const char = dispatchText.charAt(index);
        el.innerHTML += char;
        index++;
        
        if (char !== ' ' && char !== '\n' && index % 2 === 0) {
          playSound('click');
        }
        
        let delay = 4;
        if (char === '\n') delay = 20;
        else if (char === '.' || char === '?' || char === ':') delay = 40;
        
        el.scrollTop = el.scrollHeight;
        const wrapper = el.closest('.terminal-wrapper');
        if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
        
        setTimeout(type, delay);
      } else {
        const actionArea = document.getElementById('terminalActionArea');
        if (actionArea) {
          actionArea.style.display = 'block';
          actionArea.style.opacity = '0';
          actionArea.style.transition = 'opacity 0.8s ease';
          setTimeout(() => { actionArea.style.opacity = '1'; }, 50);
        }
      }
    }
    setTimeout(type, 200);
  }

  function playSirenHum() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 1.2);
      osc.frequency.linearRampToValueAtTime(150, now + 2.4);
      
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 2.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 2.4);
    } catch(e) {
      console.warn("Audio Context blocked:", e);
    }
  }

  const btnAcceptCase = document.getElementById('btnAcceptCase');
  if (btnAcceptCase) {
    btnAcceptCase.addEventListener('click', () => {
      navigateTo('screenDispatch');
      startDispatchTeletypeText();
    });
  }

  /* ─────────────── SCREEN 1: EMERGENCY DISPATCH ─────────────── */
  const dispatchEmergencyText = 
`To whoever receives this message,

Over the last decade, thousands of people have reported the same problem.
Not a stolen wallet.
Not a hacked account.
Not a scam.
Something stranger.

A fortune that should have existed...
never did.

The missing money wasn't taken in one day.
It disappeared slowly.
A few hundred rupees at a time.
A delayed decision at a time.
A forgotten opportunity at a time.

Most victims never noticed it happening.

Our system believes your timeline may contain similar patterns.
We need your help.`;

  function startDispatchTeletypeText() {
    const el = document.getElementById('dispatchTeletype');
    if (!el) return;
    
    let index = 0;
    el.innerHTML = '';

    function type() {
      if (index < dispatchEmergencyText.length) {
        const char = dispatchEmergencyText.charAt(index);
        el.innerHTML += char;
        index++;
        
        if (char !== ' ' && char !== '\n' && index % 2 === 0) {
          playSound('click');
        }
        
        let delay = 4;
        if (char === '\n') delay = 15;
        
        el.scrollTop = el.scrollHeight;
        const wrapper = el.closest('.terminal-wrapper');
        if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
        
        setTimeout(type, delay);
      } else {
        const actionArea = document.getElementById('dispatchActionArea');
        if (actionArea) {
          actionArea.style.display = 'block';
          actionArea.style.opacity = '0';
          actionArea.style.transition = 'opacity 0.8s ease';
          setTimeout(() => { actionArea.style.opacity = '1'; }, 50);
        }
      }
    }
    setTimeout(type, 200);
  }

  const btnAcceptDispatch = document.getElementById('btnAcceptDispatch');
  if (btnAcceptDispatch) {
    btnAcceptDispatch.addEventListener('click', () => {
      navigateTo('screenTimeline');
    });
  }

  /* ─────────────── SCREEN 2: MISSING FORTUNE TIMELINE ─────────────── */
  const btnOpenCaseFile = document.getElementById('btnOpenCaseFile');
  if (btnOpenCaseFile) {
    btnOpenCaseFile.addEventListener('click', () => {
      navigateTo('screenCaseInitiation');
    });
  }

  /* ─────────────── SCREEN 3: IDENTITY RECONSTRUCTION (DOSSIER) ─────────────── */
  const btnVerifyDossier = document.getElementById('btnVerifyDossier');
  const folderInside = document.getElementById('folderInside');
  
  if (btnVerifyDossier) {
    btnVerifyDossier.addEventListener('click', () => {
      const errorLabel = document.getElementById('formErrorLabel');
      if (errorLabel) errorLabel.style.display = 'none';

      const nameVal = document.getElementById('inputName').value.trim();
      const ageVal = document.getElementById('inputAge').value;
      const occupVal = document.getElementById('inputOccupation').value.trim();
      const incomeVal = document.getElementById('inputIncome').value;
      const goalVal = document.getElementById('inputGoal').value;
      const goalCostVal = document.getElementById('inputGoalCost').value;

      if (!nameVal || !ageVal || !occupVal || !incomeVal || !goalCostVal) {
        if (errorLabel) {
          errorLabel.textContent = "⚠️ Please supply all timeline identification signals.";
          errorLabel.style.display = 'block';
        } else {
          alert("Please fill in all dossier details.");
        }
        return;
      }

      state.name = nameVal;
      state.age = parseInt(ageVal);
      state.occupation = occupVal;
      state.income = parseInt(incomeVal);
      state.goal = goalVal;
      state.goalCost = parseInt(goalCostVal);
      state.statementUploaded = false;

      // Disable inputs
      btnVerifyDossier.disabled = true;
      document.querySelectorAll('#screenCaseInitiation input, #screenCaseInitiation select').forEach(el => el.disabled = true);

      // Dynamic case updates
      document.getElementById('headerCaseNum').textContent = `CASE #BM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      document.getElementById('hudName').textContent = state.name;
      document.getElementById('dashName').textContent = state.name;
      document.getElementById('invoiceName').textContent = state.name;
      document.getElementById('letterName').textContent = state.name;
      document.getElementById('bpName').textContent = state.name;

      // Run sequential stamping
      const stampGroups = [
        { el: document.getElementById('dossierNameGroup'), delay: 100 },
        { el: document.getElementById('dossierAgeGroup'), delay: 450 },
        { el: document.getElementById('dossierOccupGroup'), delay: 800 },
        { el: document.getElementById('dossierIncomeGroup'), delay: 1150 },
        { el: document.getElementById('dossierGoalGroup'), delay: 1500 },
        { el: document.getElementById('dossierCostGroup'), delay: 1850 }
      ];

      stampGroups.forEach(stamp => {
        setTimeout(() => {
          if (stamp.el) {
            stamp.el.classList.add('stamped');
            playSound('stamp');
          }
        }, stamp.delay);
      });

      // Show twist reveal after all stamps
      setTimeout(() => {
        folderInside.style.display = 'flex';
        
        setTimeout(() => {
          document.getElementById('twistTitle').textContent = "CASE PROFILE INITIATED.";
          playSound('click');
        }, 500);

        setTimeout(() => {
          document.getElementById('twistLine1').textContent = "Calibrating timeline indexes...";
          playSound('click');
        }, 1200);

        setTimeout(() => {
          document.getElementById('twistLine2').textContent = "Estimated wealth variance compiled.";
          playSound('click');
        }, 1900);

        setTimeout(() => {
          const twistReveal = document.getElementById('twistReveal');
          if (twistReveal) {
            twistReveal.style.display = 'block';
            playSound('leak');
          }
        }, 2700);

        setTimeout(() => {
          const btnGoToInterrogation = document.getElementById('btnGoToInterrogation');
          if (btnGoToInterrogation) {
            btnGoToInterrogation.style.display = 'block';
            playSound('click');
          }
        }, 3400);

      }, 2300);
    });
  }

  const btnGoToInterrogation = document.getElementById('btnGoToInterrogation');
  if (btnGoToInterrogation) {
    btnGoToInterrogation.addEventListener('click', () => {
      navigateTo('screenEvidenceCollection');
      startEvidenceCollection();
    });
  }

  /* ─────────────── SCREEN 4: EVIDENCE COLLECTION ─────────────── */
  function startEvidenceCollection() {
    currentQuestionIdx = 0;
    renderEvidenceQuestion(currentQuestionIdx);
  }

  function renderEvidenceQuestion(idx) {
    const container = document.getElementById('evidenceCardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const q = questions[idx];
    if (!q) return;

    const card = document.createElement('div');
    card.className = 'evidence-card';
    card.innerHTML = `
      <div class="evidence-stamp-acquired" style="display:none;">EVIDENCE ACQUIRED</div>
      <div class="evidence-clue-header mono text-warn" style="font-size:12px; margin-bottom:8px;">INTERROGATION LOG #0${idx+1}</div>
      <h3 class="evidence-question text-bright" style="font-size:15px; font-weight:800; line-height:1.4; font-family:var(--font-mono); margin-bottom:18px;">${q.text}</h3>
      <div class="evidence-options-list">
        ${q.options.map((opt, i) => `
          <button class="evidence-option-btn mono" data-val="${opt.val}" data-index="${i}">
            [ ] ${opt.text}
          </button>
        `).join('')}
      </div>
    `;

    container.appendChild(card);

    const sidebarThoughts = [
      "Analyzing subject savings profile and cash retention bias...",
      "Measuring reserve runway coordinates under sudden income stop...",
      "Decoding primary systemic friction limits...",
      "Evaluating investing consistency footprint... checking compounding...",
      "Profiling objections footprint and capital sync blocks..."
    ];
    const sidebarStatuses = ["SAVINGS SYNC", "RUNWAY METRIC", "SYSTEMIC FRICTION", "INVESTING PATH", "MINDSET BIAS"];
    const sidebarPortraits = ["pose-b", "pose-c", "pose-a", "pose-d", "pose-b"];

    const elPortrait = document.getElementById('cooperSidebarPortrait');
    const elMessage = document.getElementById('cooperSidebarMessage');
    const elStatus = document.getElementById('cooperSidebarStatus');
    if (elPortrait) elPortrait.className = 'detective-cutout ' + (sidebarPortraits[idx] || 'pose-a');
    if (elMessage) elMessage.textContent = sidebarThoughts[idx] || '';
    if (elStatus) elStatus.textContent = sidebarStatuses[idx] || 'INTERROGATION';

    const progress = Math.round(((idx) / questions.length) * 100);
    const dnaSyncBar = document.getElementById('dnaSyncBar');
    const dnaSyncVal = document.getElementById('dnaSyncVal');
    if (dnaSyncBar) dnaSyncBar.style.width = `${progress || 20}%`;
    if (dnaSyncVal) dnaSyncVal.textContent = `${progress || 20}%`;

    const optionBtns = card.querySelectorAll('.evidence-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const optionIdx = parseInt(btn.dataset.index);
        const opt = q.options[optionIdx];
        
        btn.classList.add('selected');
        btn.innerHTML = `[x] ${opt.text}`;
        
        optionBtns.forEach(b => b.disabled = true);
        
        playSound('stamp');
        const stamp = card.querySelector('.evidence-stamp-acquired');
        if (stamp) {
          stamp.style.display = 'block';
          stamp.style.animation = 'stampPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }

        handleEvidenceAnswer(q.key, opt);
      });
    });
  }

  function handleEvidenceAnswer(key, opt) {
    if (key === 'savingsHabit') {
      state.savingsHabit = opt.val;
      const chip = document.getElementById('chipSavings');
      if (chip) {
        chip.classList.add('active');
        chip.querySelector('.chip-val').textContent = opt.text.toUpperCase();
      }
    } else if (key === 'statusText') {
      const chip = document.getElementById('chipInvest');
      if (chip) {
        chip.classList.add('active');
        chip.querySelector('.chip-val').textContent = opt.val === 'optimize' ? 'OPTIMAL' : 'DELAYED';
      }
    } else if (key === 'investObjection') {
      const chip = document.getElementById('chipMindset');
      if (chip) {
        chip.classList.add('active');
        chip.querySelector('.chip-val').textContent = 'COMPLETED';
      }
    }

    setTimeout(() => {
      currentQuestionIdx++;
      if (currentQuestionIdx < questions.length) {
        renderEvidenceQuestion(currentQuestionIdx);
      } else {
        setTimeout(() => {
          navigateTo('screenEvidenceReview');
        }, 1200);
      }
    }, 1200);
  }

  /* ─────────────── SCREEN 4B: INITIAL EVIDENCE REVIEW ─────────────── */
  const btnGoToForensics = document.getElementById('btnGoToForensics');
  if (btnGoToForensics) {
    btnGoToForensics.addEventListener('click', () => {
      navigateTo('screenForensicLab');
      initForensicUpload();
    });
  }

  /* ─────────────── SCREEN 5: FINANCIAL FORENSICS LAB (FORENSIC EVIDENCE REQUEST) ─────────────── */
  let uploadedFile = null;

  function initForensicUpload() {
    const uploadDropZone = document.getElementById('uploadDropZone');
    const bankStatementInput = document.getElementById('bankStatementInput');
    const fileStatus = document.getElementById('fileUploadStatus');
    const btnScan = document.getElementById('btnTriggerForensicScan');
    const btnSkip = document.getElementById('btnSkipUpload');
    const confidenceBadge = document.getElementById('uploadConfidenceBadge');

    if (!uploadDropZone) return;

    // Reset previous files
    uploadedFile = null;
    if (fileStatus) fileStatus.style.display = 'none';
    if (btnScan) btnScan.disabled = true;
    if (confidenceBadge) {
      confidenceBadge.textContent = "CONFIDENCE: LOW";
      confidenceBadge.style.borderColor = "var(--warn)";
      confidenceBadge.style.color = "var(--warn)";
    }

    uploadDropZone.onclick = () => {
      bankStatementInput.click();
    };

    bankStatementInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleUploadedFile(file, fileStatus, btnScan, confidenceBadge);
      }
    };

    // Drag and drop events
    uploadDropZone.ondragover = (e) => {
      e.preventDefault();
      uploadDropZone.classList.add('dragover');
    };

    uploadDropZone.ondragleave = () => {
      uploadDropZone.classList.remove('dragover');
    };

    uploadDropZone.ondrop = (e) => {
      e.preventDefault();
      uploadDropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        handleUploadedFile(file, fileStatus, btnScan, confidenceBadge);
      }
    };

    btnSkip.onclick = () => {
      state.statementUploaded = false;
      navigateTo('screenForensicScan');
      runForensicFileScanner(false);
    };

    btnScan.onclick = () => {
      state.statementUploaded = true;
      navigateTo('screenForensicScan');
      runForensicFileScanner(true);
    };
  }

  function handleUploadedFile(file, statusEl, buttonEl, badgeEl) {
    uploadedFile = file;
    playSound('stamp');
    statusEl.innerHTML = `📄 EVIDENCE SELECTED: <strong class="text-bright">${file.name}</strong> (${Math.round(file.size / 1024)} KB)`;
    statusEl.style.display = 'block';
    buttonEl.disabled = false;
    
    badgeEl.textContent = "CONFIDENCE: VERY HIGH";
    badgeEl.style.borderColor = "var(--bright)";
    badgeEl.style.color = "var(--bright)";
  }

  /* ─────────────── SCREEN 5B: FINANCIAL FORENSICS SCAN ─────────────── */
  function runForensicFileScanner(hasUpload) {
    const consoleEl = document.getElementById('forensicScanConsole');
    if (!consoleEl) return;
    consoleEl.innerHTML = '';

    const logs = hasUpload ? [
      { text: "INITIALIZING PARSER HANDSHAKE...", type: "info" },
      { text: `SCANNING EVIDENCE: ${uploadedFile ? uploadedFile.name : 'STATEMENT.PDF'}...`, type: "info" },
      { text: "TRANSACTIONS INDEXED SUCCESSFULLY", type: "success" },
      { text: "IDENTIFYING RECURRING MERCHANTS...", type: "info" },
      { text: "FLAGGED: swiggy/zomato convenience transactions (Est. bleed: high)", type: "warn" },
      { text: "FLAGGED: subscription payments detected", type: "warn" },
      { text: "MAPPING INVESTMENT OUTFLOWS...", type: "info" },
      { text: "ALERT: Delayed compound potential detected", type: "danger" },
      { text: "BEHAVIORAL PROFILE GENERATED.", type: "success" },
      { text: "EVIDENCE INTEGRATED. INVESTIGATION CONFIDENCE: HIGH", type: "success" }
    ] : [
      { text: "INITIALIZING MANUAL RECONSTRUCTION...", type: "info" },
      { text: "ANALYZING EVIDENCE...", type: "info" },
      { text: "✓ Convenience Spending Identified", type: "success" },
      { text: "✓ Investment Delay Identified", type: "success" },
      { text: "✓ Opportunity Cost Indicators Found", type: "success" },
      { text: "⚠ High Priority Person of Interest Added", type: "warn" },
      { text: "Loading Crime Network...", type: "info" }
    ];

    let logIdx = 0;
    
    function printNextLog() {
      if (logIdx < logs.length) {
        const log = logs[logIdx];
        const p = document.createElement('p');
        p.className = `mono text-${log.type} console-log-line`;
        p.textContent = `> ${log.text}`;
        p.style.margin = "4px 0";
        
        consoleEl.appendChild(p);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        
        playSound('click');
        logIdx++;
        
        setTimeout(printNextLog, 250);
      } else {
        setTimeout(() => {
          navigateTo('screenLeaks');
          initFinancialCrimeNetwork();
        }, 800);
      }
    }

    setTimeout(printNextLog, 400);
  }

  /* ─────────────── SCREEN 6: FINANCIAL CRIME NETWORK ─────────────── */
  function initFinancialCrimeNetwork() {
    const nodesContainer = document.getElementById('networkContainer');
    const nodes = document.querySelectorAll('.network-node-item');
    const btnConfirm = document.getElementById('btnConfirmLeaks');
    const loader = document.getElementById('networkLoader');

    if (!nodesContainer) return;

    loader.style.display = 'block';
    nodesContainer.style.opacity = '0';
    btnConfirm.disabled = true;

    // Reset accused classes
    nodes.forEach(node => node.classList.remove('accused'));

    // Simulate map connection assembling
    let loadPct = 0;
    const loadBar = document.getElementById('networkLoaderBar');
    
    function updateLoader() {
      if (loadPct < 100) {
        loadPct += 10;
        if (loadBar) loadBar.style.width = loadPct + '%';
        playSound('click');
        setTimeout(updateLoader, 100);
      } else {
        loader.style.display = 'none';
        nodesContainer.style.opacity = '1';
        drawNetworkSVGConnections();
        playSound('leak');

        // Pre-flag suspects if file uploaded
        if (state.statementUploaded) {
          nodes.forEach(node => {
            const cat = node.dataset.category;
            if (cat === 'food' || cat === 'subscriptions' || cat === 'lifestyle') {
              node.classList.add('accused');
            }
          });
          state.selectedLeaks = ['food', 'subscriptions', 'lifestyle'];
          updateAccusedLines();
          btnConfirm.disabled = false;
        } else {
          state.selectedLeaks = [];
          updateAccusedLines();
        }
      }
    }
    setTimeout(updateLoader, 300);

    nodes.forEach(node => {
      node.onclick = () => {
        node.classList.toggle('accused');
        if (node.classList.contains('accused')) {
          playSound('stamp');
        } else {
          playSound('click');
        }

        const selected = document.querySelectorAll('.network-node-item.accused');
        state.selectedLeaks = Array.from(selected).map(c => c.dataset.category);
        
        updateAccusedLines();

        if (btnConfirm) {
          btnConfirm.disabled = state.selectedLeaks.length === 0;
        }
      };
    });
  }

  function drawNetworkSVGConnections() {
    const svg = document.getElementById('networkSVG');
    if (!svg) return;
    svg.innerHTML = `
      <line x1="15%" y1="20%" x2="70%" y2="15%" class="network-line" data-nodes="food,subscriptions" />
      <line x1="15%" y1="20%" x2="45%" y2="50%" class="network-line" data-nodes="food,lifestyle" />
      <line x1="70%" y1="15%" x2="45%" y2="50%" class="network-line" data-nodes="subscriptions,lifestyle" />
      <line x1="15%" y1="20%" x2="18%" y2="75%" class="network-line" data-nodes="food,debt" />
      <line x1="18%" y1="75%" x2="45%" y2="50%" class="network-line" data-nodes="debt,lifestyle" />
      <line x1="18%" y1="75%" x2="75%" y2="78%" class="network-line" data-nodes="debt,travel" />
      <line x1="75%" y1="78%" x2="45%" y2="50%" class="network-line" data-nodes="travel,lifestyle" />
      <line x1="75%" y1="78%" x2="82%" y2="45%" class="network-line" data-nodes="travel,habits" />
      <line x1="70%" y1="15%" x2="82%" y2="45%" class="network-line" data-nodes="subscriptions,habits" />
      <line x1="82%" y1="45%" x2="45%" y2="50%" class="network-line" data-nodes="habits,lifestyle" />
    `;
    updateAccusedLines();
  }

  function updateAccusedLines() {
    const lines = document.querySelectorAll('.network-line');
    lines.forEach(line => {
      const nodes = line.getAttribute('data-nodes').split(',');
      const active = nodes.some(n => state.selectedLeaks.includes(n));
      if (active) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }

  const btnConfirmLeaks = document.getElementById('btnConfirmLeaks');
  if (btnConfirmLeaks) {
    btnConfirmLeaks.onclick = () => {
      playSound('stamp');
      navigateTo('screenTwist');
    };
  }

  /* ─────────────── SCREEN 7: CASE UPDATE TWIST ─────────────── */
  const btnDismissTwist = document.getElementById('btnDismissTwist');
  if (btnDismissTwist) {
    btnDismissTwist.onclick = () => {
      recalculateFinancials();
      navigateTo('screenMatrix');
      setupMatrixValues();
      
      const findingsBadge = document.getElementById('findingsConfidenceBadge');
      if (findingsBadge) {
        findingsBadge.textContent = state.statementUploaded ? "Confidence Level: VERY HIGH" : "Confidence Level: MODERATE";
      }
    };
  }

  /* ─────────────── SCREEN 8: PRELIMINARY FINDINGS ─────────────── */
  const btnGoToSnapshot = document.getElementById('btnGoToSnapshot');
  if (btnGoToSnapshot) {
    btnGoToSnapshot.onclick = () => {
      const snapConf = document.getElementById('snapshotConfidenceVal');
      if (snapConf) {
        snapConf.textContent = state.statementUploaded ? "VERY HIGH (VERIFIED EVIDENCE)" : "MODERATE (MANUAL SIGNALS)";
      }
      navigateTo('screenEvidenceSnapshot');
    };
  }

  /* ─────────────── SCREEN 8B: EVIDENCE BOARD SNAPSHOT ─────────────── */
  const btnStartScan = document.getElementById('btnStartScan');
  if (btnStartScan) {
    btnStartScan.addEventListener('click', () => {
      navigateTo('screenScan');
      runMoneyMRI();
    });
  }

  /* ─────────────── SCREEN 9: MATRIX & PREDICTIONS ─────────────── */
  function setupMatrixValues() {
    const elIncome = document.getElementById('matrixValIncome');
    if (elIncome) elIncome.textContent = formatCurrency(state.income);
    const elSavings = document.getElementById('matrixValSavings');
    if (elSavings) elSavings.textContent = formatCurrency(state.savings);
    const elExpenses = document.getElementById('matrixValExpenses');
    if (elExpenses) elExpenses.textContent = formatCurrency(state.expenses);
    const elInvestments = document.getElementById('matrixValInvestments');
    if (elInvestments) elInvestments.textContent = formatCurrency(state.investments);
    const elGoal = document.getElementById('matrixValGoal');
    if (elGoal) elGoal.textContent = formatCurrency(state.goalCost);

    // Calculate prediction delay
    const currentRouteMonths = Math.round(state.goalCost / ((state.savings + state.investments) || 1));
    const optRouteMonths = Math.round(state.goalCost / ((state.savings + state.investments + Math.round(state.monthlyLeakTotal * 0.75)) || 1));
    const gapYears = Math.round((currentRouteMonths - optRouteMonths) / 12);
    
    const predDelayEl = document.getElementById('predDelayYrs');
    if (predDelayEl) {
      predDelayEl.textContent = `${gapYears > 0 ? gapYears : 4-8} Years`;
    }
  }

  /* ─────────────── SCREEN 4: MONEY MRI SCAN ─────────────── */
  const consoleBody = document.getElementById('consoleBody');
  const scanLogs = [
    { text: "Connecting to Financial Intelligence Bureau...", type: "info" },
    { text: "Establishing secure transaction handshake...", type: "info" },
    { text: "Verifying cash flow metrics & income signals...", type: "success" },
    { text: "Scanning category leakages...", type: "info" },
    { text: "Swiggy / Zomato conveniences resolved. Count: high", type: "warn" },
    { text: "Streaming sub-registries and cloud payments...", type: "info" },
    { text: "ALERT: Inconsistent wealth allocations found", type: "danger" },
    { text: "Calculating compounding opportunity loss at 15% p.a...", type: "info" },
    { text: "Simulating 3 pathway futures (Current, Reclaimed, Blink)...", type: "success" },
    { text: "Mapping financial DNA helix coordinates...", type: "info" },
    { text: "Extraction complete. Diagnostic success.", type: "success" }
  ];

  function runMoneyMRI() {
    consoleBody.innerHTML = '';
    let logIdx = 0;
    
    function printNextLog() {
      if (logIdx < scanLogs.length) {
        const log = scanLogs[logIdx];
        const line = document.createElement('div');
        line.className = `console-line ${log.type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${log.text}`;
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
        
        logIdx++;
        setTimeout(printNextLog, 450);
      } else {
        // Complete
        setTimeout(() => {
          navigateTo('screenRevelations');
          startProgressiveRevelations();
        }, 1000);
      }
    }
    printNextLog();
  }

  /* ─────────────── SCREEN 5: REVELATIONS DASHBOARD ─────────────── */
  const discoveryOverlay = document.getElementById('discoveryOverlay');
  const discoveryText = document.getElementById('discoveryText');
  const btnNextDiscovery = document.getElementById('btnNextDiscovery');
  const dashboardLayout = document.getElementById('dashboardLayout');

  const discoveryMoments = [
    "Hmm... AI scanner has detected some unusual patterns in your spending.",
    "Your core income and basic savings habits aren't actually the problem.",
    "Your timing is. Delaying automated compounding is costing you millions.",
    "We discovered exactly ₹4,800/month of recoverable wealth leaking from your categories."
  ];
  let discoveryIdx = 0;

  function startProgressiveRevelations() {
    discoveryOverlay.style.display = 'flex';
    dashboardLayout.classList.remove('visible');
    discoveryIdx = 0;
    showDiscoveryMoment();
  }

  function showDiscoveryMoment() {
    discoveryText.textContent = discoveryMoments[discoveryIdx];
    
    // Dynamic text replacement for the last step based on computed leaks
    if (discoveryIdx === 3) {
      discoveryText.textContent = `We discovered exactly ${formatCurrency(state.monthlyLeakTotal)}/month of recoverable wealth leaking from your categories.`;
    }
  }

  btnNextDiscovery.addEventListener('click', () => {
    playSound('click');
    discoveryIdx++;
    if (discoveryIdx < discoveryMoments.length) {
      showDiscoveryMoment();
    } else {
      // Reveal the dashboard
      discoveryOverlay.style.display = 'none';
      dashboardLayout.classList.add('visible');
      setupDashboardReports();
    }
  });

  function setupDashboardReports() {
    // Metric counters
    animateCounter('valHiddenWealth', 0, state.monthlyLeakTotal * 12, 'currency');
    animateCounter('valMonthlyLeaks', 0, state.monthlyLeakTotal, 'currency');
    document.getElementById('valTotalLeaksCount').textContent = state.selectedLeaks.length;
    
    // Calculate total loss at 15% over 10 years
    const dailyLeak = state.monthlyLeakTotal / 30;
    const loss10Y = computeFV(dailyLeak, 10);
    animateCounter('valTotalLoss', 0, loss10Y, 'currency');

    // Goal delay
    document.getElementById('valGoalDelay').textContent = `${state.goalDelayMonths} Months`;

    // DNA Profile
    setupDNAProfile();

    // Twin values
    setupFinancialTwins(loss10Y);

    // Charge sheet
    setupChargeSheet();

    // Invoice
    setupInvoice();

    // Time Machine
    setupTimeMachine();
  }

  function setupDNAProfile() {
    const elName = document.getElementById('dnaIdentityName');
    const elSuper = document.getElementById('dnaSuperpower');
    const elBlock = document.getElementById('dnaBlocker');
    const elStyle = document.getElementById('dnaStyle');
    const elRisk = document.getElementById('dnaRisk');
    const elLevel = document.getElementById('dnaLevel');

    // DNA profiles dynamically chosen based on questionnaire responses
    if (state.savingsHabit === 'none') {
      elName.textContent = "THE SALARY SPRINTER";
      elSuper.textContent = "High Adaptive Spender";
      elBlock.textContent = "Zero Capital Lock";
      elStyle.textContent = "Immediate-Gratification";
      elRisk.textContent = "Emergency Vulnerability";
      elLevel.textContent = "Level 2 / 10";
    } else if (state.savingsHabit === 'leftover') {
      elName.textContent = "THE DELAYED MILLIONAIRE";
      elSuper.textContent = "High Earnings Potential";
      elBlock.textContent = "Inconsistent Investing";
      elStyle.textContent = "Reactive / Passive";
      elRisk.textContent = "Lifestyle Inflation";
      elLevel.textContent = "Level 4 / 10";
    } else {
      elName.textContent = "THE SILENT WEALTH BUILDER";
      elSuper.textContent = "Excellent Discipline";
      elBlock.textContent = "Conservative Yields";
      elStyle.textContent = "Proactive planner";
      elRisk.textContent = "Opportunity cost delay";
      elLevel.textContent = "Level 7 / 10";
    }
  }

  function setupFinancialTwins(loss10Y) {
    const currentTwinCrore = 2055 + Math.round(state.goalDelayMonths / 12);
    const optTwinCrore = 2050;
    
    document.getElementById('twinCurrentCrore').textContent = currentTwinCrore;
    document.getElementById('twinOptCrore').textContent = optTwinCrore;
    document.getElementById('twinSavedYrs').textContent = `${Math.max(2, currentTwinCrore - optTwinCrore)} Years Saved`;

    // Wealth at 35
    const yrsTo35 = Math.max(2, 35 - state.age);
    const dailyCurrent = (state.savings) / 30;
    const dailyOpt = (state.savings + Math.round(state.monthlyLeakTotal * 0.75)) / 30;

    const current35 = computeFV(dailyCurrent, yrsTo35);
    const opt35 = computeFV(dailyOpt, yrsTo35);

    document.getElementById('twinCurrent35').textContent = shorthand(current35);
    document.getElementById('twinOpt35').textContent = shorthand(opt35);
    document.getElementById('twinCurrentLeak').textContent = formatCurrency(state.monthlyLeakTotal);
  }

  function setupChargeSheet() {
    const container = document.getElementById('chargeSheetBody');
    container.innerHTML = '';
    
    state.selectedLeaks.forEach(cat => {
      const amt = getCategoryCost(cat, state.income);
      const daily = amt / 30;
      const fv15 = computeFV(daily, 15);
      
      const row = document.createElement('div');
      row.className = 'charge-row';
      row.innerHTML = `
        <div class="charge-info">
          <div class="charge-title">${cat.charAt(0).toUpperCase() + cat.slice(1)} Outflow</div>
          <div class="charge-spent">${formatCurrency(amt)}/month leakage</div>
        </div>
        <div class="charge-impact">
          <div class="charge-loss-val text-warn">${shorthand(fv15)}</div>
          <div class="charge-loss-label text-muted">15-year Future Loss</div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  function setupInvoice() {
    const container = document.getElementById('invoiceItems');
    container.innerHTML = '';
    
    let totalCompoundedWasted = 0;
    state.selectedLeaks.forEach(cat => {
      const amt = getCategoryCost(cat, state.income);
      const wasted = computeFV(amt/30, 5); // 5 year wasted value
      totalCompoundedWasted += wasted;
      
      const row = document.createElement('div');
      row.className = 'inv-row';
      row.innerHTML = `
        <span>Convenience Leakage: ${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
        <span class="mono">${shorthand(wasted)}</span>
      `;
      container.appendChild(row);
    });
    
    document.getElementById('invoiceTotalVal').textContent = shorthand(totalCompoundedWasted);
  }

  function setupTimeMachine() {
    const dailyLeak = state.monthlyLeakTotal / 30;
    const fvPast3 = computeFV(dailyLeak, 3);
    const fvNext3 = computeFV(dailyLeak, 3);

    document.getElementById('tmStarted3YrsAgo').textContent = shorthand(fvPast3);
    document.getElementById('tmStartsToday').textContent = shorthand(fvNext3);
  }

  // Future Letter toggle
  const btnReadLetter = document.getElementById('btnReadLetter');
  const letterEnvelope = document.getElementById('letterEnvelope');
  const letterContent = document.getElementById('letterContent');

  btnReadLetter.addEventListener('click', () => {
    playSound('stamp');
    letterEnvelope.style.display = 'none';
    letterContent.style.display = 'block';
  });

  const btnGoToSimulator = document.getElementById('btnGoToSimulator');
  btnGoToSimulator.addEventListener('click', () => {
    navigateTo('screenSimulator');
    setupSimulatorTimelines();
  });

  /* ─────────────── SCREEN 6: FUTURE SIMULATOR ─────────────── */
  const simSlider = document.getElementById('simSlider');
  const sliderValPct = document.getElementById('sliderValPct');
  const reclaimAmtVal = document.getElementById('reclaimAmtVal');
  const reclaimTotalVal = document.getElementById('reclaimTotalVal');

  // Simulator pathway lines
  const laneCurrentLine = document.querySelector('#laneCurrent .lane-pulser');
  const laneRecoveryLine = document.querySelector('#laneRecovery .lane-pulser');
  const laneBlinkLine = document.querySelector('#laneBlink .lane-pulser');
  
  const endCurrentVal = document.getElementById('endpointCurrent');
  const endRecoveryVal = document.getElementById('endpointRecovery');
  const endBlinkVal = document.getElementById('endpointBlink');

  simSlider.addEventListener('input', () => {
    const pct = parseInt(simSlider.value);
    sliderValPct.textContent = `${pct}%`;
    
    const reclaimed = Math.round(state.monthlyLeakTotal * (pct / 100));
    reclaimAmtVal.textContent = formatCurrency(reclaimed);

    updateTimelinePathways(pct, reclaimed);
  });

  function setupSimulatorTimelines() {
    reclaimTotalVal.textContent = formatCurrency(state.monthlyLeakTotal);
    simSlider.value = 50;
    sliderValPct.textContent = '50%';
    const initialReclaimed = Math.round(state.monthlyLeakTotal * 0.5);
    reclaimAmtVal.textContent = formatCurrency(initialReclaimed);

    updateTimelinePathways(50, initialReclaimed);
  }

  function updateTimelinePathways(pct, reclaimed) {
    const ageGap35 = Math.max(2, 35 - state.age);
    const ageGap45 = Math.max(2, 45 - state.age);

    // Current (No modifications)
    const dailyCurrent = (state.savings + state.investments) / 30;
    const current35 = computeFV(dailyCurrent, ageGap35);
    const current45 = computeFV(dailyCurrent, ageGap45);
    
    // Recovery (Reclaiming Category Leaks)
    const dailyRecovery = (state.savings + state.investments + reclaimed) / 30;
    const recovery35 = computeFV(dailyRecovery, ageGap35);
    const recovery45 = computeFV(dailyRecovery, ageGap45);

    // BlinkMoney (Reclaiming leaks + 10% annual step-up compounding)
    let balanceBlink35 = 0;
    let balanceBlink45 = 0;
    
    // 35 calculation with stepup
    let dayAmt = (state.savings + state.investments + reclaimed) / 30;
    for (let y = 0; y < ageGap35; y++) {
      balanceBlink35 *= Math.pow(1 + state.dailyRate, 365);
      balanceBlink35 += dayAmt * ((Math.pow(1 + state.dailyRate, 365) - 1) / state.dailyRate);
      dayAmt *= 1.10; // 10% step up
    }

    // 45 calculation with stepup
    dayAmt = (state.savings + state.investments + reclaimed) / 30;
    for (let y = 0; y < ageGap45; y++) {
      balanceBlink45 *= Math.pow(1 + state.dailyRate, 365);
      balanceBlink45 += dayAmt * ((Math.pow(1 + state.dailyRate, 365) - 1) / state.dailyRate);
      dayAmt *= 1.10;
    }

    // Endpoints display
    endCurrentVal.textContent = shorthand(current45);
    endRecoveryVal.textContent = shorthand(recovery45);
    endBlinkVal.textContent = shorthand(balanceBlink45);

    // Pulse width animations
    laneCurrentLine.style.width = '25%';
    laneRecoveryLine.style.width = `${30 + (pct * 0.4)}%`;
    laneBlinkLine.style.width = `${40 + (pct * 0.55)}%`;

    // Metrics panel displays
    animateCounter('simValAge35', 0, recovery35, 'shorthand');
    animateCounter('simValAge45', 0, recovery45, 'shorthand');
    
    // Calculate 1st Crore year
    const yrsToCrore = Math.min(50, Math.log((10000000 * state.dailyRate) / (dailyRecovery || 1) + 1) / (365 * Math.log(1 + state.dailyRate)));
    const targetCroreYear = 2026 + Math.round(yrsToCrore);
    document.getElementById('simValCroreYrs').textContent = targetCroreYear;

    // Goal arrival date
    const monthlyAlloc = state.savings + state.investments + reclaimed;
    const monthsToGoal = monthlyAlloc > 0 ? Math.round(state.goalCost / monthlyAlloc) : 100;
    const goalDate = new Date();
    goalDate.setMonth(goalDate.getMonth() + monthsToGoal);
    document.getElementById('simValGoalDate').textContent = goalDate.toLocaleDateString('en-IN', {month: 'short', year: 'numeric'});

    // Financial Freedom Year
    const targetFreedomYrs = Math.min(50, Math.log((state.income * 12 * 20 * state.dailyRate) / (dailyRecovery || 1) + 1) / (365 * Math.log(1 + state.dailyRate)));
    const freedomYear = 2026 + Math.round(targetFreedomYrs);
    const yearsSaved = Math.max(1, Math.round(50 - targetFreedomYrs));
    document.getElementById('simValFreedom').textContent = `${freedomYear} (Saved ${yearsSaved} Years)`;
  }

  const btnGenerateArtifacts = document.getElementById('btnGenerateArtifacts');
  btnGenerateArtifacts.addEventListener('click', () => {
    navigateTo('screenVault');
    runVaultUnlockLoading();
  });

  /* ─────────────── SCREEN 7: ARTIFACT VAULT ─────────────── */
  const vaultLoading = document.getElementById('vaultLoading');
  const loaderFill = document.getElementById('loaderFill');
  
  function runVaultUnlockLoading() {
    vaultLoading.classList.add('open');
    loaderFill.style.width = '0%';
    
    const steps = [
      { id: 'lStepStamp', pct: 25 },
      { id: 'lStepVerify', pct: 50 },
      { id: 'lStepSignature', pct: 75 },
      { id: 'lStepArchive', pct: 100 }
    ];
    let stepIdx = 0;

    function runNextStep() {
      if (stepIdx < steps.length) {
        const step = steps[stepIdx];
        document.getElementById(step.id).classList.add('active');
        document.getElementById(step.id).querySelector('.step-bullet').textContent = '●';
        loaderFill.style.width = `${step.pct}%`;
        
        playSound('click');
        stepIdx++;
        setTimeout(runNextStep, 500);
      } else {
        setTimeout(() => {
          playSound('stamp');
          vaultLoading.classList.remove('open');
          setupBlueprint();
        }, 600);
      }
    }
    
    // Clear active steps first
    steps.forEach(s => {
      document.getElementById(s.id).classList.remove('active');
      document.getElementById(s.id).querySelector('.step-bullet').textContent = '○';
    });
    
    setTimeout(runNextStep, 300);
  }

  function setupBlueprint() {
    document.getElementById('bpEmergency').textContent = formatCurrency(25000);
    document.getElementById('bpRecovery').textContent = formatCurrency(state.monthlyLeakTotal);
    
    const sip = Math.round(state.monthlyLeakTotal * 0.65);
    const goalFund = Math.round(state.monthlyLeakTotal * 0.35);
    document.getElementById('bpSIP').textContent = `${formatCurrency(sip)}/m`;
    document.getElementById('bpGoalFund').textContent = `${formatCurrency(goalFund)}/m`;
  }

  /* ─────────────── ARTIFACT SELECTION & MODAL RENDER ─────────────── */
  const vaultItems = document.querySelectorAll('.vault-item');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const btnDownloadArtifact = document.getElementById('btnDownloadArtifact');
  
  let activeArtifactType = '';

  vaultItems.forEach(item => {
    item.addEventListener('click', () => {
      activeArtifactType = item.dataset.artifact;
      renderArtifactModal(activeArtifactType);
    });
  });

  modalClose.addEventListener('click', () => {
    modalBackdrop.classList.remove('open');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
  });

  function renderArtifactModal(type) {
    modalBackdrop.classList.add('open');
    modalContent.innerHTML = '';
    playSound('click');

    let html = '';
    const dateStr = new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'});

    if (type === 'fitness') {
      html = `
        <div class="cert-card">
          <div class="cert-header">BLINKMONEY INTEL CERTIFICATION</div>
          <h2 class="cert-title">FINANCIAL FITNESS CERTIFICATE</h2>
          <div class="cert-subtitle">This document officially certifies the portfolio score of:</div>
          <div class="cert-recipient">${state.name}</div>
          <div class="cert-grid">
            <div class="cert-cell"><div class="cert-cell-label">WEALTH GRADE</div><div class="cert-cell-val text-bright">A-</div></div>
            <div class="cert-cell"><div class="cert-cell-label">FITNESS SCORE</div><div class="cert-cell-val text-gold">78/100</div></div>
            <div class="cert-cell"><div class="cert-cell-label">FINANCIAL AGE</div><div class="cert-cell-val">27 Yrs</div></div>
            <div class="cert-cell"><div class="cert-cell-label">ACTUAL AGE</div><div class="cert-cell-val">${state.age} Yrs</div></div>
          </div>
          <p class="text-muted" style="font-size:11px;">Issued on ${dateStr} after complete transaction investigation.</p>
          <div class="cert-seal-stamp">F.B.I. SECURE</div>
        </div>
      `;
    } else if (type === 'dna') {
      const isLeftover = state.savingsHabit === 'leftover';
      const isNone = state.savingsHabit === 'none';
      const dnaIdentity = isNone ? 'THE SALARY SPRINTER' : (isLeftover ? 'THE DELAYED MILLIONAIRE' : 'THE SILENT WEALTH BUILDER');
      html = `
        <div class="cert-card" style="border-color:#148A47;">
          <div class="cert-header">DNA REVELATION MODULE</div>
          <h2 class="cert-title" style="border-color:#148A47;">FINANCIAL IDENTITY CARD</h2>
          <div class="detective-avatar cutout-pose-2" style="width: 72px; height: 72px; margin: 0 auto 12px; border-radius: 50%;"></div>
          <div class="cert-recipient" style="font-size:18px; margin-bottom:8px;">${state.name}</div>
          <div class="mono text-bright" style="font-size:15px; font-weight:800; margin-bottom:20px;">${dnaIdentity}</div>
          <div class="cert-grid" style="text-align:left; font-size:12px;">
            <div class="cert-cell"><div class="cert-cell-label">SUPERPOWER</div><div class="cert-cell-val text-bright" style="font-size:12px;">Adaptive Spender</div></div>
            <div class="cert-cell"><div class="cert-cell-label">GROWTH BLOCKER</div><div class="cert-cell-val text-warn" style="font-size:12px;">Delay Compounding</div></div>
          </div>
          <div class="cert-seal-stamp" style="border-color:#148A47; color:#148A47;">DNA AUTH</div>
        </div>
      `;
    } else if (type === 'time_machine') {
      const fv3 = computeFV(state.monthlyLeakTotal / 30, 3);
      html = `
        <div class="cert-card" style="border-color:#FF7A00;">
          <div class="cert-header">TIMING DIAGNOSTIC ENGINE</div>
          <h2 class="cert-title" style="border-color:#FF7A00;">WEALTH TIME MACHINE™</h2>
          <div class="cert-recipient" style="font-size: 16px;">TIME LOSS CONTEXT</div>
          <div class="tm-scenario" style="margin: 16px 0; text-align:left;">
            <div class="tm-scenario-label text-muted">IF STARTED 3 YEARS AGO:</div>
            <div class="tm-scenario-value mono text-warn" style="font-size: 20px;">${shorthand(fv3)}</div>
            <div class="tm-scenario-label text-muted" style="margin-top:10px;">IF STARTING TODAY:</div>
            <div class="tm-scenario-value mono text-bright" style="font-size: 20px;">${shorthand(fv3)}</div>
          </div>
          <div class="cert-seal-stamp" style="border-color:#FF7A00; color:#FF7A00;">36M LOST</div>
        </div>
      `;
    } else if (type === 'passport') {
      const croreYr = 2050 + Math.round(state.goalDelayMonths / 12);
      html = `
        <div class="passport-card">
          <div class="pass-header">
            <span class="pass-logo">BLINKMONEY STATE</span>
            <span class="pass-title">PASSPORT</span>
          </div>
          <div class="pass-body">
            <div class="pass-photo" style="overflow: hidden; padding: 0;"><div class="detective-avatar cutout-pose-3" style="width: 100%; height: 100%; border-radius: 0; border: none;"></div></div>
            <div class="pass-details">
              <div>HOLDER: <strong>${state.name}</strong></div>
              <div>MILIEU: <strong>1ST CRORE ACCEL</strong></div>
              <div>ARRIVAL YEAR: <strong class="text-bright">${croreYr}</strong></div>
              <div>STATUS: <strong class="text-gold">ACTIVE</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'future_letter') {
      html = `
        <div class="letter-content" style="box-shadow:none;">
          <div class="letter-date">Year 2036</div>
          <p>Dear ${state.name},</p>
          <p>I am writing this from 2036. Looking back, you had enough income. You had enough opportunities. The only thing missing was a system.</p>
          <p class="text-gold">You spent thousands on things you barely remember today, while my security was delayed.</p>
          <p>The good news? You still have time. Please start sooner.</p>
          <div class="letter-sign">— Future You</div>
        </div>
      `;
    } else if (type === 'missing_wealth') {
      const dailyLeak = state.monthlyLeakTotal / 30;
      const fv10 = computeFV(dailyLeak, 10);
      html = `
        <div class="police-card">
          <div class="police-header">
            <h2>MISSING WEALTH REPORT</h2>
            <h3>CASE FILE #BM-2026-MISSING</h3>
          </div>
          <div class="police-details-grid">
            <div class="police-cell"><label>ESTIMATED LOSS</label><strong class="text-danger">${shorthand(fv10)}</strong></div>
            <div class="police-cell"><label>STATUS</label><strong>RECOVERABLE</strong></div>
            <div class="police-cell"><label>LAST SEEN IN</label><strong>Convenience Leaks</strong></div>
            <div class="police-cell"><label>TIMEFRAME</label><strong>Past 36 Months</strong></div>
          </div>
          <p class="police-description">
            Subject is leaking compounding capital into convenience spending categories. Prompt actions required to reallocate.
          </p>
          <div class="police-stamp">STILL RECOVERABLE</div>
        </div>
      `;
    } else if (type === 'goal_license') {
      html = `
        <div class="license-card">
          <div class="license-header">
            <h2>GOAL ACHIEVEMENT LICENSE</h2>
            <h3>CLASS A LICENSE</h3>
          </div>
          <div class="license-body">
            <div class="license-photo" style="overflow: hidden; padding: 0;"><div class="detective-avatar cutout-pose-3" style="width: 100%; height: 100%; border-radius: 0; border: none;"></div></div>
            <div class="license-details">
              <div>HOLDER: <strong>${state.name}</strong></div>
              <div>GOAL TARGET: <strong>${state.goal}</strong></div>
              <div>PROBABILITY: <strong class="text-bright">84%</strong></div>
              <div>ETA: <strong class="text-gold">Fast-Track</strong></div>
            </div>
          </div>
          <div class="license-stamp">APPROVED</div>
        </div>
      `;
    } else if (type === 'recovery_order') {
      html = `
        <div class="cert-card" style="border-color:#1e293b; text-align:left;">
          <div class="cert-header" style="text-align:center;">F.B.I. EXECUTIVE DECREE</div>
          <h2 class="cert-title" style="border-color:#1e293b; text-align:center;">WEALTH RECOVERY ORDER</h2>
          <p style="font-size:12px; margin-bottom:12px; line-height:1.4;">To the subject ${state.name}, you are hereby commanded to recover and reallocate outflows:</p>
          <div style="font-size:13px; font-family:var(--font-mono); margin-bottom:16px;">
            <div>• Convenience Leaks: <strong class="text-bright">${formatCurrency(state.monthlyLeakTotal)}/m</strong></div>
            <div>• Target Reallocation: <strong class="text-bright">75%</strong></div>
            <div>• Recovered Monthly: <strong class="text-gold">${formatCurrency(state.monthlyLeakTotal * 0.75)}/m</strong></div>
          </div>
          <div style="border: 2px dashed #1e293b; padding: 6px; text-align:center; font-weight:800; font-family:var(--font-mono); font-size:11px;">
            STATUS: READY FOR EXECUTION
          </div>
        </div>
      `;
    } else if (type === 'investigation') {
      html = `
        <div class="cert-card" style="border-color:#148A47; text-align:left;">
          <div class="cert-header" style="text-align:center;">F.B.I. OFFICIAL INQUEST</div>
          <h2 class="cert-title" style="border-color:#148A47; text-align:center;">INVESTIGATION REPORT</h2>
          <div class="findings-table" style="font-size:12px;">
            <div class="table-row"><span>Subject Name</span><span class="mono">${state.name}</span></div>
            <div class="table-row"><span>Period Investigated</span><span class="mono">Jan – Jun 2026</span></div>
            <div class="table-row"><span>Hidden Wealth Detected</span><span class="mono text-bright">${formatCurrency(state.monthlyLeakTotal * 12)}/yr</span></div>
            <div class="table-row"><span>Active Wealth Leaks</span><span class="mono text-warn">${state.selectedLeaks.length} categories</span></div>
            <div class="table-row"><span>Compounded Losses (10y)</span><span class="mono text-warn">${shorthand(computeFV(state.monthlyLeakTotal/30, 10))}</span></div>
            <div class="table-row"><span>Calculated Goal Delay</span><span class="mono text-warn">${state.goalDelayMonths} Months</span></div>
          </div>
          <p class="text-muted text-center" style="font-size:10px; margin-top:14px;">Case closed with status: SUCCESSFUL.</p>
        </div>
      `;
    } else if (type === 'twin') {
      const croreYr = 2055 + Math.round(state.goalDelayMonths / 12);
      const yrs35 = Math.max(2, 35 - state.age);
      const current35 = computeFV(state.savings/30, yrs35);
      const opt35 = computeFV((state.savings + Math.round(state.monthlyLeakTotal * 0.75))/30, yrs35);
      html = `
        <div class="twins-comparison" style="grid-template-columns: 1fr; gap: 14px;">
          <div class="twin-panel current-twin" style="background:#131d1a; border: 1px solid rgba(255,59,48,0.2);">
            <div class="twin-icon">🔴</div>
            <h4>CURRENT TWIN (Rahul)</h4>
            <div class="twin-stat-list">
              <div class="twin-stat"><span>1st Crore Year:</span> <strong class="mono text-warn">${croreYr}</strong></div>
              <div class="twin-stat"><span>Wealth at Age 35:</span> <strong class="mono">${shorthand(current35)}</strong></div>
            </div>
          </div>
          <div class="twin-panel optimized-twin" style="background:#131d1a; border: 1px solid rgba(47,209,120,0.2);">
            <div class="twin-icon">🟢</div>
            <h4>OPTIMIZED TWIN (Rahul)</h4>
            <div class="twin-stat-list">
              <div class="twin-stat"><span>1st Crore Year:</span> <strong class="mono text-bright">2050</strong></div>
              <div class="twin-stat"><span>Wealth at Age 35:</span> <strong class="mono text-bright">${shorthand(opt35)}</strong></div>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'chargesheet') {
      let chargeRows = '';
      state.selectedLeaks.forEach(cat => {
        const amt = getCategoryCost(cat, state.income);
        const fv15 = computeFV(amt/30, 15);
        chargeRows += `
          <div class="charge-row" style="font-size:12px; margin-bottom:8px;">
            <div class="charge-info">
              <div class="charge-title" style="font-weight:700;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
              <div class="charge-spent">${formatCurrency(amt)}/m leakage</div>
            </div>
            <div class="charge-impact" style="text-align:right;">
              <div class="charge-loss-val text-warn" style="font-weight:800;">${shorthand(fv15)}</div>
            </div>
          </div>
        `;
      });
      html = `
        <div class="cert-card" style="border-color:#FF3B30; text-align:left;">
          <div class="cert-header" style="text-align:center; color:#FF3B30;">F.B.I. FORENSIC CHARGE</div>
          <h2 class="cert-title" style="border-color:#FF3B30; text-align:center;">WEALTH LEAKAGE CHARGE SHEET</h2>
          <div class="charge-sheet-body">${chargeRows}</div>
        </div>
      `;
    } else if (type === 'invoice') {
      let invoiceRows = '';
      let totalCompoundedWasted = 0;
      state.selectedLeaks.forEach(cat => {
        const amt = getCategoryCost(cat, state.income);
        const wasted = computeFV(amt/30, 5);
        totalCompoundedWasted += wasted;
        invoiceRows += `
          <div class="inv-row" style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
            <span>${cat.charAt(0).toUpperCase() + cat.slice(1)} Leak</span>
            <span class="mono">${shorthand(wasted)}</span>
          </div>
        `;
      });
      html = `
        <div class="invoice-box">
          <div class="invoice-logo">FUTURE SELF INVOICE INC.</div>
          <div class="invoice-meta">
            <div><strong>TO:</strong> Present Self</div>
            <div><strong>FROM:</strong> Future Self (2036)</div>
          </div>
          <div class="invoice-items" style="margin: 12px 0;">${invoiceRows}</div>
          <div class="invoice-total" style="display:flex; justify-content:space-between; font-weight:800; border-top:1.5px dashed #cbd5e1; padding-top:10px;">
            <span>TOTAL WASTED CAPITAL</span>
            <span class="text-warn">${shorthand(totalCompoundedWasted)}</span>
          </div>
          <div class="invoice-status" style="margin-top:12px;">STATUS: STILL RECOVERABLE</div>
        </div>
      `;
    } else if (type === 'potential') {
      const rawPotential = state.income * 12 * 20; // 20 years worth of annual income capability
      html = `
        <div class="cert-card" style="border-color:#d4af37;">
          <div class="cert-header">WEALTH POTENTIAL INDEX</div>
          <h2 class="cert-title">WEALTH POTENTIAL CERTIFICATE</h2>
          <div class="cert-subtitle">This documents the projected lifetime capability of:</div>
          <div class="cert-recipient">${state.name}</div>
          <div class="cert-grid">
            <div class="cert-cell"><div class="cert-cell-label">POTENTIAL RATING</div><div class="cert-cell-val text-gold">EXCEPTIONAL</div></div>
            <div class="cert-cell"><div class="cert-cell-label">CAPABILITY</div><div class="cert-cell-val text-bright">${shorthand(rawPotential)}</div></div>
            <div class="cert-cell"><div class="cert-cell-label">CURRENT PROB.</div><div class="cert-cell-val text-warn">38%</div></div>
            <div class="cert-cell"><div class="cert-cell-label">OPTIMIZED PROB.</div><div class="cert-cell-val text-bright">84%</div></div>
          </div>
          <div class="cert-seal-stamp">POTENTIAL AUTH</div>
        </div>
      `;
    } else if (type === 'resume') {
      const gpa = state.savingsHabit === 'first' ? '8.8' : (state.savingsHabit === 'leftover' ? '6.4' : '4.2');
      html = `
        <div class="cert-card" style="border-color:#1e293b; text-align:left;">
          <div class="cert-header" style="text-align:center;">BLINKMONEY CREDIT MATRIX</div>
          <h2 class="cert-title" style="border-color:#1e293b; text-align:center;">FINANCIAL RESUME</h2>
          <div class="findings-table" style="font-size:12px; margin-bottom:14px;">
            <div class="table-row"><span>Savings Habits</span><span class="mono text-bright">★★★★☆</span></div>
            <div class="table-row"><span>Investing Discipline</span><span class="mono text-warn">★★☆☆☆</span></div>
            <div class="table-row"><span>Emergency Readiness</span><span class="mono text-warn">★★★☆☆</span></div>
            <div class="table-row"><span>Debt Risk Control</span><span class="mono text-bright">★★★★★</span></div>
            <div class="table-row" style="font-weight:800;"><span>FINANCIAL GPA</span><span class="mono text-gold">${gpa} / 10</span></div>
          </div>
          <div style="font-size:10px; color:#64748b; text-align:center;">Highly shareable summary profile.</div>
        </div>
      `;
    }

    modalContent.innerHTML = html;
  }

  /* ─────────────── CANVAS EXPORT SYSTEM ─────────────── */
  btnDownloadArtifact.addEventListener('click', () => {
    exportArtifactAsPNG(activeArtifactType);
  });

  function exportArtifactAsPNG(type) {
    const canvas = document.getElementById('exportCanvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas size
    canvas.width = 800;
    canvas.height = 1000;

    // Fill background
    ctx.fillStyle = '#08100D';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw header watermark
    ctx.fillStyle = 'rgba(47, 209, 120, 0.05)';
    ctx.font = '800 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLINKMONEY F.B.I.', canvas.width / 2, 200);

    const dateStr = new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'});

    if (type === 'fitness') {
      // Certificate export render
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 50, 200, 700, 700, 16);
      ctx.fill();

      // Gold border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 10;
      roundRect(ctx, 70, 220, 660, 660, 10);
      ctx.stroke();

      ctx.fillStyle = '#8c763d';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('BLINKMONEY INTEL CERTIFICATION', canvas.width/2, 300);

      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('FINANCIAL FITNESS CERTIFICATE', canvas.width/2, 370);

      ctx.fillStyle = '#64748b';
      ctx.font = '22px sans-serif';
      ctx.fillText('This document officially certifies the portfolio score of:', canvas.width/2, 440);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(state.name, canvas.width/2, 510);

      // Score Cells
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      roundRect(ctx, 150, 570, 230, 100, 8);
      ctx.fill();
      roundRect(ctx, 420, 570, 230, 100, 8);
      ctx.fill();
      roundRect(ctx, 150, 690, 230, 100, 8);
      ctx.fill();
      roundRect(ctx, 420, 690, 230, 100, 8);
      ctx.fill();

      ctx.fillStyle = '#8c763d';
      ctx.font = '16px monospace';
      ctx.fillText('WEALTH GRADE', 265, 600);
      ctx.fillText('FITNESS SCORE', 535, 600);
      ctx.fillText('FINANCIAL AGE', 265, 720);
      ctx.fillText('ACTUAL AGE', 535, 720);

      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('A-', 265, 640);
      ctx.fillText('78/100', 535, 640);
      ctx.fillText('27 Yrs', 265, 760);
      ctx.fillText(`${state.age} Yrs`, 535, 760);

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('F.B.I. SECURE STAMP', 560, 840);
    } else if (type === 'dna') {
      const isLeftover = state.savingsHabit === 'leftover';
      const isNone = state.savingsHabit === 'none';
      const dnaIdentity = isNone ? 'THE SALARY SPRINTER' : (isLeftover ? 'THE DELAYED MILLIONAIRE' : 'THE SILENT WEALTH BUILDER');
      
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#148A47';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('DNA REVELATION MODULE', canvas.width/2, 300);

      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('FINANCIAL IDENTITY CARD', canvas.width/2, 370);

      if (imgDetectiveCutouts.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 440, 50, 0, Math.PI * 2);
        ctx.clip();
        // Draw Pose 2 (sx = 205, sy = 0, sw = 205, sh = 558)
        ctx.drawImage(imgDetectiveCutouts, 205, 0, 205, 558, canvas.width / 2 - 50, 390, 100, 100);
        ctx.restore();

        // Draw green circle border
        ctx.strokeStyle = '#148A47';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 440, 50, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.font = '54px sans-serif';
        ctx.fillText('🧬', canvas.width/2, 450);
      }

      ctx.font = '22px sans-serif';
      ctx.fillText(state.name, canvas.width/2, 510);
      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(dnaIdentity, canvas.width/2, 560);

      ctx.fillStyle = '#1e252b';
      ctx.font = '16px monospace';
      ctx.fillText('SUPERPOWER: High Earning Potential', canvas.width/2, 640);
      ctx.fillText('GROWTH BLOCKER: Compounding Delay', canvas.width/2, 685);

      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('DNA AUTH STAMP', 540, 800);
    } else if (type === 'time_machine') {
      const fv3 = computeFV(state.monthlyLeakTotal / 30, 3);
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#FF7A00';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#FF7A00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('TIMING DIAGNOSTIC ENGINE', canvas.width/2, 300);
      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('WEALTH TIME MACHINE™', canvas.width/2, 370);

      ctx.font = 'bold 22px monospace';
      ctx.fillText('TIME LOSS CONTEXT', canvas.width/2, 450);

      ctx.font = '18px monospace';
      ctx.fillText('IF STARTED 3 YEARS AGO:', 160, 530);
      ctx.fillStyle = '#b12525';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(shorthand(fv3), 160, 570);

      ctx.fillStyle = '#1e252b';
      ctx.font = '18px monospace';
      ctx.fillText('IF STARTING TODAY (NEXT 3Y):', 160, 660);
      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(shorthand(fv3), 160, 700);

      ctx.fillStyle = '#FF7A00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('36M LOST', 540, 800);
    } else if (type === 'passport') {
      const croreYr = 2050 + Math.round(state.goalDelayMonths / 12);
      ctx.fillStyle = '#2d3748';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 4;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('BLINKMONEY STATE', canvas.width/2, 290);
      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('PASSPORT', canvas.width/2, 350);

      ctx.fillStyle = '#4a5568';
      roundRect(ctx, 140, 420, 150, 180, 8);
      ctx.fill();
      if (imgDetectiveCutouts.complete) {
        ctx.save();
        roundRect(ctx, 140, 420, 150, 180, 8);
        ctx.clip();
        // Draw Pose 3 (sx = 410, sy = 0, sw = 205, sh = 558)
        ctx.drawImage(imgDetectiveCutouts, 410, 0, 205, 558, 140, 420, 150, 180);
        ctx.restore();
      } else {
        ctx.fillStyle = '#cbd5e0';
        ctx.font = '64px sans-serif';
        ctx.fillText('🛂', 215, 520);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`HOLDER: ${state.name}`, 320, 450);
      ctx.fillText(`MILIEU: 1ST CRORE ACCEL`, 320, 490);
      ctx.fillText(`ARRIVAL YEAR: ${croreYr}`, 320, 530);
      ctx.fillText(`STATUS: ACTIVE`, 320, 570);
      ctx.textAlign = 'center';

      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('APPROVED visa', 540, 800);
    } else if (type === 'future_letter') {
      ctx.fillStyle = '#fdfaf2';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#e6dfce';
      ctx.lineWidth = 4;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#6e6450';
      ctx.font = '16px monospace';
      ctx.fillText('Year 2036', 600, 290);

      ctx.fillStyle = '#2b2518';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Dear ${state.name},`, 140, 350);
      ctx.font = '18px sans-serif';
      ctx.fillText('I am writing this from 2036. Looking back, you had enough', 140, 410);
      ctx.fillText('income. You had enough opportunities. The only thing missing', 140, 450);
      ctx.fillText('was a system.', 140, 490);
      ctx.fillStyle = '#b18025';
      ctx.fillText('You spent thousands on things you barely remember today,', 140, 550);
      ctx.fillText('while my security was delayed.', 140, 590);
      ctx.fillStyle = '#2b2518';
      ctx.fillText('The good news? You still have time. Please start sooner.', 140, 650);

      ctx.font = 'bold 20px monospace';
      ctx.fillText('— Future You', 480, 750);
      ctx.textAlign = 'center';
    } else if (type === 'missing_wealth') {
      const dailyLeak = state.monthlyLeakTotal / 30;
      const fv10 = computeFV(dailyLeak, 10);
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#1a202c';
      ctx.fillRect(140, 280, 520, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('MISSING WEALTH REPORT', canvas.width/2, 320);

      ctx.fillStyle = '#718096';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('CASE FILE #BM-2026-MISSING', canvas.width/2, 380);

      ctx.fillStyle = '#1a202c';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Estimated Lost Capital: ${shorthand(fv10)}`, 140, 460);
      ctx.fillText(`Current Status: Still Recoverable`, 140, 510);
      ctx.fillText(`Target Category Leaks: Convenience spends`, 140, 560);
      ctx.fillText(`Diagnostic Timeframe: Past 36 Months`, 140, 610);

      ctx.fillStyle = '#e53e3e';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('STILL RECOVERABLE', canvas.width/2, 750);
    } else if (type === 'goal_license') {
      ctx.fillStyle = '#1c4532';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#2f855a';
      ctx.lineWidth = 4;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('GOAL ACHIEVEMENT LICENSE', canvas.width/2, 290);
      ctx.fillStyle = '#c6f6d5';
      ctx.font = '14px monospace';
      ctx.fillText('CLASS A LICENSE', canvas.width/2, 330);

      ctx.fillStyle = '#22543d';
      roundRect(ctx, 140, 400, 120, 120, 6);
      ctx.fill();
      if (imgDetectiveCutouts.complete) {
        ctx.save();
        roundRect(ctx, 140, 400, 120, 120, 6);
        ctx.clip();
        // Draw Pose 3 (sx = 410, sy = 0, sw = 205, sh = 558)
        ctx.drawImage(imgDetectiveCutouts, 410, 0, 205, 558, 140, 400, 120, 120);
        ctx.restore();
      } else {
        ctx.fillStyle = '#c6f6d5';
        ctx.font = '48px sans-serif';
        ctx.fillText('🎯', 200, 480);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`HOLDER: ${state.name}`, 290, 420);
      ctx.fillText(`GOAL TARGET: ${state.goal}`, 290, 450);
      ctx.fillText(`PROBABILITY: 84%`, 290, 480);
      ctx.fillText(`ETA: Fast-Track`, 290, 510);
      ctx.textAlign = 'center';

      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('APPROVED', 540, 800);
    } else if (type === 'recovery_order') {
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('F.B.I. EXECUTIVE DECREE', canvas.width/2, 300);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('WEALTH RECOVERY ORDER', canvas.width/2, 350);

      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText(`To the subject ${state.name}, you are hereby commanded to recover:`, canvas.width/2, 420);

      ctx.fillStyle = '#1e293b';
      ctx.font = '18px monospace';
      ctx.fillText(`• Convenience Leaks: ${formatCurrency(state.monthlyLeakTotal)}/m`, 140, 490);
      ctx.fillText(`• Target Reallocation: 75%`, 140, 530);
      ctx.fillText(`• Recovered Monthly: ${formatCurrency(state.monthlyLeakTotal * 0.75)}/m`, 140, 570);

      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('READY FOR EXECUTION', canvas.width/2, 720);
    } else if (type === 'investigation') {
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#148A47';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('F.B.I. OFFICIAL INQUEST', canvas.width/2, 300);
      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('INVESTIGATION REPORT', canvas.width/2, 370);

      ctx.font = '18px monospace';
      ctx.fillText(`Subject Name: ${state.name}`, 140, 450);
      ctx.fillText(`Period Investigated: Jan – Jun 2026`, 140, 490);
      ctx.fillText(`Hidden Wealth Detected: ${formatCurrency(state.monthlyLeakTotal * 12)}/yr`, 140, 530);
      ctx.fillText(`Compounded Losses (10y): ${shorthand(computeFV(state.monthlyLeakTotal/30, 10))}`, 140, 570);
      ctx.fillText(`Goal Delay Detected: ${state.goalDelayMonths} Months`, 140, 610);

      ctx.fillStyle = '#148A47';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('SUCCESSFUL INQUEST', 500, 800);
    } else if (type === 'twin') {
      const croreYr = 2055 + Math.round(state.goalDelayMonths / 12);
      const yrs35 = Math.max(2, 35 - state.age);
      const current35 = computeFV(state.savings/30, yrs35);
      const opt35 = computeFV((state.savings + Math.round(state.monthlyLeakTotal * 0.75))/30, yrs35);

      ctx.fillStyle = '#131d1a';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,59,48,0.1)';
      roundRect(ctx, 120, 260, 560, 240, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,59,48,0.3)';
      ctx.stroke();

      ctx.fillStyle = '#ff3b30';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🔴 CURRENT TWIN', canvas.width/2, 310);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText(`1st Crore Year: ${croreYr}`, 160, 370);
      ctx.fillText(`Wealth at Age 35: ${shorthand(current35)}`, 160, 410);

      ctx.fillStyle = 'rgba(47,209,120,0.1)';
      roundRect(ctx, 120, 540, 560, 240, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(47,209,120,0.3)';
      ctx.stroke();

      ctx.fillStyle = '#2fd178';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🟢 OPTIMIZED TWIN', canvas.width/2, 590);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText(`1st Crore Year: 2050`, 160, 650);
      ctx.fillText(`Wealth at Age 35: ${shorthand(opt35)}`, 160, 690);
    } else if (type === 'chargesheet') {
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#FF3B30';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#FF3B30';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('F.B.I. FORENSIC CHARGE', canvas.width/2, 300);
      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('WEALTH LEAKAGE CHARGE SHEET', canvas.width/2, 350);

      let yPos = 430;
      state.selectedLeaks.forEach(cat => {
        const amt = getCategoryCost(cat, state.income);
        const fv15 = computeFV(amt/30, 15);
        ctx.fillStyle = '#1e252b';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`• ${cat.charAt(0).toUpperCase() + cat.slice(1)} Leakage: ${formatCurrency(amt)}/m`, 140, yPos);
        ctx.fillStyle = '#b12525';
        ctx.font = '16px monospace';
        ctx.fillText(`Future 15y Opportunity Cost Lost: ${shorthand(fv15)}`, 160, yPos + 30);
        yPos += 70;
      });
    } else if (type === 'invoice') {
      ctx.fillStyle = '#f8fafc';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('FUTURE SELF INVOICE INC.', canvas.width/2, 290);
      ctx.font = '14px monospace';
      ctx.fillText(`TO: Present Self  |  FROM: Future Self (2036)`, canvas.width/2, 330);

      let yPos = 400;
      let totalCompoundedWasted = 0;
      state.selectedLeaks.forEach(cat => {
        const amt = getCategoryCost(cat, state.income);
        const wasted = computeFV(amt/30, 5);
        totalCompoundedWasted += wasted;
        ctx.font = '16px monospace';
        ctx.fillText(`${cat.charAt(0).toUpperCase() + cat.slice(1)} Outflow Wasted`, 140, yPos);
        ctx.fillText(shorthand(wasted), 580, yPos);
        yPos += 40;
      });

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(140, yPos + 10);
      ctx.lineTo(660, yPos + 10);
      ctx.stroke();

      ctx.font = 'bold 18px monospace';
      ctx.fillText('TOTAL WASTED COMPELLED CAPITAL', 140, yPos + 50);
      ctx.fillText(shorthand(totalCompoundedWasted), 580, yPos + 50);
    } else if (type === 'potential') {
      const rawPotential = state.income * 12 * 20;
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#8c763d';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('WEALTH POTENTIAL INDEX', canvas.width/2, 300);
      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('WEALTH POTENTIAL CERTIFICATE', canvas.width/2, 350);

      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(state.name, canvas.width/2, 450);

      ctx.fillStyle = 'rgba(212,175,55,0.05)';
      roundRect(ctx, 140, 500, 240, 100, 6);
      ctx.fill();
      roundRect(ctx, 420, 500, 240, 100, 6);
      ctx.fill();
      roundRect(ctx, 140, 620, 240, 100, 6);
      ctx.fill();
      roundRect(ctx, 420, 620, 240, 100, 6);
      ctx.fill();

      ctx.fillStyle = '#8c763d';
      ctx.font = '14px monospace';
      ctx.fillText('POTENTIAL RATING', 260, 530);
      ctx.fillText('CAPABILITY', 540, 530);
      ctx.fillText('CURRENT PROB.', 260, 650);
      ctx.fillText('OPTIMIZED PROB.', 540, 650);

      ctx.fillStyle = '#1e252b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('EXCEPTIONAL', 260, 575);
      ctx.fillText(shorthand(rawPotential), 540, 575);
      ctx.fillText('38%', 260, 695);
      ctx.fillText('84%', 540, 695);
    } else if (type === 'resume') {
      const gpa = state.savingsHabit === 'first' ? '8.8' : (state.savingsHabit === 'leftover' ? '6.4' : '4.2');
      ctx.fillStyle = '#faf8f5';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      roundRect(ctx, 95, 235, 610, 630, 8);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('BLINKMONEY CREDIT MATRIX', canvas.width/2, 300);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('FINANCIAL RESUME', canvas.width/2, 360);

      ctx.font = '20px sans-serif';
      ctx.fillText(`Savings Habits: ★★★★☆`, 140, 450);
      ctx.fillText(`Investing Discipline: ★★☆☆☆`, 140, 500);
      ctx.fillText(`Emergency Readiness: ★★★☆☆`, 140, 550);
      ctx.fillText(`Debt Risk Control: ★★★★★`, 140, 600);

      ctx.fillStyle = '#8c763d';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`FINANCIAL GPA: ${gpa} / 10`, canvas.width/2, 700);
    } else {
      // Fallback details text render for simplicity on other documents
      ctx.fillStyle = '#1f3d34';
      roundRect(ctx, 80, 220, 640, 660, 12);
      ctx.fill();

      ctx.fillStyle = '#2fd178';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${type.replace('_',' ').toUpperCase()}`, canvas.width/2, 320);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText(`Holder: ${state.name}`, canvas.width/2, 420);
      ctx.fillText(`Target Goal: ${state.goal}`, canvas.width/2, 470);
      ctx.fillText(`Recovery Potential: ${shorthand(state.monthlyLeakTotal * 12)}/year`, canvas.width/2, 520);
      ctx.fillText(`Verification Date: ${dateStr}`, canvas.width/2, 570);

      ctx.fillStyle = '#e8b53c';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('VERIFIED BY BLINKMONEY F.B.I.', canvas.width/2, 700);
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `blinkmoney_fib_${type}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playSound('stamp');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ─────────────── COUNTER ANIMATION HELPERS ─────────────── */
  function animateCounter(id, from, to, type) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const duration = 1200;
    const startTime = performance.now();

    function step(ts) {
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentVal = from + (to - from) * ease;
      
      if (type === 'currency') {
        el.textContent = formatCurrency(currentVal);
      } else if (type === 'shorthand') {
        el.textContent = shorthand(currentVal);
      } else {
        el.textContent = Math.round(currentVal);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = type === 'currency' ? formatCurrency(to) : (type === 'shorthand' ? shorthand(to) : Math.round(to));
      }
    }
    requestAnimationFrame(step);
  }

  /* ─────────────── INTERACTIVE MOUSE PARALLAX TILT ─────────────── */
  const cards = document.querySelectorAll('.case-folder, .report-box, .vault-item');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Reduced tilt divisor from 10 to 25, and scale from 1.02 to 1.005 for stability
      const tiltX = (yc - y) / 25;
      const tiltY = (x - xc) / 25;
      
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.005, 1.005, 1.005)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
