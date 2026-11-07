/*
  RUDLink: все настройки сайта в одном месте.
  Меняете здесь, и это подхватывают все кнопки и тексты на сайте.
*/
window.RUDLINK_CONFIG = {
  // Цена подписки за 30 дней, в рублях
  price: 259,

  // Telegram для покупки и поддержки (без @)
  telegram: 'Piepiebear',

  // Имя бота (без @). Если заполнить, все кнопки «Купить» поведут в бота,
  // например bot: 'RUDLinkBot'. Пока пусто, ведут в telegram выше.
  bot: '',

  // Почта поддержки
  email: 'ningigame@gmail.com',

  // Телефон: как показывать и как набирать
  phone: '+7 937 774-15-22',
  phoneRaw: '+79377741522',

  // Яндекс Форма для бесплатного теста (открывается в окне на сайте)
  trialForm: 'https://forms.yandex.ru/u/6aeb8e0b2c4f8918fdedb539/?iframe=1',

  // Приложения
  apps: {
    android: 'https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk',
    ios: 'https://apps.apple.com/ru/app/duck-connect/id6790362049'
  }
};
