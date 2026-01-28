import { SlotMachine } from '../engine/SlotMachine';
import type { MathModelConfig, SimResults } from '../config/types';

self.onmessage = (e: MessageEvent) => {
  const { model, iterations } = e.data as { model: MathModelConfig; iterations: number };
  
  const machine = new SlotMachine(model);
  const results: SimResults = initializeStats();
  
  let sumSquaredDiffs = 0;
  const updateInterval = Math.floor(iterations / 20);

  for (let i = 0; i < iterations; i++) {
    results.totalBet += 1;
    let spinTotalWin = 0;
    
    const bgResult = machine.spin(false);
    spinTotalWin += bgResult.totalWin;

    if (bgResult.freeSpinsTriggered) {
      results.baseGame.freeSpinsTrigger.hitRate++;
      
      results.freeSpins.count++;
      const fsCount = model.freeSpins.awardAmount;
      let fsTotalWin = 0;
      
      for (let f = 0; f < fsCount; f++) {
        const fsResult = machine.spin(true);
        fsTotalWin += fsResult.totalWin;

        if (fsResult.isFeatureHit) {
          results.freeSpins.feature1.hitRate++;
          results.freeSpins.feature1.avgPayout += fsResult.totalWin;
          results.freeSpins.feature1.rtp += fsResult.totalWin;
        } else if (fsResult.totalWin > 0) {
          results.freeSpins.winLines.hitRate++;
          results.freeSpins.winLines.avgPayout += fsResult.totalWin;
          results.freeSpins.winLines.rtp += fsResult.totalWin;
        }
      }
      
      spinTotalWin += fsTotalWin;
      results.freeSpins.totalRtp += fsTotalWin;
      
      results.baseGame.freeSpinsTrigger.rtp += fsTotalWin;
      results.baseGame.freeSpinsTrigger.avgPayout += fsTotalWin;
    } 
    else if (bgResult.isFeatureHit) {
      results.baseGame.feature1.hitRate++;
      results.baseGame.feature1.avgPayout += bgResult.totalWin;
      results.baseGame.feature1.rtp += bgResult.totalWin;
    }
    else if (bgResult.totalWin > 0) {
      results.baseGame.winLines.hitRate++;
      results.baseGame.winLines.avgPayout += bgResult.totalWin;
      results.baseGame.winLines.rtp += bgResult.totalWin;
    }

    results.totalWon += spinTotalWin;
    
    sumSquaredDiffs += Math.pow(spinTotalWin, 2);

    if (i % updateInterval === 0) {
      self.postMessage({ type: 'PROGRESS', progress: (i / iterations) * 100 });
    }
  }

  
  const finalize = (stats: any, frequencyDenominator: number) => {
    stats.rtp = stats.rtp / iterations; 

    if (stats.hitRate > 0) {
      stats.avgPayout = stats.avgPayout / stats.hitRate; 
      stats.hitRate = frequencyDenominator / stats.hitRate; 
    } else {
      stats.hitRate = 0;
    }
  };

  finalize(results.baseGame.winLines, iterations);
  finalize(results.baseGame.feature1, iterations);
  finalize(results.baseGame.freeSpinsTrigger, iterations);
  
  const totalFsPlayed = results.freeSpins.count * model.freeSpins.awardAmount;
  
  if (totalFsPlayed > 0) {
    finalize(results.freeSpins.winLines, totalFsPlayed);
    finalize(results.freeSpins.feature1, totalFsPlayed);
  }

  results.totalRtp = results.totalWon / results.totalBet;
  results.freeSpins.totalRtp = results.freeSpins.totalRtp / results.totalBet;

  const mean = results.totalRtp;
  const meanOfSquares = sumSquaredDiffs / iterations;
  results.variance = meanOfSquares - Math.pow(mean, 2); 
  results.stdDev = Math.sqrt(results.variance);         
  
  results.volatilityIndex = (results.stdDev * 1.96) / Math.sqrt(iterations) * 100;

  results.spinsSimulated = iterations;

  self.postMessage({ type: 'DONE', results });
};

function initializeStats(): SimResults {
  return {
    spinsSimulated: 0,
    totalRtp: 0,
    totalBet: 0,
    totalWon: 0,
    variance: 0,
    stdDev: 0,
    volatilityIndex: 0,
    baseGame: {
      winLines: { hitRate: 0, avgPayout: 0, rtp: 0 },
      feature1: { hitRate: 0, avgPayout: 0, rtp: 0 },
      freeSpinsTrigger: { hitRate: 0, avgPayout: 0, rtp: 0 },
    },
    freeSpins: {
      count: 0,
      winLines: { hitRate: 0, avgPayout: 0, rtp: 0 },
      feature1: { hitRate: 0, avgPayout: 0, rtp: 0 },
      totalRtp: 0,
    },
  };
}
