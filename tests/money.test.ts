import { describe, expect, it } from 'vitest';
import { formatEur, formatFcfa, xofToEur, XOF_PER_EUR } from '@/lib/utils/money';
import { createSeed } from '@/lib/store/seed';

describe('double affichage euro / FCFA', () => {
  it('convertit avec la parité fixe 1 € = 655,957 FCFA', () => {
    expect(XOF_PER_EUR).toBe(655.957);
    expect(xofToEur(655957)).toBe(1000);
    expect(xofToEur(8000)).toBe(12.2);
    expect(xofToEur(15000)).toBe(22.87);
    expect(xofToEur(0)).toBe(0);
  });

  it('formate les deux devises à la française', () => {
    expect(formatEur(8000).replace(/\s/g, ' ')).toBe('12,20 €');
    expect(formatFcfa(15000).replace(/\s/g, ' ')).toBe('15 000 FCFA');
  });
});

describe('catalogue de lancement', () => {
  it('contient les dix parfums de la liste, répartis en quatre gammes', () => {
    const seed = createSeed();
    expect(seed.products).toHaveLength(10);
    expect(new Set(seed.products.map((p) => p.family))).toEqual(
      new Set(['Musc Tahara', 'El Nabil', 'Huile concentrée', 'Kenzie']),
    );
    expect(seed.products.every((p) => seed.variants.some((v) => v.productId === p.id && v.priceXof > 0))).toBe(true);
    expect(new Set(seed.products.map((p) => p.slug)).size).toBe(10);
  });
});
