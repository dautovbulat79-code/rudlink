(function () {
  var cfg = window.RUDLINK || {};

  document.getElementById('y').textContent = new Date().getFullYear();

  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  // Выбор устройства «чипами» внутри окна; возвращает функцию, которая отдаёт выбранное
  var chipGroup = function (box, onChange) {
    var chips = box.querySelectorAll('[data-dev]');
    var current;
    var set = function (dev) {
      current = dev;
      chips.forEach(function (c) { c.setAttribute('aria-checked', c.dataset.dev === dev); });
      if (onChange) onChange(dev);
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { set(c.dataset.dev); }); });
    set(isIOS ? 'iPhone' : 'Android');
    return function () { return current; };
  };

  // Клик по затемнению вокруг окна закрывает его
  var closeOnBackdrop = function (dlg) {
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  };

  // Без ссылки Coinso кнопки «Купить» ведут в бота (сразу в кабинет с оплатой) или в Telegram
  var tgLink = function (a, url) {
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  };
  if (!cfg.payUrl && (cfg.bot || cfg.telegram)) {
    document.querySelectorAll('[data-pay]').forEach(function (a) {
      tgLink(a, cfg.bot ? 'https://t.me/' + cfg.bot + '?start=buy' : 'https://t.me/' + cfg.telegram);
    });
  }

  // Окно «Купить»: устройство и почта → платёжная ссылка Coinso.
  // Почта и устройство уходят в параметр order — их видно в кабинете Coinso у платежа.
  var buy = document.getElementById('buy');
  if (buy && buy.showModal && cfg.payUrl) {
    var form = document.getElementById('buy-form');
    var emailIn = document.getElementById('buy-email');
    var err = document.getElementById('buy-err');
    var buyDev = chipGroup(buy);

    document.querySelectorAll('[data-pay]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        document.body.classList.remove('menu');
        buy.showModal();
        emailIn.focus();
      });
    });
    buy.querySelector('.x').addEventListener('click', function () { buy.close(); });
    closeOnBackdrop(buy);
    emailIn.addEventListener('input', function () { err.hidden = true; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailIn.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.hidden = false;
        emailIn.focus();
        return;
      }
      var q = [
        'amount=' + (cfg.price || 300),
        'order=' + encodeURIComponent(email + ' | ' + buyDev()),
        'email=' + encodeURIComponent(email),
        'desc=' + encodeURIComponent('RUDLink VPN, 30 дней'),
        'lang=ru',
      ];
      location.href = cfg.payUrl + '?' + q.join('&');
    });
  }

  // Окно «Бесплатный тест»: Яндекс Форма (почта + устройство), заявка приходит на почту.
  // Форма грузится при первом открытии окна, чтобы не замедлять страницу.
  var trial = document.getElementById('trial');
  if (trial && trial.showModal) {
    var frame = document.getElementById('trial-form');
    var mail = document.getElementById('trial-mail');
    if (cfg.email) {
      mail.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Бесплатный тест RUDLink');
      mail.textContent = cfg.email;
    }

    document.querySelectorAll('[data-trial]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        document.body.classList.remove('menu');
        if (!frame.src && cfg.trialForm) frame.src = cfg.trialForm + (cfg.trialForm.indexOf('?') < 0 ? '?' : '&') + 'iframe=1';
        trial.showModal();
      });
    });
    closeOnBackdrop(trial);
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
  if (isIOS) tabs[1].click();

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
