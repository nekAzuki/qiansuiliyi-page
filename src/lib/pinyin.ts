import { pinyin } from 'pinyin-pro';

export function computePinyin(text: string): { pinyin: string; initials: string } {
  const fullPinyin = pinyin(text, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  });

  const pinyinStr = fullPinyin.join('').toLowerCase();

  const initialPinyin = pinyin(text, {
    pattern: 'first',
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  });

  const initialsStr = initialPinyin.join('').toLowerCase();

  return { pinyin: pinyinStr, initials: initialsStr };
}
