// site.js — тема (светлая/тёмная) и язык (KA/RU/EN). Подключается после alcohol-core.js, до alcohol-ui.js.
// Все тексты сайта живут здесь. Чтобы поменять формулировку — правьте строку в нужном языке.
(function () {
  'use strict';

  const DEFAULT_LANG = 'ka';   // язык по умолчанию, если у посетителя нет сохранённого выбора и язык браузера не KA/RU/EN

  const T = {
    ka: {
      pageTitle: 'OIML ლაბორატორიული კალკულატორი',
      title: 'სიმკვრივის კორექცია',
      tempLabel: 'დისტილატის ტემპერატურა (°C):',
      readingLabel: 'არეომეტრის ჩვენება (% მოც.):',
      calc: 'გამოთვლა',
      waiting: 'მონაცემების მოლოდინი...',
      note: 'გამოთვლა OIML R 22-ის მიხედვით. სიზუსტე დამოკიდებულია ხელსაწყოსა და გაზომვის პირობებზე.',
      result: 'რეალური სიმაგრე',
      unit: '% მოც. (20°C-ზე)',
      correction: 'შესწორება',
      NOT_NUMBER: 'შეცდომა: გთხოვთ შეიყვანოთ რიცხვები',
      RANGE_TEMP: 'შეცდომა: ტემპერატურა უნდა იყოს {tMin}°C-დან {tMax}°C-მდე',
      RANGE_ABV: 'შეცდომა: სიმაგრე უნდა იყოს {abvMin}-დან {abvMax}-მდე',
      BELOW_WATER: 'შეცდომა: ჩვენება წყლის ჩვენებაზე დაბალია ამ ტემპერატურაზე. გადაამოწმეთ ჩვენება და ტემპერატურა',
      ABOVE_ETHANOL: 'შეცდომა: ამ ტემპერატურაზე ასეთი ჩვენება შეუძლებელია (სიმაგრე 100%-ს აღემატება). გადაამოწმეთ ჩვენება და ტემპერატურა',
      FAR_FROM_20: 'ყურადღება: ტემპერატურა 20°C-დან 10°C-ზე მეტით განსხვავდება, სიზუსტე მცირდება. უმჯობესია ნიმუში 20°C-თან მიიყვანოთ'
    },
    ru: {
      pageTitle: 'Лабораторный калькулятор OIML',
      title: 'Коррекция показаний',
      tempLabel: 'Температура дистиллята (°C):',
      readingLabel: 'Показание ареометра (% об.):',
      calc: 'Рассчитать',
      waiting: 'Ожидание данных...',
      note: 'Расчёт по OIML R 22. Точность зависит от прибора и условий измерения.',
      result: 'Реальная крепость',
      unit: '% об. (при 20 °C)',
      correction: 'Поправка',
      NOT_NUMBER: 'Ошибка: введите числа',
      RANGE_TEMP: 'Ошибка: температура должна быть от {tMin} до {tMax} °C',
      RANGE_ABV: 'Ошибка: показание должно быть от {abvMin} до {abvMax} %',
      BELOW_WATER: 'Ошибка: показание ниже, чем у чистой воды при этой температуре. Проверьте показание и температуру',
      ABOVE_ETHANOL: 'Ошибка: при этой температуре такое показание невозможно (крепость выше 100 %). Проверьте показание и температуру',
      FAR_FROM_20: 'Внимание: температура отличается от 20 °C больше чем на 10 °C, точность ниже. Лучше довести пробу до 20 °C'
    },
    en: {
      pageTitle: 'OIML Laboratory Calculator',
      title: 'Reading correction',
      tempLabel: 'Distillate temperature (°C):',
      readingLabel: 'Hydrometer reading (% vol):',
      calc: 'Calculate',
      waiting: 'Waiting for data...',
      note: 'Calculated according to OIML R 22. Accuracy depends on the instrument and measurement conditions.',
      result: 'True strength',
      unit: '% vol (at 20 °C)',
      correction: 'Correction',
      NOT_NUMBER: 'Error: please enter numbers',
      RANGE_TEMP: 'Error: temperature must be between {tMin} and {tMax} °C',
      RANGE_ABV: 'Error: reading must be between {abvMin} and {abvMax} %',
      BELOW_WATER: 'Error: the reading is lower than pure water would show at this temperature. Check the reading and temperature',
      ABOVE_ETHANOL: 'Error: this reading is impossible at this temperature (strength above 100 %). Check the reading and temperature',
      FAR_FROM_20: 'Note: the temperature differs from 20 °C by more than 10 °C, so accuracy is lower. Better bring the sample close to 20 °C'
    }
  };

  const root = document.documentElement;
  const langSelect = document.getElementById('lang');
  const themeBtn = document.getElementById('theme');
  const dark = window.matchMedia('(prefers-color-scheme: dark)');

  // ---------- Язык ----------
  function saved(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  let lang = saved('lang');
  if (!T[lang]) {
    const browser = (navigator.language || '').slice(0, 2);
    lang = T[browser] ? browser : DEFAULT_LANG;
  }

  function t(key, vars) {
    let s = (T[lang] && T[lang][key]) || T.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  function applyLang() {
    root.lang = lang;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    langSelect.value = lang;
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  langSelect.addEventListener('change', function () {
    lang = langSelect.value;
    save('lang', lang);
    applyLang();
  });

  // ---------- Тема ----------
  function currentTheme() { return root.dataset.theme || (dark.matches ? 'dark' : 'light'); }
  function paintThemeButton() {
    const isDark = currentTheme() === 'dark';
    themeBtn.textContent = isDark ? '\u2600' : '\u263E';   // ☀ / ☾
    themeBtn.setAttribute('aria-label', isDark ? 'Light theme' : 'Dark theme');
  }
  themeBtn.addEventListener('click', function () {
    root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    save('theme', root.dataset.theme);
    paintThemeButton();
  });
  dark.addEventListener('change', paintThemeButton);

  window.WineCalc = window.WineCalc || {};
  window.WineCalc.i18n = { t: t };

  paintThemeButton();
  applyLang();
})();
