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
    }
    render();

    bAthlete.addEventListener('click', () => { const u = getCurrentUser(); u.role = 'Athlete'; setCurrentUser(u); render(); showToast('Switched to Athlete view'); });
    bCaptain.addEventListener('click', () => { const u = getCurrentUser(); u.role = 'Captain'; setCurrentUser(u); render(); showToast('Switched to Captain view'); });

    document.addEventListener('role:changed', render);
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

  // Expose globally
  window.Homerun = {
    $, $$, storage, showToast, formatTime, formatDate, getCurrentUser, setCurrentUser, isCaptain, initHeaderActiveNav, initRoleSwitcher, kebabMenu
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderActiveNav();
    initRoleSwitcher();
  });
})();


