import type { MathModelConfig } from './types';

const PAYLINES = [
  [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2], [1, 2, 2, 2, 1], [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
];

export const LowVolModel: MathModelConfig = {
  name: "Neon Fruit",
  volatility: "LOW",
  rtpTarget: 0.96,
  
  theoretical: {
    explanation: "High player retention model. Frequent small wins recycle the balance (Base game RTP > 80%).",
    stats: {
      baseGame: {
        winLines: { hitRate: "1 in 3.00", avgPayout: "1.58x", rtp: "52.60%" },
        feature1: { hitRate: "1 in 14.43", avgPayout: "4.11x", rtp: "28.52%" },
        trigger:  { hitRate: "1 in 120.99", avgPayout: "17.97x", rtp: "14.85%" }
      },
      freeSpins: {
        winLines: { hitRate: "1 in 2.15", avgPayout: "4.26x", rtp: "-" },
        feature1: { hitRate: "1 in 6.65", avgPayout: "10.70x", rtp: "-" }
      }
    },
    risk: {
      volatilitySd: 3.07,
      maxExposure: "212.90x"
    }
  },

  symbols: ['10', 'J', 'Q', 'K', 'A', 'CHERRY', 'BAR', '7'],
  wildSymbol: 'W',
  scatterSymbol: 'S',
  payLines: PAYLINES,

  payTable: {
    '10':     { 3: 0.4, 4: 2, 5: 5 },  
    'J':      { 3: 0.4, 4: 2, 5: 5 },
    'Q':      { 3: 1.0, 4: 3, 5: 8 },
    'K':      { 3: 1.0, 4: 3, 5: 8 },
    'A':      { 3: 1.5, 4: 5, 5: 10 },
    'CHERRY': { 3: 2,   4: 8, 5: 15 },
    'BAR':    { 3: 3,   4: 10, 5: 20 },
    '7':      { 3: 5,   4: 15, 5: 25 },
    'W':      { 3: 5,   4: 15, 5: 25 },
  },

  baseGame: {
    featureProb: 0.069335, 
    reels: {
      reels: [
        ['10','J','Q','10','J','CHERRY','S','K','A','10','J','W','7','BAR','10','J','Q','A','CHERRY','10','J','Q','K','A','10','J','10','J','Q','S'],
        ['10','J','Q','K','10','J','CHERRY','10','K','A','10','J','W','7','BAR','10','J','Q','A','CHERRY','10','J','Q','K','A','10','J','10','J','Q'],
        ['10','J','Q','K','A','10','J','CHERRY','S','K','A','10','J','W','7','BAR','10','J','Q','A','CHERRY','10','S','Q','K','A','10','J','10','J'],
        ['10','J','Q','K','A','CHERRY','10','J','CHERRY','10','K','A','10','J','W','7','BAR','10','J','Q','A','CHERRY','10','J','Q','K','A','10','J'],
        ['10','J','Q','K','A','CHERRY','BAR','10','J','CHERRY','S','K','A','10','J','W','7','BAR','10','J','Q','A','CHERRY','10','J','Q','K','A','S'],
      ]
    }
  },

  freeSpins: {
    triggerCount: 3,
    awardAmount: 5,
    featureProb: 0.15,
    multiplier: 1,
    reels: {
      reels: [
        ['10','J','Q','W','10','J','7','S','K','A','W','J','W','7','BAR','10','J','Q','A','7','10','J','Q','K','A','W','J','10','J','Q','S'],
        ['10','J','Q','W','10','J','7','S','K','A','W','J','W','7','BAR','10','J','Q','A','7','10','J','Q','K','A','W','J','10','J','Q','S'],
        ['10','J','Q','W','A','10','J','7','S','K','A','W','J','W','7','BAR','10','J','Q','A','7','10','J','Q','K','A','W','J','10','J','Q','S'],
        ['10','J','Q','W','A','7','10','J','7','S','K','A','W','J','W','7','BAR','10','J','Q','A','7','10','J','Q','K','A','W','J','10','J','S'],
        ['10','J','Q','W','A','7','BAR','10','J','7','S','K','A','W','J','W','7','BAR','10','J','Q','A','7','10','J','Q','K','A','W','J','S'],
      ]
    }
  }
};