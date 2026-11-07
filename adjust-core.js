// adjust-core.js — доведение спирта до нужной крепости (разбавление и укрепление). Чистая математика.
// Подключать после alcohol-core.js и blend-core.js.
//
// Крепость (% об.) переводится в массовую долю p по OIML R 22, а дальше задача решается ТОЧНО по массам:
//   баланс спирта:  mA·pA + mB·pB = (mA + mB)·pT
// Контракция (усадка объёма) учитывается сама, потому что объёмы получаются из масс через плотность при 20 °C.
// Масса от температуры не зависит, поэтому тонны и килограммы — самый надёжный способ задать количество.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./alcohol-core.js'), require('./blend-core.js'));
  } else {
    root.WineCalc = root.WineCalc || {};
    root.WineCalc.adjust = factory(root.WineCalc.alcohol, root.WineCalc.blend);
  }
})(typeof self !== 'undefined' ? self : this, function (alc, blendLib) {
  'use strict';

  // множитель к мл (для объёма) или к граммам (для массы)
  const UNITS = { ml: { kind: 'vol', f: 1 }, l: { kind: 'vol', f: 1000 },
                  kg: { kind: 'mass', f: 1000 }, t: { kind: 'mass', f: 1e6 } };
  const EPS = 1e-12;

  function liquid(q) {   // жидкость крепостью q % об. при 20 °C
    const p = blendLib.massFraction(q);
    return { p: p, rho: alc.density(p, 20) / 1000 };   // rho — г/мл
  }
  function toGrams(amount, unit, liq) {
    const u = UNITS[unit];
    return u.kind === 'mass' ? amount * u.f : amount * u.f * liq.rho;
  }
  function part(grams, liq) { return { grams: grams, ml: grams / liq.rho }; }
  function fail(code) { return { ok: false, code: code }; }

  /**
   * @param {'add'|'make'} mode
   *   'add'  — есть количество спирта A; сколько добавить B, чтобы получить крепость target
   *   'make' — нужно получить итоговое количество крепостью target из A и B; сколько взять каждого
   * @param {{amount:number, unit:'ml'|'l'|'kg'|'t', strengthA:number, strengthB:number, target:number}} x
   *   strengthB = 0 — вода. Все крепости в % об. при 20 °C, объёмы — при 20 °C.
   * @returns {{ok:true, a:{grams,ml}, b:{grams,ml}, total:{grams,ml}, contraction:number}|{ok:false, code:string}}
   *   коды: NOT_NUMBER, RANGE_ABV, RANGE_AMOUNT, BAD_UNIT, UNREACHABLE, SAME_STRENGTH
   */
  function adjust(mode, x) {
    const vals = [x.amount, x.strengthA, x.strengthB, x.target];
    if (!vals.every(Number.isFinite)) return fail('NOT_NUMBER');
    if (!UNITS[x.unit]) return fail('BAD_UNIT');
    if (!(x.amount > 0)) return fail('RANGE_AMOUNT');
    const L = alc.LIMITS;
    if ([x.strengthA, x.strengthB, x.target].some(function (v) { return v < L.abvMin || v > L.abvMax; })) return fail('RANGE_ABV');

    const A = liquid(x.strengthA), B = liquid(x.strengthB), T = liquid(x.target);
    let mA, mB;

    if (mode === 'add') {
      mA = toGrams(x.amount, x.unit, A);
      if (Math.abs(T.p - A.p) < EPS) {
        mB = 0;                                            // уже нужной крепости
      } else {
        if ((T.p - A.p) * (T.p - B.p) >= 0) return fail('UNREACHABLE');   // цель не между A и B
        mB = mA * (A.p - T.p) / (T.p - B.p);
      }
    } else {
      const M = toGrams(x.amount, x.unit, T);
      if (Math.abs(A.p - B.p) < EPS) return fail(Math.abs(T.p - A.p) < EPS ? 'SAME_STRENGTH' : 'UNREACHABLE');
      mA = M * (T.p - B.p) / (A.p - B.p);
      mB = M - mA;
      if (mA < -EPS * M || mB < -EPS * M) return fail('UNREACHABLE');
      mA = Math.max(0, mA); mB = Math.max(0, mB);
    }

    const total = part(mA + mB, T);
    const a = part(mA, A), b = part(mB, B);
    return { ok: true, a: a, b: b, total: total, contraction: a.ml + b.ml - total.ml };
  }

  return { adjust: adjust, UNITS: UNITS };
});
