// ─── Practice Bank Data ────────────────────────────────────────
export const PRACTICE_BANK = {
  lines: {
    label: 'Lines',
    icon: '━',
    items: [
      { id: 'h-line', label: 'Horizontal Line', template: '─────' },
      { id: 'v-line', label: 'Vertical Line', template: '│' },
      { id: 'd-line-r', label: 'Diagonal ╲', template: '╲' },
      { id: 'd-line-l', label: 'Diagonal ╱', template: '╱' },
      { id: 'zigzag', label: 'Zigzag', template: '∿∿∿' },
      { id: 'wave', label: 'Wave', template: '∼∼∼' },
      { id: 'spiral', label: 'Spiral', template: '🌀' },
      { id: 'loop', label: 'Loop', template: '∞' },
    ]
  },
  shapes: {
    label: 'Shapes',
    icon: '◇',
    items: [
      { id: 'circle', label: 'Circle', template: '○' },
      { id: 'square', label: 'Square', template: '□' },
      { id: 'triangle', label: 'Triangle', template: '△' },
      { id: 'diamond', label: 'Diamond', template: '◇' },
      { id: 'star', label: 'Star', template: '☆' },
      { id: 'heart', label: 'Heart', template: '♡' },
      { id: 'oval', label: 'Oval', template: '⬯' },
      { id: 'pentagon', label: 'Pentagon', template: '⬠' },
    ]
  },
  uppercase: {
    label: 'Uppercase',
    icon: 'A',
    items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ({
      id: `uc-${c}`, label: c, template: c
    }))
  },
  lowercase: {
    label: 'Lowercase',
    icon: 'a',
    items: 'abcdefghijklmnopqrstuvwxyz'.split('').map(c => ({
      id: `lc-${c}`, label: c, template: c
    }))
  },
  numbers: {
    label: 'Numbers',
    icon: '#',
    items: '0123456789'.split('').map(c => ({
      id: `num-${c}`, label: c, template: c
    }))
  },
  punctuation: {
    label: 'Punctuation',
    icon: '&',
    items: [
      { id: 'period', label: '.', template: '.' },
      { id: 'comma', label: ',', template: ',' },
      { id: 'exclaim', label: '!', template: '!' },
      { id: 'question', label: '?', template: '?' },
      { id: 'colon', label: ':', template: ':' },
      { id: 'semicolon', label: ';', template: ';' },
      { id: 'ampersand', label: '&', template: '&' },
      { id: 'at', label: '@', template: '@' },
    ]
  }
};

// ─── Daily Worksheet Progression ───────────────────────────────
// Each level defines what categories + items to pull from for the daily set.
export const PROGRESSION = [
  // Level 1-3: Basic strokes
  { level: 1, title: 'Basic Strokes I',   categories: ['lines'], count: 4, desc: 'Horizontal & vertical lines' },
  { level: 2, title: 'Basic Strokes II',  categories: ['lines'], count: 6, desc: 'Diagonals & zigzags' },
  { level: 3, title: 'Basic Strokes III', categories: ['lines'], count: 8, desc: 'Waves, spirals & loops' },
  // Level 4-6: Shapes
  { level: 4, title: 'Simple Shapes I',   categories: ['shapes'], count: 4, desc: 'Circles & squares' },
  { level: 5, title: 'Simple Shapes II',  categories: ['shapes'], count: 6, desc: 'Triangles & diamonds' },
  { level: 6, title: 'All Shapes',        categories: ['shapes'], count: 8, desc: 'Master all basic shapes' },
  // Level 7-10: Numbers
  { level: 7,  title: 'Numbers I',   categories: ['numbers'], count: 5, desc: '0-4' },
  { level: 8,  title: 'Numbers II',  categories: ['numbers'], count: 5, desc: '5-9' },
  { level: 9,  title: 'All Numbers', categories: ['numbers'], count: 10, desc: 'Write all digits' },
  { level: 10, title: 'Mixed Review I', categories: ['lines','shapes','numbers'], count: 8, desc: 'Review everything so far' },
  // Level 11-16: Letters
  { level: 11, title: 'Uppercase A-F',  categories: ['uppercase'], count: 6, desc: 'First letters' },
  { level: 12, title: 'Uppercase G-M',  categories: ['uppercase'], count: 7, desc: 'Middle letters' },
  { level: 13, title: 'Uppercase N-Z',  categories: ['uppercase'], count: 13, desc: 'Last letters' },
  { level: 14, title: 'Lowercase a-i',  categories: ['lowercase'], count: 9, desc: 'Lowercase basics' },
  { level: 15, title: 'Lowercase j-r',  categories: ['lowercase'], count: 9, desc: 'Lowercase continued' },
  { level: 16, title: 'Lowercase s-z',  categories: ['lowercase'], count: 8, desc: 'Lowercase finale' },
  // Level 17-18: Punctuation + Mix
  { level: 17, title: 'Punctuation',    categories: ['punctuation'], count: 8, desc: 'Essential symbols' },
  { level: 18, title: 'Full Review',    categories: ['uppercase','lowercase','numbers','punctuation'], count: 12, desc: 'Grand review' },
  // Level 19-20: Words
  { level: 19, title: 'Simple Words',   categories: ['words'], count: 5, desc: 'Short common words', words: ['the','and','for','you','are'] },
  { level: 20, title: 'Sentences',      categories: ['words'], count: 3, desc: 'Full sentences', words: ['The quick brown fox','jumps over the lazy dog','Practice makes perfect'] },
];

export const MAX_LEVEL = PROGRESSION.length;
