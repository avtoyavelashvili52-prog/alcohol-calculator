// adjust-ui.js — страница «Довести до нужной крепости».
// Порядок: common.js -> alcohol-core.js -> blend-core.js -> adjust-core.js -> site.js -> adjust-ui.js
(function () {
  'use strict';

  const common = window.WineCalc.common;
  const adjust = window.WineCalc.adjust;
  const root = document.documentElement;

  // Грузинские строки написаны мной — их нужно проверить.
  const B = {
    ka: {
      pageTitle: 'სიმაგრის მორგება', title: 'სიმაგრის მორგება',
      modeLabel: 'რა გვინდა გამოვთვალოთ?',
      modeAdd: 'მაქვს სპირტი A — რამდენი დავამატო B?', modeMake: 'მჭირდება საბოლოო რაოდენობა — რამდენი ავიღო A და B?',
      amount_add: 'სპირტი A-ს რაოდენობა', amount_make: 'საბოლოოდ საჭირო რაოდენობა',
      strengthA: 'A სიმაგრე (% მოც.)', strengthB: 'B სიმაგრე (წყალი = 0)', target: 'საჭირო სიმაგრე (% მოც.)',
      uL: 'ლიტრი (ლ)', uMl: 'მილილიტრი (მლ)', uKg: 'კილოგრამი (კგ)', uT: 'ტონა (ტ)',
      calc: 'გამოთვლა', waiting: 'მონაცემების მოლოდინი...',
      note: 'სიმაგრე და მოცულობა 20°C-ზე. მასა ტემპერატურაზე არ არის დამოკიდებული, ამიტომ დიდი რაოდენობისთვის (ტონები) ყველაზე საიმედოა. გამოთვლა OIML R 22-ის მიხედვით.',
      back: '← ტემპერატურული კორექცია',
      resAdd: 'დასამატებელი B', resTakeA: 'აიღეთ A', resTakeB: 'აიღეთ B', resTotal: 'ჯამი', resContr: 'მოცულობის შემცირება',
      vMl: 'მლ', vL: 'ლ', vM3: 'მ³', mG: 'გ', mKg: 'კგ', mT: 'ტ',
      NOT_NUMBER: 'შეცდომა: გთხოვთ შეიყვანოთ რიცხვები', RANGE_ABV: 'შეცდომა: სიმაგრე უნდა იყოს 0-დან 100-მდე',
      RANGE_AMOUNT: 'შეცდომა: რაოდენობა უნდა იყოს ნულზე მეტი', BAD_UNIT: 'შეცდომა: ერთეული',
      UNREACHABLE: 'შეცდომა: საჭირო სიმაგრე უნდა იყოს A და B სიმაგრეებს შორის (მკაცრად)',
      SAME_STRENGTH: 'A და B-ს სიმაგრე ერთნაირია, გამოსათვლელი არაფერია'
    },
    ru: {
      pageTitle: 'Доведение до нужной крепости', title: 'Нужная крепость',
      modeLabel: 'Что рассчитать?',
      modeAdd: 'Есть спирт A — сколько добавить B?', modeMake: 'Нужно получить итог — сколько взять A и B?',
      amount_add: 'Количество спирта A', amount_make: 'Сколько нужно получить (итого)',
      strengthA: 'Крепость A (% об.)', strengthB: 'Крепость B (вода = 0)', target: 'Нужная крепость (% об.)',
      uL: 'литры (л)', uMl: 'миллилитры (мл)', uKg: 'килограммы (кг)', uT: 'тонны (т)',
      calc: 'Рассчитать', waiting: 'Ожидание данных...',
      note: 'Крепость и объём при 20 °C. Масса не зависит от температуры, поэтому для больших количеств (тонны) она надёжнее всего. Расчёт по OIML R 22.',
      back: '← Температурная коррекция',
      resAdd: 'Добавить B', resTakeA: 'Взять A', resTakeB: 'Взять B', resTotal: 'Итого', resContr: 'Уменьшение объёма',
      vMl: 'мл', vL: 'л', vM3: 'м³', mG: 'г', mKg: 'кг', mT: 'т',
      NOT_NUMBER: 'Ошибка: введите числа', RANGE_ABV: 'Ошибка: крепость должна быть от 0 до 100',
      RANGE_AMOUNT: 'Ошибка: количество должно быть больше нуля', BAD_UNIT: 'Ошибка: единица измерения',
      UNREACHABLE: 'Ошибка: нужная крепость должна лежать строго между крепостями A и B',
      SAME_STRENGTH: 'Крепость A и B одинакова, считать нечего'
    },
    en: {
      pageTitle: 'Adjust to target strength', title: 'Target strength',
      modeLabel: 'What to calculate?',
      modeAdd: 'I have spirit A — how much B to add?', modeMake: 'I need a final amount — how much A and B to take?',
      amount_add: 'Amount of spirit A', amount_make: 'Final amount needed (total)',
      strengthA: 'Strength of A (% vol)', strengthB: 'Strength of B (water = 0)', target: 'Target strength (% vol)',
      uL: 'litres (L)', uMl: 'millilitres (mL)', uKg: 'kilograms (kg)', uT: 'tonnes (t)',
      calc: 'Calculate', waiting: 'Waiting for data...',
      note: 'Strength and volume at 20 °C. Mass does not depend on temperature, so for large amounts (tonnes) it is the most reliable. Calculated according to OIML R 22.',
      back: '← Temperature correction',
      resAdd: 'Add B', resTakeA: 'Take A', resTakeB: 'Take B', resTotal: 'Total', resContr: 'Volume contraction',
      vMl: 'mL', vL: 'L', vM3: 'm³', mG: 'g', mKg: 'kg', mT: 't',
      NOT_NUMBER: 'Error: please enter numbers', RANGE_ABV: 'Error: strength must be between 0 and 100',
      RANGE_AMOUNT: 'Error: amount must be greater than zero', BAD_UNIT: 'Error: unit',
      UNREACHABLE: 'Error: the target strength must lie strictly between the strengths of A and B',
      SAME_STRENGTH: 'A and B have the same strength, nothing to calculate'
    }
  };

  const $ = function (id) { return document.getElementById(id); };
  const box = $('result-box'), out = $('result-text');
  let hasResult = false;

  function t(key) { const d = B[root.lang] || B.en; return d[key] || B.en[key] || key; }

  function applyTexts() {
    document.title = t('pageTitle');
    document.querySelectorAll('[data-b]').forEach(function (el) {
      if (el.id === 'result-text' && hasResult) return;
      const key = el.dataset.b === 'amount' ? 'amount_' + $('mode').value : el.dataset.b;
      el.textContent = t(key);
    });
  }

  // количества: объём (мл -> л -> м³) и масса (г -> кг -> т)
  function vol(ml) {
    if (ml < 1000) return ml.toFixed(1) + ' ' + t('vMl');
    if (ml < 1e6) return (ml / 1000).toFixed(2) + ' ' + t('vL');
    return (ml / 1e6).toFixed(3) + ' ' + t('vM3');
  }
  function mass(g) {
    if (g < 1000) return g.toFixed(1) + ' ' + t('mG');
    if (g < 1e6) return (g / 1000).toFixed(2) + ' ' + t('mKg');
    return (g / 1e6).toFixed(3) + ' ' + t('mT');
  }
  const both = function (p) { return vol(p.ml) + ' / ' + mass(p.grams); };

  function show(kind, text) { box.className = 'result-' + kind; out.textContent = text; hasResult = true; }

  const num = function (id) { return common.parseDecimal($(id).value); };

  function calculateAdjust() {
    const mode = $('mode').value;
    const r = adjust.adjust(mode, {
      amount: num('amount'), unit: $('unit').value,
      strengthA: num('qa'), strengthB: num('qb'), target: num('qt')
    });
    if (!r.ok) { show('error', t(r.code)); return; }

    const lines = mode === 'add'
      ? [t('resAdd') + ': ' + both(r.b)]
      : [t('resTakeA') + ': ' + both(r.a), t('resTakeB') + ': ' + both(r.b)];
    lines.push(t('resTotal') + ': ' + both(r.total) + ' (' + num('qt') + ' %)');
    lines.push(t('resContr') + ': ' + vol(r.contraction));
    show('ok', lines.join('\n'));
  }

  ['amount', 'qa', 'qb', 'qt'].forEach(function (id) {
    $(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') calculateAdjust(); });
  });
  $('mode').addEventListener('change', function () { applyTexts(); if (hasResult) calculateAdjust(); });
  document.addEventListener('langchange', function () { applyTexts(); if (hasResult) calculateAdjust(); });

  applyTexts();
  window.calculateAdjust = calculateAdjust;
})();