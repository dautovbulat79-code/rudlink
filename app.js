/* RUDLink — поведение страницы. Чистый JS, без библиотек. */
(function () {
  'use strict';

  var C = window.RUDLINK_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. Подставляем настройки из config.js ---------- */
  var tgUrl = 'https://t.me/' + (C.telegram || 'Piepiebear');
  var buyUrl = C.bot ? 'https://t.me/' + C.bot + '?start=buy' : tgUrl; // бот сразу открывает кабинет с оплатой

  $$('[data-buy]').forEach(function (a) { a.href = buyUrl; });
  $$('[data-tg]').forEach(function (a) { a.href = tgUrl; });
  $$('[data-tg-text]').forEach(function (el) { el.textContent = '@' + C.telegram; });
  if (C.price) $$('[data-price]').forEach(function (el) { el.textContent = C.price; });
  if (C.email) {
    $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + C.email; });
    $$('[data-mail-text]').forEach(function (el) { el.textContent = C.email; });
  }
  if (C.phoneRaw) $$('[data-phone]').forEach(function (a) { a.href = 'tel:' + C.phoneRaw; });
  if (C.phone) $$('[data-phone-text]').forEach(function (el) { el.textContent = C.phone; });
  if (C.apps) {
    $$('[data-app]').forEach(function (a) {
      var u = C.apps[a.getAttribute('data-app')];
      if (u) a.href = u;
    });
  }

  /* ---------- 2. Шапка: тень при прокрутке + бургер ---------- */
  var header = $('.header');
  var dock = $('#dock');
  var finalCard = $('.final__card');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burger');
  var nav = $('#nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  /* ---------- 3. Появление блоков + активный пункт меню + нижняя панель ---------- */
  if ('IntersectionObserver' in window) {
    // небольшая «лесенка» задержек для соседних карточек
    $$('.bento, .pricing, .steps, .faq__list, .contacts').forEach(function (group) {
      $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i % 6) * 0.07 + 's'); });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { io.observe(el); });

    var links = {};
    $$('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          $$('.nav a.is-current').forEach(function (x) { x.classList.remove('is-current'); });
          a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

    // нижняя панель (на телефоне): видна всегда, кроме момента,
    // когда на экране финальный призыв со своими кнопками
    var finalSeen = false;
    function syncDock() { dock.classList.toggle('is-shown', !finalSeen); }
    syncDock();
    new IntersectionObserver(function (e) { finalSeen = e[0].isIntersecting; syncDock(); }, { threshold: 0.3 }).observe(finalCard);
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    dock.classList.add('is-shown');
  }

  /* ---------- 4. Вкладки Android / iPhone ---------- */
  var tabs = $$('.tab');
  var glider = $('.tabs__glider');
  function moveGlider(t) {
    if (!glider || !t) return;
    glider.style.width = t.offsetWidth + 'px';
    glider.style.transform = 'translateX(' + (t.offsetLeft - 6) + 'px)';
  }
  function selectTab(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls'));
      p.hidden = !on;
      p.classList.toggle('is-active', on);
      if (on) $$('.reveal', p).forEach(function (el) { el.classList.add('in'); });
    });
    moveGlider(t);
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });
  // Если зашли с iPhone, сразу показываем инструкцию для iPhone
  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  selectTab(isIOS ? tabs[1] : tabs[0]);
  window.addEventListener('resize', function () { moveGlider($('.tab.is-active')); });
  window.addEventListener('load', function () { moveGlider($('.tab.is-active')); });

  /* ---------- 5. FAQ: открыт только один ответ ---------- */
  var qas = $$('.qa');
  qas.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) qas.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- 6. Окна: тест и покупка ---------- */
  var openModal = null;
  var lastFocus = null;

  function showModal(m) {
    lastFocus = document.activeElement;
    m.hidden = false;
    openModal = m;
    document.body.classList.add('no-scroll');
    closeMenu();
    setTimeout(function () { $('.modal__close', m).focus(); }, 30);
  }
  function hideModal() {
    if (!openModal) return;
    openModal.hidden = true;
    openModal = null;
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('.modal [data-close]').forEach(function (b) { b.addEventListener('click', hideModal); });
  document.addEventListener('keydown', function (e) {
    if (!openModal) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'Tab') { // держим фокус внутри окна
      var f = $$('button, a[href], input, iframe', openModal).filter(function (x) { return x.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Тест: форма Яндекса, загружаем только при открытии
  var trial = $('#trial');
  var frame = $('#trial-frame');
  var loader = $('.modal__loader');
  frame.addEventListener('load', function () {
    if (frame.getAttribute('src')) loader.style.display = 'none';
  });
  function openTrial(e) {
    if (e) e.preventDefault();
    if (!frame.getAttribute('src') && C.trialForm) frame.src = C.trialForm;
    showModal(trial);
  }
  $$('[data-trial]').forEach(function (b) { b.addEventListener('click', openTrial); });
  // ссылка вида rudlink.com/#trial сразу открывает форму
  if (location.hash === '#trial' || location.hash === '#test') openTrial();

  // Покупка: если есть ссылка Coinso, «Купить» открывает окно (СБП на сайте или Telegram)
  var buy = $('#buy');
  if (C.payUrl && buy) {
    $$('[data-buy-tg]').forEach(function (a) { a.href = buyUrl; });
    $$('[data-buy]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showModal(buy); });
    });
    if (location.hash === '#buy') showModal(buy);

    var device = isIOS ? 'iPhone' : 'Android';
    var chips = $$('.buy__chips button');
    function pick(name) {
      device = name;
      chips.forEach(function (c) { c.setAttribute('aria-checked', String(c.getAttribute('data-dev') === name)); });
    }
    pick(device);
    chips.forEach(function (c) { c.addEventListener('click', function () { pick(c.getAttribute('data-dev')); }); });

    var email = $('#buy-email');
    var err = $('#buy-err');
    email.addEventListener('input', function () { err.hidden = true; });
    $('#buy-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { err.hidden = false; email.focus(); return; }
      // order вернётся в уведомлении Coinso: по нему бот сообщит, кому отправить ключ
      var q = [
        'amount=' + (C.price || 259),
        'order=' + encodeURIComponent('site:' + v + '|' + device),
        'email=' + encodeURIComponent(v),
        'desc=' + encodeURIComponent('RUDLink VPN — 30 дней'),
        'lang=ru'
      ].join('&');
      location.href = C.payUrl + '?' + q;
    });
  }
})();
