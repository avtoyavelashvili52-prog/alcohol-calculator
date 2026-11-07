// alcohol-core.js — температурная коррекция показаний спиртометра по OIML R 22.
// Чистая математика: никакого HTML. Подключать после common.js (common здесь не нужен,
// но порядок единый для всех калькуляторов).
//
// Метод (OIML R 22, приложение I, таблицы IVa → VI → VII):
//   1. Показание шкалы (% об.) -> массовая доля p при 20 °C -> плотность ρ'20.
//   2. Истинная плотность при температуре t:  ρt = ρ'20 · [1 − α·(t − 20)]
//      (α — коэффициент объёмного расширения стекла прибора).
//   3. По ρt и t находим массовую долю p (формула плотности OIML).
//   4. Объёмная крепость при 20 °C:  q = ρ20(p) / 789.24 · p
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WineCalc = root.WineCalc || {};
    root.WineCalc.alcohol = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- Константы ----------
  const RHO_ETHANOL_20 = 789.24;        // кг/м³, чистый спирт при 20 °C (OIML R 22)
  const GLASS_SODA_LIME = 25e-6;        // 1/°C, обычное стекло (по умолчанию)
  const GLASS_BOROSILICATE = 10e-6;     // 1/°C, боросиликатное стекло
  const LIMITS = { tMin: -20, tMax: 40, abvMin: 0, abvMax: 100 };
  const WARN_DELTA_T = 10;              // °C: дальше от 20 °C — предупреждаем

  // ---------- Коэффициенты формулы плотности OIML R 22 ----------
  // ρ(p,t) = A1 + Σ(k=2..12) Ak·p^(k-1) + Σ(k=1..6) Bk·(t-20)^k
  //          + Σ(i=1..5) Σ(k=1..mi) C[i,k]·p^k·(t-20)^i
  // p — массовая доля спирта в долях единицы (12 % -> 0.12), t — °C, ρ — кг/м³.
  const A = [
    9.982012300e2, -1.929769495e2, 3.891238958e2, -1.668103923e3, 1.352215441e4,
    -8.829278388e4, 3.062874042e5, -6.138381234e5, 7.470172998e5, -5.478461354e5,
    2.234460334e5, -3.903285426e4
  ];
  const B = [
    -2.0618513e-1, -5.2682542e-3, 3.6130013e-5, -3.8957702e-7, 7.1693540e-9, -9.9739231e-11
  ];
  const C = [
    // i = 1 (m1 = 11)
    [1.693443461530087e-1, -1.046914743455169e1, 7.196353469546523e1, -7.047478054272792e2,
     3.924090430035045e3, -1.210164659068747e4, 2.248646550400788e4, -2.605562982188164e4,
     1.852373922069467e4, -7.420201433430137e3, 1.285617841998974e3],
    // i = 2 (m2 = 10)
    [-1.193013005057010e-2, 2.517399633803461e-1, -2.170575700536993, 1.353034988843029e1,
     -5.029988758547014e1, 1.096355666577570e2, -1.422753946421155e2, 1.080435942856230e2,
     -4.414153236817392e1, 7.442971530188783],
    // i = 3 (m3 = 9)
    [-6.802995733503803e-4, 1.876837790289664e-2, -2.002561813734156e-1, 1.022992966719220,
     -2.895696483903638, 4.810060584300675, -4.672147440794683, 2.458043105903461,
     -5.411227621436812e-1],
    // i = 4 (m4 = 4)
    [4.075376675622027e-6, -8.763058573471110e-6, 6.515031360099368e-6, -1.515784836987210e-6],
    // i = 5 (m5 = 2)
    [-2.788074354782409e-8, 1.345612883493354e-8]
  ];

  // ---------- Базовые функции ----------

  /** Плотность смеси, кг/м³, при массовой доле p (0..1) и температуре t (°C). */
  function density(p, t) {
    const d = t - 20;

    // A1 + A2·p + ... + A12·p^11 (схема Горнера)
    let rho = A[A.length - 1];
    for (let k = A.length - 2; k >= 0; k--) rho = rho * p + A[k];

    for (let k = 0; k < B.length; k++) rho += B[k] * Math.pow(d, k + 1);

    for (let i = 0; i < C.length; i++) {
      let s = 0;
      for (let k = 0; k < C[i].length; k++) s += C[i][k] * Math.pow(p, k + 1);
      rho += s * Math.pow(d, i + 1);
    }
    return rho;
  }

  /** Объёмная крепость (% об. при 20 °C) по массовой доле p (0..1). */
  function volFromMass(p) {
    return (density(p, 20) * p / RHO_ETHANOL_20) * 100;
  }

  const Q_MAX = volFromMass(1); // ≈ 100 (с точностью до округления 789.24)

  /** Бисекция: f возрастает на [lo, hi], f(lo) <= 0 <= f(hi). */
  function solve(f, lo, hi) {
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) < 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /** Массовая доля p (0..1) по объёмной крепости q (% об. при 20 °C). */
  function massFromVol(q) {
    return solve(function (p) { return volFromMass(p) - q; }, 0, 1);
  }

  function fail(code) { return { ok: false, code: code }; }

  // ---------- Главная функция ----------

  /**
   * Приводит показание спиртометра, снятое при температуре tempC, к 20 °C.
   *
   * @param {number} reading  показание шкалы, % об. (0..100)
   * @param {number} tempC    температура жидкости, °C (-20..40)
   * @param {{glassExpansion?: number}} [options]  по умолчанию обычное стекло (25e-6)
   * @returns {{ok:true, trueAbv:number, correction:number, deltaT:number,
   *            massPercent:number, warnings:string[]} | {ok:false, code:string}}
   * Коды ошибок: NOT_NUMBER, RANGE_TEMP, RANGE_ABV, BELOW_WATER, ABOVE_ETHANOL.
   */
  function correctReading(reading, tempC, options) {
    const alpha = (options && options.glassExpansion) || GLASS_SODA_LIME;

    if (!Number.isFinite(reading) || !Number.isFinite(tempC)) return fail('NOT_NUMBER');
    if (tempC < LIMITS.tMin || tempC > LIMITS.tMax) return fail('RANGE_TEMP');
    if (reading < LIMITS.abvMin || reading > LIMITS.abvMax) return fail('RANGE_ABV');

    // 1. Плотность при 20 °C, соответствующая показанию шкалы
    const q = Math.min(reading, Q_MAX);
    const p20 = massFromVol(q);
    const rho20 = density(p20, 20);

    // 2. Истинная плотность при температуре t (поправка на расширение стекла)
    const rhoT = rho20 * (1 - alpha * (tempC - 20));

    // 3. Массовая доля по плотности и температуре
    const f = function (p) { return rhoT - density(p, tempC); }; // возрастает по p
    if (f(0) > 0) return fail('BELOW_WATER');    // легче воды быть не может → ниже воды
    if (f(1) < 0) return fail('ABOVE_ETHANOL');  // тяжелее чистого спирта → выше 100 %
    const p = solve(f, 0, 1);

    // 4. Объёмная крепость при 20 °C
    const trueAbv = volFromMass(p);
    const deltaT = tempC - 20;
    const warnings = [];
    if (Math.abs(deltaT) > WARN_DELTA_T) warnings.push('FAR_FROM_20');

    return {
      ok: true,
      trueAbv: trueAbv,
      correction: trueAbv - reading,
      deltaT: deltaT,
      massPercent: p * 100,
      warnings: warnings
    };
  }

  return {
    correctReading: correctReading,
    density: density,
    volFromMass: volFromMass,
    massFromVol: massFromVol,
    LIMITS: LIMITS,
    GLASS_SODA_LIME: GLASS_SODA_LIME,
    GLASS_BOROSILICATE: GLASS_BOROSILICATE,
    RHO_ETHANOL_20: RHO_ETHANOL_20
  };
});