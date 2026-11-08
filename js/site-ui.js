'use strict';
(() => {
  const variant = document.body.dataset.variant;
  if (variant !== 'A') return;
  const menu = document.getElementById('navDrawer');
  const menuButton = document.getElementById('menuToggle');
  const search = document.getElementById('searchTray');
  const searchButton = document.getElementById('searchToggle');
  const filter = document.getElementById('aFilterPanel');
  const filterButton = document.getElementById('filterToggle');
  const searchInput = document.getElementById('searchInput');
  function closeAll(except = '') {
    if (except !== 'nav') { menu.hidden = true; menuButton.setAttribute('aria-expanded','false'); }
    if (except !== 'search') { search.hidden = true; searchButton.setAttribute('aria-expanded','false'); }
    if (except !== 'filter') { filter.hidden = true; filterButton.setAttribute('aria-expanded','false'); filterButton.querySelector('span').textContent = '+'; }
  }
  menuButton.addEventListener('click', () => { const shouldOpen = menu.hidden;closeAll('nav');menu.hidden = !shouldOpen;menuButton.setAttribute('aria-expanded',String(shouldOpen)); });
  searchButton.addEventListener('click', () => { const shouldOpen = search.hidden;closeAll('search');search.hidden = !shouldOpen;searchButton.setAttribute('aria-expanded',String(shouldOpen));if (shouldOpen) searchInput.focus(); });
  filterButton.addEventListener('click', () => { const shouldOpen = filter.hidden;closeAll('filter');filter.hidden = !shouldOpen;filterButton.setAttribute('aria-expanded',String(shouldOpen));filterButton.querySelector('span').textContent = shouldOpen ? '−' : '+'; });
  document.querySelectorAll('[data-toggle-close]').forEach(btn => btn.addEventListener('click', () => closeAll()));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeAll()));
  searchInput.addEventListener('input', () => { const collection = document.getElementById('collection');if (searchInput.value.trim()) collection.scrollIntoView({behavior:'smooth',block:'start'}); });
  document.addEventListener('keydown', event => {if(event.key === 'Escape')closeAll();});
  document.addEventListener('click', event => {
    if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target))closeAll();
  });
})();
