// common.js — общие функции для всех калькуляторов сайта.
// Подключать ПЕРВЫМ, до остальных скриптов.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();           // Node (для тестов)
  } else {
    root.WineCalc = root.WineCalc || {};  // браузер
    root.WineCalc.common = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Разбирает число из строки. Принимает запятую и точку как десятичный разделитель.
   * Возвращает NaN, если строка пустая или это не целиком число
   * (parseFloat("12,5") даёт 12, а parseFloat("12abc") даёт 12 — здесь так не бывает).
   */
  function parseDecimal(input) {
    if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
    if (typeof input !== 'string') return NaN;

    const s = input
      .trim()
      .replace(/\s+/g, '')
      .replace(/\u2212/g, '-')   // типографский минус
      .replace(',', '.');

    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return Number(s);
  }

  /** Округление до заданного числа знаков (для вывода). */
  function roundTo(value, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * f) / f;
  }

  return { parseDecimal: parseDecimal, roundTo: roundTo };
});
