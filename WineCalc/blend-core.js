// blend-core.js — купажирование (смешивание) спиртов разной крепости. Чистая математика, без HTML.
// Зависит от alcohol-core.js (формула плотности OIML R 22). Подключать ПОСЛЕ него.
//
// Почему не просто «V1·q1 + V2·q2»: при смешивании спирта с водой объём уменьшается (контракция),
// поэтому считаем по МАССАМ, а объёмы получаем через плотность при 20 °C:
//   1. каждая порция: масса = V · ρ20(q), масса спирта в ней = масса · p(q)   (p — массовая доля)
//   2. складываем массы: p = масса_спирта / масса_смеси
//   3. плотность смеси ρ20(p) -> итоговый объём = масса_смеси / ρ20(p), крепость q = ρ20(p)·p / 789.24
// Предполагается, что объёмы и крепости указаны при 20 °C (крепость можно взять из калькулятора температуры).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./alcohol-core.js'));
  } else {
    root.WineCalc = root.WineCalc || {};
    root.WineCalc.blend = factory(root.WineCalc.alcohol);
  }
})(typeof self !== 'undefined' ? self : this, function (alc) {
  'use strict';

  /** Массовая доля p (0..1) по объёмной крепости q (% об. при 20 °C), бисекцией. */
  function massFraction(q) {
    const target = Math.min(q, alc.volFromMass(1));
    let lo = 0, hi = 1;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (alc.volFromMass(mid) < target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function fail(code) { return { ok: false, code: code }; }

  /**
   * @param {{volume:number, abv:number}[]} parts  volume — мл при 20 °C, abv — % об. при 20 °C (воду задаём как abv = 0)
   * @returns {{ok:true, abv, volume, volumeSum, contraction, contractionPercent, alcoholMl, massG, massPercent}
   *          | {ok:false, code}}  коды: NOT_NUMBER, RANGE_VOLUME, RANGE_ABV, ZERO_TOTAL
   */
  function blend(parts) {
    if (!Array.isArray(parts) || parts.length === 0) return fail('NOT_NUMBER');
    for (let i = 0; i < parts.length; i++) {
      if (!Number.isFinite(parts[i].volume) || !Number.isFinite(parts[i].abv)) return fail('NOT_NUMBER');
      if (parts[i].volume < 0) return fail('RANGE_VOLUME');
      if (parts[i].abv < alc.LIMITS.abvMin || parts[i].abv > alc.LIMITS.abvMax) return fail('RANGE_ABV');
    }

    let mass = 0, ethanol = 0, volumeSum = 0;
    parts.forEach(function (c) {
      const p = massFraction(c.abv);
      const m = c.volume * alc.density(p, 20) / 1000;   // г (кг/м³ -> г/мл)
      mass += m;
      ethanol += m * p;
      volumeSum += c.volume;
    });
    if (!(mass > 0)) return fail('ZERO_TOTAL');

    const p = ethanol / mass;
    const volume = mass / (alc.density(p, 20) / 1000);  // мл
    const abv = alc.volFromMass(p);
    const contraction = volumeSum - volume;

    return {
      ok: true,
      abv: abv,
      volume: volume,
      volumeSum: volumeSum,
      contraction: contraction,
      contractionPercent: contraction / volumeSum * 100,
      alcoholMl: volume * abv / 100,     // чистый спирт, мл при 20 °C
      massG: mass,
      massPercent: p * 100
    };
  }

  return { blend: blend, massFraction: massFraction };
});
