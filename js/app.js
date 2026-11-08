'use strict';
(() => {
  const products = window.ATELIER_PRODUCTS;
  const tasks = window.ATELIER_TASKS;
  const variant = document.body.dataset.variant;
  const researchKey = 'atelier_study_session';
  let session = parseJSON(localStorage.getItem(researchKey), null);
  const study = new URLSearchParams(location.search).get('study') === '1' && !!session && session.version === variant;
  const stateKey = study ? `atelier_shop_study_${session.id}` : `atelier_shop_preview_${variant}`;
  const emptyState = () => ({cart: {}, favorites: [], filter: 'all', sort: 'default', query: ''});
  let state = parseJSON((study ? sessionStorage : localStorage).getItem(stateKey), null) || emptyState();
  if (!state.cart || !Array.isArray(state.favorites)) state = emptyState();

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const get = id => products.find(product => product.id === id);
  const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const store = () => (study ? sessionStorage : localStorage).setItem(stateKey, JSON.stringify(state));
  const storeSession = () => {if (study) localStorage.setItem(researchKey, JSON.stringify(session));};
  const toast = $('#toast');
  let toastTimer;
  function notify(text){toast.textContent = text;toast.hidden = false;clearTimeout(toastTimer);toastTimer = setTimeout(() => toast.hidden = true, 2400);}
  function modal(id){const dialog = $(id);if (dialog && !dialog.open) dialog.showModal();}
  function closeDialog(dialog){if (dialog?.open) dialog.close();}
  function totalCount(){return Object.values(state.cart).reduce((n, qty) => n + Number(qty || 0), 0);}
  function refreshCounts(){
    $$('[data-count="favorite"]').forEach(el => el.textContent = state.favorites.length);
    $$('[data-count="cart"]').forEach(el => el.textContent = totalCount());
  }
  function logAction(){if (!study || !session.firstLook || session.completed) return; session.actions = (session.actions || 0) + 1; storeSession();}
  function getActiveTask(){return tasks[session?.taskIndex ?? 0] || null;}
  function progressTick(type, id = '', active = true){
    if (!study || !session.firstLook || session.completed) return;
    logAction();
    const task = getActiveTask();
    if (!task) return;
    const good = (task.id === 1 && type === 'detail' && id === task.productId) ||
      (task.id === 2 && type === 'favorite' && id === task.productId && active) ||
      (task.id === 3 && type === 'checkout' && (state.cart[task.productId] || 0) > 0);
    const wrong = (task.id === 1 && type === 'detail' && id !== task.productId) ||
      (task.id === 2 && type === 'favorite' && (id !== task.productId || !active)) ||
      (task.id === 3 && ((type === 'cart' && id !== task.productId) || (type === 'checkout' && !(state.cart[task.productId] > 0))));
    const result = session.tasks[session.taskIndex];
    if (wrong) result.nontarget = (result.nontarget || 0) + 1;
    if (good) {
      result.success = true;
      result.duration_ms = Math.max(1, Date.now() - result.started_at);
      result.finished_at = Date.now();
      session.taskIndex++;
      if (session.taskIndex < tasks.length) prepareTask();
      storeSession();
      updateStudyUI();
      notify('Задание выполнено');
    } else if (wrong) storeSession();
  }
  function prepareTask(){
    if (!study || session.taskIndex >= tasks.length) return;
    const i = session.taskIndex;
    if (!session.tasks[i]) session.tasks[i] = {id:tasks[i].id,started_at:Date.now(),duration_ms:0,success:false,skipped:false,nontarget:0};
  }
  function updateStudyUI(){
    if (!study || !session.firstLook) return;
    const panel = $('#studyPanel'); panel.hidden = false;
    const i = session.taskIndex;
    $('#taskNumber').textContent = `${Math.min(i + 1,tasks.length)} / ${tasks.length}`;
    $('#taskText').textContent = i < tasks.length ? tasks[i].text : 'Все задания завершены. Перейдите к финальной анкете.';
    $('#taskProgress').style.width = `${Math.round((i / tasks.length)*100)}%`;
    $('#skipTask').hidden = i >= tasks.length;
    $('#finishTasks').hidden = i < tasks.length;
  }
  function addRatingFields(){
    $$('[data-rating]').forEach(wrapper => {
      const name = wrapper.dataset.rating;
      wrapper.innerHTML = Array.from({length:7}, (_, index) => {
        const score = index + 1;
        return `<label><input type="radio" name="${name}" value="${score}" required><span>${score}</span></label>`;
      }).join('');
    });
  }
  function beginStudy(){
    if (!study || session.completed) return;
    addRatingFields();
    if (session.firstLook){prepareTask();updateStudyUI();}
    else {
      const launcher = $('#firstLookLauncher');
      if (launcher) {
        launcher.hidden = false;
        launcher.addEventListener('click', () => {launcher.hidden = true;$('#firstLookPanel').hidden = false;}, {once:true});
      } else $('#firstLookPanel').hidden = false;
    }
    $('#firstLookForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      session.firstLook = {beauty:Number(fields.get('firstBeauty')), ease:Number(fields.get('firstEase'))};
      session.tasks = [];
      session.taskIndex = 0;
      session.actions = 0;
      storeSession();
      $('#firstLookPanel').hidden = true;
      prepareTask();
      updateStudyUI();
      window.scrollTo({top:0,behavior:'instant'});
    });
    $('#skipTask')?.addEventListener('click', () => {
      const task = getActiveTask(); if (!task) return;
      const record = session.tasks[session.taskIndex];
      record.duration_ms = Math.max(1,Date.now() - record.started_at);
      record.finished_at = Date.now();record.skipped = true;record.success = false;
      session.taskIndex++;
      if (session.taskIndex < tasks.length) prepareTask();
      storeSession();updateStudyUI();notify('Переходим к следующему заданию');
    });
    $('#finishTasks')?.addEventListener('click', () => {session.completed = true;storeSession();location.href='./survey.html';});
    $('#minimizeTask')?.addEventListener('click', event => {
      const body = $('#studyBody'); body.hidden = !body.hidden;
      event.currentTarget.setAttribute('aria-expanded',String(!body.hidden));
      event.currentTarget.textContent = body.hidden ? '+' : '−';
    });
  }
  function catalogProducts(){
    let filtered = [...products];
    if(state.filter !== 'all') filtered = filtered.filter(p => p.category === state.filter);
    const q = String(state.query||'').toLowerCase().trim();
    if(q) filtered = filtered.filter(p => `${p.name} ${p.desc} ${p.categoryLabel}`.toLowerCase().includes(q));
    if(state.sort === 'low') filtered.sort((a,b)=>a.price-b.price);
    else if(state.sort === 'high') filtered.sort((a,b)=>b.price-a.price);
    else if(state.sort === 'alpha') filtered.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    return filtered;
  }
  function renderCatalog(){
    const shown = catalogProducts();
    $('#productGrid').innerHTML = shown.map(p => `
      <article class="product-card" data-product-id="${p.id}" aria-label="${p.name}">
        <div class="product-media">
          <button class="product-image-button" type="button" data-detail="${p.id}" aria-label="Открыть ${p.name}"><img class="product-image" src="${p.image}" alt="${p.name}" loading="eager" decoding="async" width="1122" height="1402"></button>
          <span class="product-tag">${p.tag}</span>
          <button class="product-save ${state.favorites.includes(p.id)?'is-active':''}" type="button" data-favorite="${p.id}" aria-label="${state.favorites.includes(p.id)?'Убрать из избранного':'Добавить в избранное'}: ${p.name}" aria-pressed="${state.favorites.includes(p.id)}">${state.favorites.includes(p.id)?'♥':'♡'}</button>
        </div>
        <div class="product-info">
          <div class="product-line"><div><div class="product-category">${p.categoryLabel}</div><h3 class="product-title">${p.name}</h3></div><span class="product-price">${money(p.price)}</span></div>
          <p class="product-desc">${p.desc}</p>
          <div class="product-controls"><button type="button" data-detail="${p.id}">Подробнее</button><button type="button" class="add-button" data-cart="${p.id}">В корзину +</button></div>
        </div>
      </article>`).join('');
    $('#resultsCount').textContent = `${shown.length} ${shown.length === 1 ? 'модель' : shown.length >=2 && shown.length <=4 ? 'модели' : 'моделей'}`;
    $('#noResults').hidden = shown.length > 0;
  }
  function renderCart(){
    const entries = Object.entries(state.cart).filter(([id,q]) => q>0 && get(id));
    $('#cartContent').innerHTML = entries.length ? entries.map(([id,quantity])=>{
      const item = get(id);return `<article class="drawer-item"><img src="${item.image}" alt="${item.name}" width="1122" height="1402"><div><h3>${item.name}</h3><p>${item.categoryLabel}</p><strong class="minor">${money(item.price)}</strong><div class="qty-controls"><button type="button" data-qty="${id}" data-delta="-1" aria-label="Уменьшить количество">−</button><span>${quantity}</span><button type="button" data-qty="${id}" data-delta="1" aria-label="Увеличить количество">+</button></div></div><button type="button" data-remove="${id}" aria-label="Удалить ${item.name}">×</button></article>`;
    }).join('') : '<p>Корзина пока пуста. Найдите вещь, которую хочется примерить.</p>';
    $('#cartFooter').hidden = !entries.length;
    $('#cartTotal').textContent = money(entries.reduce((sum,[id,q])=>sum + get(id).price*q,0));
  }
  function renderFavorites(){
    const items = state.favorites.map(get).filter(Boolean);
    $('#favoritesContent').innerHTML = items.length ? items.map(item=>`<article class="drawer-item"><img src="${item.image}" alt="${item.name}" width="1122" height="1402"><div><h3>${item.name}</h3><p>${money(item.price)}</p><button type="button" data-cart="${item.id}">В корзину +</button></div><button type="button" data-favorite="${item.id}" aria-label="Удалить из избранного">×</button></article>`).join('') : '<p>Здесь появятся сохранённые модели.</p>';
  }
  function openDetails(id){
    const item=get(id);if(!item)return;
    $('#detailContent').innerHTML=`<div class="detail-grid"><div class="detail-image"><img src="${item.image}" alt="${item.name}" width="1122" height="1402"></div><div class="detail-content"><span class="product-category">${item.categoryLabel} / ATELIER</span><h2>${item.name}</h2><p class="detail-price">${money(item.price)}</p><p>${item.desc}</p><p class="detail-material"><strong>Состав:</strong> ${item.material}</p><p>Коллекция ATELIER / 2026</p><div class="detail-actions"><button type="button" data-favorite="${item.id}">${state.favorites.includes(id)?'Убрать из избранного':'В избранное ♡'}</button><button type="button" class="primary" data-cart="${item.id}">В корзину +</button></div></div></div>`;
    modal('#detailDialog');progressTick('detail',id);
  }
  function toggleFavorite(id){
    if(!get(id))return;
    const found=state.favorites.includes(id);
    state.favorites=found?state.favorites.filter(x=>x!==id):[...state.favorites,id];
    store();refreshCounts();renderCatalog();renderFavorites();
    notify(found?'Удалено из избранного':'Сохранено в избранном');
    progressTick('favorite',id,!found);
    const detail=$('#detailDialog');if(detail.open){const button=detail.querySelector(`[data-favorite="${id}"]`);if(button)button.textContent=found?'В избранное ♡':'Убрать из избранного';}
  }
  function addCart(id){
    if(!get(id))return;
    state.cart[id]=(state.cart[id]||0)+1;store();refreshCounts();renderCart();
    notify('Добавлено в корзину');progressTick('cart',id);
  }
  function changeQty(id,delta){
    if(!get(id))return;
    state.cart[id]=Math.max(0,(state.cart[id]||0)+delta);
    if(state.cart[id]===0)delete state.cart[id];
    store();refreshCounts();renderCart();
  }
  function checkout(){
    if(totalCount()===0){notify('Корзина пуста');return;}
    progressTick('checkout');
    state.cart={};store();refreshCounts();renderCart();
    closeDialog($('#cartDialog'));modal('#orderDialog');
  }
  function handleAction(event){
    const target=event.target.closest('button');if(!target)return;
    if(target.dataset.detail){openDetails(target.dataset.detail);return;}
    if(target.dataset.favorite){toggleFavorite(target.dataset.favorite);return;}
    if(target.dataset.cart){addCart(target.dataset.cart);return;}
    if(target.dataset.qty){changeQty(target.dataset.qty,Number(target.dataset.delta));return;}
    if(target.dataset.remove){changeQty(target.dataset.remove,-999);return;}
    if(target.dataset.action==='favorites'){renderFavorites();modal('#favoritesDialog');logAction();return;}
    if(target.dataset.action==='cart'){renderCart();modal('#cartDialog');logAction();return;}
    if(target.dataset.action==='checkout'){checkout();return;}
    if(target.dataset.action==='close'){closeDialog(target.closest('dialog'));return;}
  }
  document.addEventListener('click',handleAction);
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog);}));
  const search=$('#searchInput'); search.value=state.query||''; search.addEventListener('input',()=>{state.query=search.value;store();renderCatalog();});
  const sort=$('#sortSelect');sort.value=state.sort||'default';sort.addEventListener('change',()=>{state.sort=sort.value;store();renderCatalog();logAction();});
  $$('[data-filter]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter));
    button.addEventListener('click',()=>{
      state.filter=button.dataset.filter;store();
      $$('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      renderCatalog();logAction();
    });
  });
  renderCatalog();refreshCounts();renderCart();renderFavorites();beginStudy();
  function parseJSON(text,fallback){try{return JSON.parse(text)||fallback;}catch{return fallback;}}
})();
