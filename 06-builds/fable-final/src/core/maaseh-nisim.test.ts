import { describe, it, expect } from 'vitest';
import { getMaasehNisimZman, MAASEH_NISIM_TABLE } from './maaseh-nisim';

describe('MAASEH_NISIM_TABLE', () => {
  it('has exactly 366 entries (Jan 1 through Dec 31 including Feb 29)', () => {
    expect(MAASEH_NISIM_TABLE.size).toBe(366);
  });
});

describe('getMaasehNisimZman', () => {
  it('returns the correct row for Jan 1', () => {
    const row = getMaasehNisimZman(1, 1);
    expect(row).toBeDefined();
    expect(row!.alos).toBe(318);
    expect(row!.sunrise).toBe(395);
    expect(row!.shkiah).toBe(1009);
    expect(row!.tzitzit).toBe(335);
    expect(row!.chatzos).toBe(703);
    expect(row!.candle).toBe(969);
    expect(row!.motzei).toBe(1044);
    expect(row!.tzais).toBe(1027);
  });

  it('returns the correct row for the summer solstice (Jun 21)', () => {
    const row = getMaasehNisimZman(6, 21);
    expect(row).toBeDefined();
    expect(row!.alos).toBe(223);
    expect(row!.shkiah).toBe(1190);
    expect(row!.sunrise).toBe(330);
    expect(row!.chatzos).toBe(760);
  });

  it('returns the correct row for Dec 31 (last entry)', () => {
    const row = getMaasehNisimZman(12, 31);
    expect(row).toBeDefined();
    expect(row!.alos).toBe(318);
    expect(row!.sunrise).toBe(395);
    expect(row!.shkiah).toBe(1009);
    expect(row!.tzais).toBe(1027);
  });

  it('returns undefined for Feb 30 (no such date in the table)', () => {
    const row = getMaasehNisimZman(2, 30);
    expect(row).toBeUndefined();
  });

  it('returns a valid row for Feb 29 (leap day) with alos: 280', () => {
    const row = getMaasehNisimZman(2, 29);
    expect(row).toBeDefined();
    expect(row!.alos).toBe(280);
    expect(row!.shkiah).toBe(1059);
    expect(row!.sunrise).toBe(365);
  });
});
