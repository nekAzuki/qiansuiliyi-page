import { describe, it, expect } from 'vitest';
import { computePinyin } from '@/lib/pinyin';

describe('computePinyin', () => {
  it('converts Chinese text to pinyin and initials', () => {
    const result = computePinyin('发如雪');
    expect(result.pinyin).toBe('faruxue');
    expect(result.initials).toBe('frx');
  });

  it('handles mixed Chinese and English text', () => {
    const result = computePinyin('Hello世界');
    // English should pass through, Chinese should be converted
    expect(result.pinyin).toContain('hello');
    expect(result.pinyin).toContain('shijie');
    expect(result.initials).toContain('hello');
    expect(result.initials).toContain('sj');
  });

  it('handles pure English text as passthrough', () => {
    const result = computePinyin('Hello');
    expect(result.pinyin).toBe('hello');
    expect(result.initials).toBe('hello');
  });

  it('handles empty string', () => {
    const result = computePinyin('');
    expect(result.pinyin).toBe('');
    expect(result.initials).toBe('');
  });

  it('handles a single Chinese character', () => {
    const result = computePinyin('月');
    expect(result.pinyin).toBe('yue');
    expect(result.initials).toBe('y');
  });

  it('handles a single English character', () => {
    const result = computePinyin('A');
    expect(result.pinyin).toBe('a');
    expect(result.initials).toBe('a');
  });

  it('handles common multi-pronunciation characters', () => {
    // 乐 can be "le" or "yue", pinyin-pro defaults to context-based reading
    const result = computePinyin('快乐');
    expect(result.pinyin).toBe('kuaile');
    expect(result.initials).toBe('kl');
  });

  it('handles numbers and special characters', () => {
    const result = computePinyin('123');
    // Numbers pass through as non-Chinese
    expect(result.pinyin).toBe('123');
    expect(result.initials).toBe('123');
  });

  it('handles text with spaces', () => {
    const result = computePinyin('你 好');
    // Spaces are non-Chinese and treated as consecutive
    expect(result.pinyin).toContain('ni');
    expect(result.pinyin).toContain('hao');
  });
});
