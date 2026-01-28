import type { MathModelConfig } from '../config/types';
import { Evaluator, type WinLine } from './Evaluator';

export interface SpinResult {
  grid: string[][];
  winLines: WinLine[];
  totalWin: number;
  isFeatureHit: boolean;
  scattersFound: number;
  freeSpinsTriggered: boolean;
}

export class SlotMachine {
  private config: MathModelConfig;

  constructor(config: MathModelConfig) {
    this.config = config;
  }

  spin(isFreeSpin = false): SpinResult {
    const settings = isFreeSpin ? this.config.freeSpins : this.config.baseGame;
    
    const reelStrips = settings.reels.reels;
    const stops = reelStrips.map(strip => Math.floor(Math.random() * strip.length));
    
    const grid: string[][] = [[], [], []];

    for (let col = 0; col < 5; col++) {
      const strip = reelStrips[col];
      const stopIndex = stops[col];
      
      const s1 = strip[stopIndex];
      const s2 = strip[(stopIndex + 1) % strip.length];
      const s3 = strip[(stopIndex + 2) % strip.length];

      grid[0][col] = s1;
      grid[1][col] = s2;
      grid[2][col] = s3;
    }

    const isFeatureHit = Math.random() < settings.featureProb;
    if (isFeatureHit) {
      this.applyFeature(grid); 
    }

    const evalResult = Evaluator.evaluate(grid, this.config);
    let totalWin = evalResult.totalWin;

    // FIX: Cast to any to safely access multiplier property
    if (isFreeSpin && 'multiplier' in settings && (settings as any).multiplier > 1) {
        totalWin *= (settings as any).multiplier;
        evalResult.winLines.forEach(w => w.amount *= (settings as any).multiplier);
    }

    let scattersFound = 0;
    grid.forEach(row => {
        row.forEach(symbol => {
            if (symbol === this.config.scatterSymbol) scattersFound++;
        });
    });
    
    const freeSpinsTriggered = scattersFound >= this.config.freeSpins.triggerCount;

    return {
      grid,
      winLines: evalResult.winLines,
      totalWin,
      isFeatureHit,
      scattersFound,
      freeSpinsTriggered
    };
  }

  private applyFeature(grid: string[][]) {
    let wildsToAdd = 3;
    let attempts = 0;
    
    while (wildsToAdd > 0 && attempts < 20) {
      const r = Math.floor(Math.random() * 3);
      const c = Math.floor(Math.random() * 5);
      
      const current = grid[r][c];
      
      if (current !== this.config.scatterSymbol && current !== this.config.wildSymbol) {
        grid[r][c] = this.config.wildSymbol;
        wildsToAdd--;
      }
      attempts++;
    }
  }
}