// Shared helpers for Homerun prototype
(function() {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const storage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : (fallback ?? null);
      } catch { return fallback ?? null; }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    ensure(key, value) {
      if (localStorage.getItem(key) == null) localStorage.setItem(key, JSON.stringify(value));
      return storage.get(key, value);
    }
  };

  function showToast(message, opts={}) {
    const cId = 'toast-container';
    let container = document.getElementById(cId);
    if (!container) {
      container = document.createElement('div');
      container.id = cId;
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => t.remove(), opts.duration || 2200);
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function getCurrentUser() {
    return storage.ensure('currentUser', { id: 'u1', name: 'Ava Chen', team: 'Penn Women\'s Track', role: 'Captain' });
  }
  function setCurrentUser(user) {
    storage.set('currentUser', user);
    document.dispatchEvent(new CustomEvent('role:changed', { detail: user }));
  }
  function isCaptain() {
    const u = getCurrentUser();
    return (u.role || '').toLowerCase() === 'captain';
  }

  function initHeaderActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.primary-nav a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
  }

  function initRoleSwitcher() {
    const container = $('.header-actions');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'segmented';
    wrap.setAttribute('role', 'tablist');
    const bAthlete = document.createElement('button');
    bAthlete.textContent = 'Athlete';
    const bCaptain = document.createElement('button');
    bCaptain.textContent = 'Captain';
    wrap.append(bAthlete, bCaptain);
    container.prepend(wrap);

    function render() {
      const u = getCurrentUser();
      bAthlete.classList.toggle('active', (u.role||'') === 'Athlete');
      bCaptain.classList.toggle('active', (u.role||'') === 'Captain');
      // Mode indicator chip
      let chip = document.getElementById('mode-chip');
      if (!chip) {
        chip = document.createElement('span');
        chip.id = 'mode-chip';
        chip.className = 'chip badge';
        container.appendChild(chip);
      }
      chip.textContent = (u.role||'Athlete') + ' Mode';
    }
    render();

    bAthlete.addEventListener('click', () => { const u = getCurrentUser(); u.role = 'Athlete'; setCurrentUser(u); render(); showToast('Switched to Athlete view'); });
    bCaptain.addEventListener('click', () => { const u = getCurrentUser(); u.role = 'Captain'; setCurrentUser(u); render(); showToast('Switched to Captain view'); });

    document.addEventListener('role:changed', render);
  }

  // Simple Undo/Redo manager
  const Undo = (()=>{
    const undos = [];
    const redos = [];
    function push(entry){ if(!entry || typeof entry.undo!== 'function') return; undos.push(entry); redos.length = 0; showToast(entry.label || 'Action done'); }
    function canUndo(){ return undos.length>0; }
    function canRedo(){ return redos.length>0; }
    function undo(){ const e = undos.pop(); if(!e) return; try { e.undo(); showToast(e.undoLabel || 'Undone'); redos.push(e); } catch{} }
    function redo(){ const e = redos.pop(); if(!e) return; try { e.redo?.(); showToast(e.redoLabel || 'Redone'); undos.push(e); } catch{} }
    return { push, undo, redo, canUndo, canRedo };
  })();

  // Help / Settings modals
  function ensureModal(id, title, bodyHTML){
    let host = document.getElementById(id);
    if (host) return host;
    host = document.createElement('div');
    host.id = id;
    host.className = 'modal-backdrop';
    host.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="btn btn-ghost" data-close>✕</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
      </div>`;
    document.body.appendChild(host);
    host.querySelector('[data-close]')?.addEventListener('click', ()=> host.classList.remove('show'));
    return host;
  }
  function openHelp(){
    const body = `
      <div class='col'>
        <p><strong>Captain Mode</strong>: Switch using the header toggle to access captain-only actions like approving join requests and toggling team away status.</p>
        <p><strong>Locker Crush</strong>: Send an anonymous or identified note from the Cupid page. You can undo a send right after.</p>
        <p><strong>Captain’s Corner</strong>: A private space for captains to manage topics and requests. Visible only in Captain mode.</p>
        <div class='divider'></div>
        <p><strong>Shortcuts</strong>: A = Athlete, C = Captain, ? = Help, Ctrl+Z = Undo, Ctrl+Shift+Z or Ctrl+Y = Redo.</p>
      </div>`;
    const host = ensureModal('help-modal', 'Help & Shortcuts', body);
    host.classList.add('show');
  }

  function openSettings(){
    const current = { cupid: storage.ensure('featureCupid', true) };
    const body = document.createElement('div');
    body.className = 'col';
    body.innerHTML = `
      <label class='row' style='justify-content:space-between'>
        <span>Show Cupid feature</span>
        <input type='checkbox' id='feature-cupid'>
      </label>
      <p class='muted'>Hiding Cupid removes it from navigation and the home page.</p>`;
    const host = ensureModal('settings-modal', 'Settings', body.outerHTML);
    host.classList.add('show');
    // Re-query after insertion
    const checkbox = host.querySelector('#feature-cupid');
    if (checkbox){
      checkbox.checked = !!current.cupid;
      checkbox.addEventListener('change', ()=>{
        storage.set('featureCupid', checkbox.checked);
        applyFeatureVisibility();
        showToast(checkbox.checked ? 'Cupid enabled' : 'Cupid hidden');
      });
    }
  }

  function applyFeatureVisibility(){
    const enabled = storage.ensure('featureCupid', true);
    $$('.primary-nav a').forEach(a=>{
      if (a.getAttribute('href') === 'cupid.html') a.style.display = enabled? '' : 'none';
    });
    // Home card
    if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')){
      const cards = $$('a.card[href="cupid.html"]');
      cards.forEach(c=> c.style.display = enabled? '' : 'none');
    }
    // On Cupid page, if disabled, overlay a notice
    if (location.pathname.endsWith('cupid.html') && !enabled){
      let blocker = document.getElementById('feature-block');
      if (!blocker){
        blocker = document.createElement('div');
        blocker.id = 'feature-block';
        blocker.className = 'card';
        blocker.innerHTML = "<div class='col'><h2>Cupid is hidden</h2><p class='muted'>Enable it in Settings to use swipe and Locker Crush.</p><div class='row'><button class='btn btn-secondary' id='open-settings'>Open Settings</button></div></div>";
        const main = document.querySelector('main.container');
        if (main) main.prepend(blocker);
        blocker.querySelector('#open-settings')?.addEventListener('click', openSettings);
      }
      // Hide functional areas if present
      const swipe = document.getElementById('card-stack'); if (swipe) swipe.style.display = 'none';
      const aside = document.querySelector('aside.card'); if (aside) aside.style.display = 'none';
    }
  }

  function initHeaderUtilities(){
    const container = $('.header-actions'); if (!container) return;
    const helpBtn = document.createElement('button'); helpBtn.className='btn btn-ghost'; helpBtn.textContent='Help'; helpBtn.title='?'; helpBtn.addEventListener('click', openHelp);
    const settingsBtn = document.createElement('button'); settingsBtn.className='btn btn-secondary'; settingsBtn.textContent='Settings'; settingsBtn.addEventListener('click', openSettings);
    container.append(helpBtn, settingsBtn);
  }

  function isTypingTarget(el){
    return el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA' || el.isContentEditable);
  }

  function initGlobalShortcuts(){
    document.addEventListener('keydown', (e)=>{
      if (isTypingTarget(document.activeElement)){
        // Allow Ctrl+Enter to send in message compose
        if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='enter'){
          const send = document.getElementById('send-btn'); if (send) { e.preventDefault(); send.click(); }
        }
        // Locker: Ctrl+S to save outfit
        if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){
          if (location.pathname.endsWith('locker.html')) { e.preventDefault(); document.getElementById('save-outfit')?.click(); }
        }
        return;
      }
      const k = e.key.toLowerCase();
      if ((e.ctrlKey||e.metaKey) && !e.shiftKey && k==='z'){ e.preventDefault(); Undo.undo(); }
      if (((e.ctrlKey||e.metaKey) && e.shiftKey && k==='z') || ((e.ctrlKey||e.metaKey) && k==='y')){ e.preventDefault(); Undo.redo(); }
      if (k==='?'){ e.preventDefault(); openHelp(); }
      if (k==='a'){ const u = getCurrentUser(); u.role='Athlete'; setCurrentUser(u); showToast('Athlete mode'); }
      if (k==='c'){ const u = getCurrentUser(); u.role='Captain'; setCurrentUser(u); showToast('Captain mode'); }
      // Cupid page quick keys
      if (location.pathname.endsWith('cupid.html')){
        if (k==='arrowleft'){ $('#pass')?.click(); }
        if (k==='arrowright'){ $('#like')?.click(); }
        if (k==='i'){ $('#info')?.click(); }
      }
      // Locker quick toggle
      if (location.pathname.endsWith('locker.html')){
        if (k==='l'){ $('#toggle-locker')?.click(); }
      }
    });
  }

  function kebabMenu(items=[]) {
    const menu = document.createElement('div');
    menu.className = 'card';
    items.forEach(it => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-ghost';
      btn.textContent = it.label;
      btn.addEventListener('click', () => { it.onClick?.(); menu.remove(); });
      menu.appendChild(btn);
    });
    return menu;
  }

  // Mock API for simulating data fetching
  const MockAPI = {
    async fetch(endpoint, options = {}) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

      const { method = 'GET', body } = options;

      // Mock responses based on endpoint
      if (endpoint === '/api/events') {
        return {
          ok: true,
          json: async () => MockData.events.map(e => ({
            ...e,
            _fetched: true,
            lastUpdated: new Date().toISOString()
          }))
        };
      }

      if (endpoint === '/api/schedule') {
        return {
          ok: true,
          json: async () => ({
            ...MockData.lockerProfile.schedule,
            _fetched: true,
            lastSynced: new Date().toISOString()
          })
        };
      }

      if (endpoint === '/api/teams') {
        return {
          ok: true,
          json: async () => MockData.teams.map(t => ({
            ...t,
            _fetched: true,
            memberCount: Math.floor(Math.random() * 20) + 10
          }))
        };
      }

      // Default mock response
      return {
        ok: Math.random() > 0.1, // 10% chance of error
        json: async () => ({ message: 'Mock API response', endpoint, method })
      };
    }
  };

  // Expose globally
  window.Homerun = {
    $, $$, storage, showToast, formatTime, formatDate, getCurrentUser, setCurrentUser, isCaptain, initHeaderActiveNav, initRoleSwitcher, kebabMenu, Undo,
    openHelp, openSettings, applyFeatureVisibility, MockAPI
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderActiveNav();
    initRoleSwitcher();
    initHeaderUtilities();
    initGlobalShortcuts();
    applyFeatureVisibility();
    // Onboarding
    const onboarded = storage.ensure('onboarded', false);
    if (!onboarded) {
      openHelp();
      storage.set('onboarded', true);
    }
  });
})();


