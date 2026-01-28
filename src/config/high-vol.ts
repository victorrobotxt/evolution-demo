import type { MathModelConfig } from './types';

const PAYLINES = [
  [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2], [1, 2, 2, 2, 1], [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
];

export const HighVolModel: MathModelConfig = {
  name: "Inferno 7s",
  volatility: "HIGH",
  rtpTarget: 0.96,

  theoretical: {
    explanation: "Gambler profile. Base game RTP suppressed to ~36% to fund massive free spins budget (60% RTP) and 144x avg bonus.",
    stats: {
      baseGame: {
        winLines: { hitRate: "1 in 3.26", avgPayout: "0.83x", rtp: "25.50%" },
        feature1: { hitRate: "1 in 35.70", avgPayout: "3.80x", rtp: "10.64%" },
        trigger:  { hitRate: "1 in 241.28", avgPayout: "144.32x", rtp: "59.81%" }
      },
      freeSpins: {
        winLines: { hitRate: "1 in 2.43", avgPayout: "10.81x", rtp: "-" },
        feature1: { hitRate: "1 in 4.00", avgPayout: "39.92x", rtp: "-" }
      }
    },
    risk: {
      volatilitySd: 15.93,
      maxExposure: "2532.35x"
    }
  },
  
  symbols: ['10', 'J', 'Q', 'K', 'A', 'BAR', 'DIAMOND', '7'],
  wildSymbol: 'W',
  scatterSymbol: 'S',
  payLines: PAYLINES,

  payTable: {
    '10':      { 3: 0.2, 4: 0.40, 5: 2 },   
    'J':       { 3: 0.2, 4: 0.40, 5: 2 },
    'Q':       { 3: 0.45, 4: 0.9, 5: 4 },
    'K':       { 3: 0.45, 4: 0.9, 5: 4 },
    'A':       { 3: 1,   4: 4,    5: 10 }, 
    'BAR':     { 3: 4,   4: 15,   5: 50 }, 
    'DIAMOND': { 3: 8,   4: 30,   5: 90 },
    '7':       { 3: 15,  4: 70,   5: 275 },
    'W':       { 3: 15,  4: 70,   5: 275 },
  },

  baseGame: {
    featureProb: 0.028032, 
    reels: {
      reels: [
        ['10','J','Q','K','A','10','J','Q','W','7','DIAMOND','10','J','Q','K','A','10','J','Q','K','A','10','J','Q','K','A','10','J','Q','K','A','10','J','Q','S'],
        ['10','J','Q','K','BAR','10','J','W','7','DIAMOND','10','J','Q','BAR','10','K','S','10','J','Q','K','BAR','10','J','Q','K','BAR','10','J','Q','K','A','10'],
        ['10','J','Q','K','A','10','J','W','7','DIAMOND','10','J','Q','K','A','10','J','Q','K','A','10','J','S','10','Q','K','A','10','Q','K','A','10','Q','K','A','S'],
        ['10','J','Q','K','A','DIAMOND','10','J','Q','W','7','10','J','Q','A','10','J','Q','A','10','J','Q','A','10','J','Q','A','10','J','Q','A','10','J','Q','A'],
        ['10','J','Q','K','A','DIAMOND','BAR','10','J','Q','W','7','10','J','Q','K','A','10','J','Q','K','A','10','Q','K','A','10','Q','K','A','10','Q','K','A','S'],
      ]
    }
  },

  freeSpins: {
    triggerCount: 3,
    awardAmount: 10, 
    featureProb: 0.25, 
    multiplier: 1,
    reels: {
      reels: [
        ['10','J','Q','W','7','S','K','A','W','7','BAR','10','J','Q','A','7','DIAMOND','W','10','J','10','J','Q','K','10','J'],
        ['10','J','Q','W','7','10','K','A','W','7','BAR','10','J','Q','A','7','DIAMOND','W','10','J','10','J','Q','K','10','J'],
        ['10','J','Q','W','A','10','J','7','S','K','A','W','7','BAR','DIAMOND','A','7','W','10','J','10','J','Q','K','10','J'],
        ['10','J','Q','W','A','7','10','J','7','10','K','A','W','7','BAR','DIAMOND','A','7','W','10','J','10','J','Q','K','10','J'],
        ['10','J','Q','W','A','7','BAR','10','J','7','S','K','A','W','7','BAR','DIAMOND','A','7','W','10','J','10','J','Q','K','10','J'],
      ]
    }
  }
};
