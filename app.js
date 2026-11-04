(function () {
  var cfg = window.RUDLINK || {};

  // Кнопки «Купить»: ссылка Coinso, если задана, иначе Telegram
  if (cfg.payUrl) {
    document.querySelectorAll('[data-pay]').forEach(function (a) { a.href = cfg.payUrl; });
  }

  document.getElementById('y').textContent = new Date().getFullYear();

  // Окно «Бесплатный тест»: выбор устройства и готовое сообщение для Telegram
  var trial = document.getElementById('trial');
  if (trial && trial.showModal) {
    var msgEl = document.getElementById('trial-msg');
    var copyBtn = document.getElementById('trial-copy');
    var go = document.getElementById('trial-go');
    var chips = trial.querySelectorAll('[data-dev]');
    var email = cfg.email || 'ningigame@gmail.com';

    var setDev = function (dev) {
      chips.forEach(function (c) { c.setAttribute('aria-checked', c.dataset.dev === dev); });
      msgEl.textContent = 'Здравствуйте! Хочу бесплатный тест RUDLink на 24 часа. Устройство: ' + dev + '.';
      go.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Бесплатный тест RUDLink') +
        '&body=' + encodeURIComponent(msgEl.textContent);
    };
    var copy = function () {
      var text = msgEl.textContent;
      var done = function () {
        copyBtn.textContent = 'Скопировано ✓';
        setTimeout(function () { copyBtn.textContent = 'Скопировать'; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    };

    chips.forEach(function (c) { c.addEventListener('click', function () { setDev(c.dataset.dev); }); });
    copyBtn.addEventListener('click', copy);
    go.addEventListener('click', copy);
    setDev(/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iPhone' : 'Android');

    document.querySelectorAll('[data-trial]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); trial.showModal(); });
    });
    // Клик по затемнению вокруг окна закрывает его
    trial.addEventListener('click', function (e) { if (e.target === trial) trial.close(); });
  }

  // Мобильное меню
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      document.body.classList.remove('menu');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Вкладки Android / iPhone
  var tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t); });
      document.querySelectorAll('[data-for]').forEach(function (el) {
        el.hidden = el.getAttribute('data-for') !== t.dataset.tab;
      });
    });
  });
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) tabs[1].click();

  // Появление блоков при прокрутке
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Шапка и нижняя панель «Купить» на телефоне
  var hero = document.querySelector('.hero');
  var price = document.getElementById('price');
  function onScroll() {
    var y = window.scrollY;
    document.body.classList.toggle('scrolled', y > 8);
    var pastHero = y > hero.offsetHeight - 80;
    var r = price.getBoundingClientRect();
    var priceVisible = r.top < window.innerHeight && r.bottom > 0;
    document.body.classList.toggle('show-bar', pastHero && !priceVisible);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
