// app.js - MyOS
// windows, taskbar, apps, theme stuff. everything saves to localStorage
// so refreshing doesn't wipe your session out

const WINDOW_IDS = ['about-app', 'notes-app', 'calc-app', 'todo-app', 'theme-app'];
const STORAGE_KEY = 'webos-state-v2';

let maxZ = 100;
let state = loadState();

// boot screen - typed out like a real boot log instead of a boring progress bar
const BOOT_LINES_FULL = [
  'MYOS v2.0 — stardance build',
  '',
  'loading kernel ............ ok',
  'mounting /desktop .......... ok',
  'starting window manager .... ok',
  'restoring last session ..... ok',
  '',
  'ready.'
];
// shorter version so it doesn't get annoying every time you reload
const BOOT_LINES_QUICK = ['MYOS v2.0', 'restoring last session ... ok', '', 'ready.'];

function playBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const container = document.getElementById('boot-lines');
  const alreadyBooted = sessionStorage.getItem('webos-booted');
  const lines = alreadyBooted ? BOOT_LINES_QUICK : BOOT_LINES_FULL;
  const stepDelay = alreadyBooted ? 90 : 220;

  lines.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.textContent = line;
      container.appendChild(div);
    }, i * stepDelay);
  });

  const totalDelay = lines.length * stepDelay + 550;
  setTimeout(() => {
    bootScreen.classList.add('hidden');
    sessionStorage.setItem('webos-booted', '1');
  }, totalDelay);
}

// clock in the top bar, updates every second
function initClock() {
  const clockEl = document.getElementById('clock-widget');

  function update() {
    const date = new Date();
    clockEl.textContent = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  update();
  setInterval(update, 1000);
}

// ---- state / localStorage ----

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // if the saved state is corrupted somehow just start fresh, not worth crashing over
  }

  const fresh = { windows: {}, theme: 'dark', custom: null, notes: '', todos: [] };
  WINDOW_IDS.forEach(id => {
    fresh.windows[id] = { open: false, minimized: false, top: null, left: null, z: 100 };
  });
  return fresh;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- window management ----
// used to check win.style.display === 'none' to decide open/closed which was
// broken (empty string isn't 'none' so first click always did the wrong thing).
// now everything reads from this state object instead of the DOM.

function bringToFront(id) {
  maxZ++;
  state.windows[id].z = maxZ;
  const el = document.getElementById(id);
  if (el) el.style.zIndex = maxZ;
}

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  state.windows[id].open = true;
  state.windows[id].minimized = false;
  win.classList.add('open');
  win.classList.remove('minimized');

  bringToFront(id);
  renderTaskbar();
  saveState();
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  state.windows[id].open = false;
  state.windows[id].minimized = false;
  win.classList.remove('open');
  win.classList.remove('minimized');

  renderTaskbar();
  saveState();
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  state.windows[id].minimized = true;
  win.classList.add('minimized');

  renderTaskbar();
  saveState();
}

function restoreWindow(id) {
  state.windows[id].minimized = false;
  const win = document.getElementById(id);
  win.classList.remove('minimized');
  bringToFront(id);
  renderTaskbar();
  saveState();
}

function toggleFromTaskbar(id) {
  if (state.windows[id].minimized) {
    restoreWindow(id);
  } else {
    minimizeWindow(id);
  }
}

function applyStoredPositions() {
  WINDOW_IDS.forEach(id => {
    const win = document.getElementById(id);
    const w = state.windows[id];
    if (!win || !w) return;

    if (w.top !== null && w.left !== null) {
      win.style.top = w.top + 'px';
      win.style.left = w.left + 'px';
    }
    win.style.zIndex = w.z || 100;
    maxZ = Math.max(maxZ, w.z || 100);

    if (w.open) win.classList.add('open');
    if (w.minimized) win.classList.add('minimized');
  });
}

// ---- taskbar ----

function renderTaskbar() {
  const bar = document.getElementById('taskbar');
  bar.innerHTML = '';

  const labels = {
    'about-app': '👤 about_me',
    'notes-app': '📝 scratchpad',
    'calc-app': '🧮 calc.exe',
    'todo-app': '✅ tasks',
    'theme-app': '🎨 appearance'
  };

  WINDOW_IDS.forEach(id => {
    const w = state.windows[id];
    if (!w.open) return;

    const btn = document.createElement('button');
    btn.className = 'taskbar-item' + (w.minimized ? ' minimized' : '');
    btn.textContent = labels[id] || id;
    btn.onclick = () => toggleFromTaskbar(id);
    bar.appendChild(btn);
  });
}

// ---- themes ----

function applyPreset(themeName) {
  document.body.classList.remove('bg-dark', 'bg-sunset', 'bg-cyber', 'bg-custom');
  document.body.classList.add('bg-' + themeName);
  state.theme = themeName;
  saveState();
}

function applyCustomTheme() {
  const bg1 = document.getElementById('color-bg1').value;
  const bg2 = document.getElementById('color-bg2').value;
  const accent = document.getElementById('color-accent').value;
  const text = document.getElementById('color-text').value;

  document.documentElement.style.setProperty('--custom-bg1', bg1);
  document.documentElement.style.setProperty('--custom-bg2', bg2);
  document.documentElement.style.setProperty('--custom-accent', accent);
  document.documentElement.style.setProperty('--custom-text', text);

  document.body.classList.remove('bg-dark', 'bg-sunset', 'bg-cyber');
  document.body.classList.add('bg-custom');

  state.theme = 'custom';
  state.custom = { bg1, bg2, accent, text };
  saveState();
}

