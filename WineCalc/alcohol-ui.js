// alcohol-ui.js — связывает страницу с расчётом. Порядок: common.js -> alcohol-core.js -> site.js -> alcohol-ui.js
(function () {
  'use strict';

  const common = window.WineCalc.common;
  const alc = window.WineCalc.alcohol;
  const t = window.WineCalc.i18n.t;
  const DECIMALS = 1;   // сколько знаков показывать в результате

  const box = document.getElementById('result-box');
  const out = document.getElementById('result-text');
  let hasResult = false;

  function show(kind, text) {
    box.className = 'result-' + kind;       // result-ok / result-warn / result-error
    out.removeAttribute('data-i18n');       // дальше текст задаёт расчёт, а не словарь
    out.textContent = text;
    hasResult = true;
  }

  function signed(x) {
    const s = common.roundTo(x, DECIMALS).toFixed(DECIMALS);
    return (x > 0 && Number(s) !== 0 ? '+' : '') + s.replace('-', '\u2212');
  }

  function calculateAlcohol() {
    const temp = common.parseDecimal(document.getElementById('temp').value);
    const reading = common.parseDecimal(document.getElementById('apparent').value);

    const res = alc.correctReading(reading, temp);
    if (!res.ok) {
      show('error', t(res.code, alc.LIMITS));
      return;
    }

    const text = t('result') + ': ' + res.trueAbv.toFixed(DECIMALS) + ' ' + t('unit') +
      '\n' + t('correction') + ': ' + signed(res.correction);

    if (res.warnings.indexOf('FAR_FROM_20') !== -1) {
      show('warn', text + '\n' + t('FAR_FROM_20'));
    } else {
      show('ok', text);
    }
  }

  ['temp', 'apparent'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculateAlcohol();
    });
  });

  // при смене языка пересчитываем, чтобы результат и ошибки тоже переключились
  document.addEventListener('langchange', function () { if (hasResult) calculateAlcohol(); });

  window.calculateAlcohol = calculateAlcohol;
})();
