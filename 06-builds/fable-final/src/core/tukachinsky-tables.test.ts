import { describe, it, expect } from 'vitest';
import {
  TUKACHINSKY_TABLES,
  getTukachinskyTimes,
  kzMonthToTableKey,
} from './tukachinsky-tables';

describe('TUKACHINSKY_TABLES', () => {
  it('has data for Hebrew years 5783 through 5787', () => {
    expect(TUKACHINSKY_TABLES).toHaveProperty('5783');
    expect(TUKACHINSKY_TABLES).toHaveProperty('5784');
    expect(TUKACHINSKY_TABLES).toHaveProperty('5785');
    expect(TUKACHINSKY_TABLES).toHaveProperty('5786');
    expect(TUKACHINSKY_TABLES).toHaveProperty('5787');
  });

  it('year 5783 month 1 (Tishrei) has 30 sunrise entries', () => {
    const tishrei = TUKACHINSKY_TABLES[5783]!.sunrise[1];
    expect(tishrei).toHaveLength(30);
  });

  it('first sunrise entry for 5783 Tishrei is 05:28:58', () => {
    const firstEntry = TUKACHINSKY_TABLES[5783]!.sunrise[1]![0];
    expect(firstEntry).toBe('05:28:58');
  });
});

describe('getTukachinskyTimes', () => {
  it('returns non-null sunrise and sunset for a date inside the table range', () => {
    // Oct 1 2022 ≈ 6 Tishrei 5783
    const result = getTukachinskyTimes(new Date('2022-10-01T12:00:00Z'));
    expect(result.sunrise).toBeInstanceOf(Date);
    expect(result.sunset).toBeNull(); // 5783 sunset data is empty arrays
  });

  it('returns non-null sunrise and sunset for a year with sunset data', () => {
    // Oct 3 2023 ≈ 18 Tishrei 5784 (5784 has sunset data)
    const result = getTukachinskyTimes(new Date('2023-10-03T12:00:00Z'));
    expect(result.sunrise).toBeInstanceOf(Date);
    expect(result.sunset).toBeInstanceOf(Date);
  });

  it('returns nulls for a date outside the table range', () => {
    // Year 2030 is well beyond 5787
    const result = getTukachinskyTimes(new Date('2030-06-15T12:00:00Z'));
    expect(result.sunrise).toBeNull();
    expect(result.sunset).toBeNull();
  });
});

describe('kzMonthToTableKey', () => {
  it('maps Tishrei (kz 7) to table key 1', () => {
    expect(kzMonthToTableKey(7)).toBe(1);
  });

  it('maps Adar II (kz 13) to table key 6', () => {
    expect(kzMonthToTableKey(13)).toBe(6);
  });

  it('maps Nissan (kz 1) to table key 7', () => {
    expect(kzMonthToTableKey(1)).toBe(7);
  });

  it('maps Elul (kz 6) to table key 12', () => {
    expect(kzMonthToTableKey(6)).toBe(12);
  });

  it('maps Adar (kz 12) to table key 6', () => {
    expect(kzMonthToTableKey(12)).toBe(6);
  });
});
