(function () {
  var cfg = window.RUDLINK || {};

  // Кнопки «Купить»: ссылка Coinso, если задана, иначе Telegram
  if (cfg.payUrl) {
    document.querySelectorAll('[data-pay]').forEach(function (a) { a.href = cfg.payUrl; });
  }

  document.getElementById('y').textContent = new Date().getFullYear();

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
