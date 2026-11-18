import { describe, expect, it } from 'vitest';
import { csvCell } from '@/lib/utils/csv';

describe('export CSV', () => {
  it('entoure la valeur de guillemets et double les guillemets internes', () => {
    expect(csvCell('Aminata "AM" Test')).toBe('"Aminata ""AM"" Test"');
  });

  it('neutralise les formules qui pourraient s’exécuter dans un tableur', () => {
    expect(csvCell('=HYPERLINK("http://x")')).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(csvCell('+33 6')).toBe('"\'+33 6"');
    expect(csvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
  });

  it('laisse les nombres et les textes ordinaires intacts', () => {
    expect(csvCell(25000)).toBe('"25000"');
    expect(csvCell('PE-ABCDEFGH')).toBe('"PE-ABCDEFGH"');
  });
});
