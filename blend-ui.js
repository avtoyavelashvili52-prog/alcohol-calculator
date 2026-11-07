// blend-ui.js — страница купажирования. Порядок: common.js -> alcohol-core.js -> blend-core.js -> site.js -> blend-ui.js
// Язык берётся из site.js (он ставит нужный язык в <html lang>), поэтому переключатель работает и здесь.
(function () {
  'use strict';

  const common = window.WineCalc.common;
  const blend = window.WineCalc.blend;
  const root = document.documentElement;
  const DECIMALS = 1;

  // Грузинские строки написаны мной — их нужно проверить.
  const B = {
    ka: {
      pageTitle: 'კუპაჟი', title: 'კუპაჟი',
      partA: 'სპირტი A', partB: 'სპირტი B (წყლისთვის: სიმაგრე 0)',
      volume: 'მოცულობა (მლ)', strength: 'სიმაგრე (% მოც.)',
      calc: 'გამოთვლა', waiting: 'მონაცემების მოლოდინი...',
      note: 'მოცულობა და სიმაგრე 20°C-ზე. სპირტის წყალთან შერევისას მოცულობა მცირდება, ამიტომ საბოლოო მოცულობა ჯამზე ნაკლებია. გამოთვლა OIML R 22-ის მიხედვით.',
      back: '← ტემპერატურული კორექცია',
      resAbv: 'საბოლოო სიმაგრე', resVol: 'საბოლოო მოცულობა', resContr: 'მოცულობის შემცირება', resAlc: 'სუფთა სპირტი',
      mlUnit: 'მლ', abvUnit: '% მოც. (20°C-ზე)',
      NOT_NUMBER: 'შეცდომა: გთხოვთ შეიყვანოთ რიცხვები',
      RANGE_VOLUME: 'შეცდომა: მოცულობა არ შეიძლება იყოს უარყოფითი',
      RANGE_ABV: 'შეცდომა: სიმაგრე უნდა იყოს 0-დან 100-მდე',
      ZERO_TOTAL: 'შეცდომა: მოცულობა უნდა იყოს ნულზე მეტი'
    },
    ru: {
      pageTitle: 'Купажирование', title: 'Купажирование',
      partA: 'Спирт A', partB: 'Спирт B (для воды: крепость 0)',
      volume: 'Объём (мл)', strength: 'Крепость (% об.)',
      calc: 'Рассчитать', waiting: 'Ожидание данных...',
      note: 'Объём и крепость при 20 °C. При смешивании спирта с водой объём уменьшается, поэтому итоговый объём меньше суммы. Расчёт по OIML R 22.',
      back: '← Температурная коррекция',
      resAbv: 'Итоговая крепость', resVol: 'Итоговый объём', resContr: 'Уменьшение объёма', resAlc: 'Чистый спирт',
      mlUnit: 'мл', abvUnit: '% об. (при 20 °C)',
      NOT_NUMBER: 'Ошибка: введите числа',
      RANGE_VOLUME: 'Ошибка: объём не может быть отрицательным',
      RANGE_ABV: 'Ошибка: крепость должна быть от 0 до 100',
      ZERO_TOTAL: 'Ошибка: объём должен быть больше нуля'
    },
    en: {
      pageTitle: 'Blending', title: 'Blending',
      partA: 'Spirit A', partB: 'Spirit B (for water: strength 0)',
      volume: 'Volume (mL)', strength: 'Strength (% vol)',
      calc: 'Calculate', waiting: 'Waiting for data...',
      note: 'Volume and strength at 20 °C. Mixing spirit with water reduces the volume, so the final volume is less than the sum. Calculated according to OIML R 22.',
      back: '← Temperature correction',
      resAbv: 'Final strength', resVol: 'Final volume', resContr: 'Volume contraction', resAlc: 'Pure alcohol',
      mlUnit: 'mL', abvUnit: '% vol (at 20 °C)',
      NOT_NUMBER: 'Error: please enter numbers',
      RANGE_VOLUME: 'Error: volume cannot be negative',
      RANGE_ABV: 'Error: strength must be between 0 and 100',
      ZERO_TOTAL: 'Error: volume must be greater than zero'
    }
  };

  const box = document.getElementById('result-box');
  const out = document.getElementById('result-text');
  let hasResult = false;

  function t(key) { const d = B[root.lang] || B.en; return d[key] || B.en[key] || key; }

  function applyTexts() {
    document.title = t('pageTitle');
    document.querySelectorAll('[data-b]').forEach(function (el) {
      if (el.id === 'result-text' && hasResult) return;   // готовый результат не затираем
      el.textContent = t(el.dataset.b);
    });
  }

  function show(kind, text) {
    box.className = 'result-' + kind;
    out.textContent = text;
    hasResult = true;
  }

  const num = function (id) { return common.parseDecimal(document.getElementById(id).value); };
  const fmt = function (x) { return x.toFixed(DECIMALS); };

  function calculateBlend() {
    const res = blend.blend([
      { volume: num('v1'), abv: num('q1') },
      { volume: num('v2'), abv: num('q2') }
    ]);
    if (!res.ok) { show('error', t(res.code)); return; }

    show('ok',
      t('resAbv') + ': ' + fmt(res.abv) + ' ' + t('abvUnit') + '\n' +
      t('resVol') + ': ' + fmt(res.volume) + ' ' + t('mlUnit') + '\n' +
      t('resContr') + ': ' + fmt(res.contraction) + ' ' + t('mlUnit') + ' (' + fmt(res.contractionPercent) + ' %)\n' +
      t('resAlc') + ': ' + fmt(res.alcoholMl) + ' ' + t('mlUnit'));
  }

  ['v1', 'q1', 'v2', 'q2'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') calculateBlend(); });
  });

  document.addEventListener('langchange', function () { applyTexts(); if (hasResult) calculateBlend(); });

  applyTexts();
  window.calculateBlend = calculateBlend;
})();