function restoreTheme() {
  if (state.theme === 'custom' && state.custom) {
    document.getElementById('color-bg1').value = state.custom.bg1;
    document.getElementById('color-bg2').value = state.custom.bg2;
    document.getElementById('color-accent').value = state.custom.accent;
    document.getElementById('color-text').value = state.custom.text;
    applyCustomTheme();
  } else {
    applyPreset(state.theme || 'dark');
  }
}

const WALLPAPER_CYCLE = ['dark', 'sunset', 'cyber'];
function cycleWallpaper() {
  const current = WALLPAPER_CYCLE.includes(state.theme) ? state.theme : 'dark';
  const next = WALLPAPER_CYCLE[(WALLPAPER_CYCLE.indexOf(current) + 1) % WALLPAPER_CYCLE.length];
  applyPreset(next);
  hideContextMenu();
}

// ---- right click menu + start menu ----

function initMenus() {
  const ctxMenu = document.getElementById('context-menu');
  const desktop = document.getElementById('desktop');

  desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    hideStartMenu();
    ctxMenu.style.top = e.clientY + 'px';
    ctxMenu.style.left = e.clientX + 'px';
    ctxMenu.classList.add('visible');
  });

  // close menus if you click anywhere else
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-menu') && !e.target.closest('.start-btn')) hideStartMenu();
    if (!e.target.closest('#context-menu')) hideContextMenu();
  });
}

function hideContextMenu() {
  document.getElementById('context-menu').classList.remove('visible');
}

function toggleStartMenu() {
  hideContextMenu();
  document.getElementById('start-menu').classList.toggle('visible');
}

function hideStartMenu() {
  document.getElementById('start-menu').classList.remove('visible');
}

// ---- notes (auto save) ----

function initNotes() {
  const textarea = document.getElementById('notes-text');
  textarea.value = state.notes || '';
  textarea.addEventListener('input', () => {
    state.notes = textarea.value;
    saveState();
  });
}

// ---- calculator ----

let calcExpression = '';

function calcRender() {
  const display = document.getElementById('calc-display');
  display.textContent = calcExpression === '' ? '0' : calcExpression;
}

function calcInput(value) {
  // don't let people type two operators back to back (5++3 shouldn't happen)
  const lastChar = calcExpression.slice(-1);
  const isOperator = ch => ['+', '-', '*', '/', '%'].includes(ch);

  if (isOperator(value) && isOperator(lastChar)) {
    calcExpression = calcExpression.slice(0, -1) + value;
  } else {
    calcExpression += value;
  }
  calcRender();
}

function calcClear() {
  calcExpression = '';
  calcRender();
}

function calcBackspace() {
  calcExpression = calcExpression.slice(0, -1);
  calcRender();
}

function calcEquals() {
  if (!calcExpression) return;

  // only allow digits/operators through before eval-ing anything, just to be safe
  if (!/^[0-9+\-*/.%\s]+$/.test(calcExpression)) {
    calcExpression = 'Error';
    calcRender();
    return;
  }

  try {
    const result = Function('"use strict"; return (' + calcExpression.replace(/%/g, '/100') + ')')();
    calcExpression = String(Number(result.toFixed(8)));
  } catch (e) {
    calcExpression = 'Error';
  }
  calcRender();
}

// ---- todo list ----

function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  if (state.todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-empty';
    empty.textContent = 'nothing here yet — add your first task above.';
    list.appendChild(empty);
    return;
  }

  state.todos.forEach((todo, index) => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.onchange = () => toggleTodo(index);

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => deleteTodo(index);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  state.todos.push({ text, done: false });
  input.value = '';
  saveState();
  renderTodos();
}

function toggleTodo(index) {
  state.todos[index].done = !state.todos[index].done;
  saveState();
  renderTodos();
}

function deleteTodo(index) {
  state.todos.splice(index, 1);
  saveState();
  renderTodos();
}

// ---- dragging + z-index stacking ----

function initDragging() {
  document.querySelectorAll('.window').forEach(win => {
    const header = win.querySelector('.window-header');
    let dragging = false;
    let startX = 0, startY = 0;

    // bring to front on click anywhere in the window, not just the header
    win.addEventListener('mousedown', () => bringToFront(win.id));

    header.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX - win.offsetLeft;
      startY = e.clientY - win.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;

      const newTop = e.clientY - startY;
      const newLeft = e.clientX - startX;

      win.style.top = newTop + 'px';
      win.style.left = newLeft + 'px';

      state.windows[win.id].top = newTop;
      state.windows[win.id].left = newLeft;
    });

    document.addEventListener('mouseup', () => {
      if (dragging) saveState();
      dragging = false;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  playBootSequence();
  initClock();
  applyStoredPositions();
  restoreTheme();
  initNotes();
  renderTodos();
  calcRender();
  initDragging();
  initMenus();
  renderTaskbar();
});