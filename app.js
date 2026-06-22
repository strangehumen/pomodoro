/* =====================
   ポモドーロタイマー app.js
   Day 2 of 30 — 2026-06-12
   ===================== */

'use strict';

// ---- 設定 -----------------------------------------------------------------

const DEFAULTS = {
  work:  25, // 分
  break:  5, // 分
};

const DURATIONS = {
  work:  DEFAULTS.work  * 60,
  break: DEFAULTS.break * 60,
};

const CIRCUMFERENCE = 2 * Math.PI * 100; // r=100

// ---- 状態 -----------------------------------------------------------------

let mode = 'work';            // 'work' | 'break'
let remaining = DURATIONS.work;
let isRunning = false;
let intervalId = null;
let sessionCount = 0;

// ---- DOM 参照 --------------------------------------------------------------

const timeDisplay   = document.getElementById('timeDisplay');
const modeTitle     = document.getElementById('modeTitle');
const progressRing  = document.getElementById('progressRing');
const startBtn      = document.getElementById('startBtn');
const resetBtn      = document.getElementById('resetBtn');
const skipBtn       = document.getElementById('skipBtn');
const modeBtns      = document.querySelectorAll('.mode-btn');
const sessionCountEl = document.getElementById('sessionCount');
const iconPlay      = startBtn.querySelector('.icon-play');
const iconPause     = startBtn.querySelector('.icon-pause');
const settingsBtn   = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const workInput     = document.getElementById('workInput');
const breakInput    = document.getElementById('breakInput');
const applyBtn      = document.getElementById('applyBtn');
const workLabel     = document.getElementById('workLabel');
const breakLabel    = document.getElementById('breakLabel');

// ---- 初期化 ----------------------------------------------------------------

progressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
updateDisplay();

// ---- イベント --------------------------------------------------------------

startBtn.addEventListener('click', toggleStartPause);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', () => switchMode(getOtherMode(), false));

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode !== mode) {
      switchMode(btn.dataset.mode, false);
    }
  });
});

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
  settingsBtn.classList.toggle('active');
});

applyBtn.addEventListener('click', applySettings);

[workInput, breakInput].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') applySettings();
  });
});

// ---- 機能 ------------------------------------------------------------------

function toggleStartPause() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (remaining <= 0) return;

  isRunning = true;
  document.body.classList.add('running');
  iconPlay.style.display = 'none';
  iconPause.style.display = '';
  startBtn.setAttribute('aria-label', '一時停止');

  intervalId = setInterval(() => {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      document.body.classList.remove('running');

      if (mode === 'work') {
        sessionCount++;
        sessionCountEl.textContent = `完了セッション: ${sessionCount}`;
      }

      // 次のモードへ自動切り替え（自動開始はしない）
      switchMode(getOtherMode(), false);
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(intervalId);
  document.body.classList.remove('running');
  iconPlay.style.display = '';
  iconPause.style.display = 'none';
  startBtn.setAttribute('aria-label', 'スタート');
}

function resetTimer() {
  pauseTimer();
  remaining = DURATIONS[mode];
  updateDisplay();
}

function switchMode(newMode, keepRunning) {
  pauseTimer();
  mode = newMode;
  remaining = DURATIONS[mode];

  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.body.classList.toggle('break-mode', mode === 'break');
  modeTitle.textContent = mode === 'work' ? '作業時間' : '休憩時間';

  updateDisplay();

  if (keepRunning) startTimer();
}

function getOtherMode() {
  return mode === 'work' ? 'break' : 'work';
}

function applySettings() {
  let workMin  = parseInt(workInput.value, 10);
  let breakMin = parseInt(breakInput.value, 10);

  // バリデーション（不正値はデフォルトへ）
  if (isNaN(workMin)  || workMin  < 1) workMin  = DEFAULTS.work;
  if (isNaN(breakMin) || breakMin < 1) breakMin = DEFAULTS.break;
  workMin  = Math.min(workMin, 180);
  breakMin = Math.min(breakMin, 60);

  workInput.value  = workMin;
  breakInput.value = breakMin;

  DURATIONS.work  = workMin  * 60;
  DURATIONS.break = breakMin * 60;

  workLabel.textContent  = workMin;
  breakLabel.textContent = breakMin;

  pauseTimer();
  remaining = DURATIONS[mode];
  updateDisplay();

  settingsPanel.classList.remove('open');
  settingsBtn.classList.remove('active');
}

// ---- 描画 ------------------------------------------------------------------

function updateDisplay() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timeDisplay.textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // プログレスリング更新
  const total = DURATIONS[mode];
  const progress = remaining / total; // 1 -> 0
  const offset = CIRCUMFERENCE * (1 - progress);
  progressRing.style.strokeDashoffset = `${offset}`;

  // タブタイトルにも反映
  document.title = `${timeDisplay.textContent} - ${mode === 'work' ? '作業中' : '休憩中'}`;
}