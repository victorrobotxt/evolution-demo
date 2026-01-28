import { SlotMachine } from './SlotMachine';
import { LowVolModel } from '../config/low-vol';
import { HighVolModel } from '../config/high-vol';
import type { MathModelConfig } from '../config/types';

const ARGS = process.argv.slice(2);
const MODEL_KEY = (ARGS[0] || 'LOW').toUpperCase();
const SPINS = parseInt(ARGS[1] || '100000');
const VERBOSE = SPINS <= 50; 

const model: MathModelConfig = MODEL_KEY === 'HIGH' ? HighVolModel : LowVolModel;
const machine = new SlotMachine(model);

const stats = {
    totalSpins: 0,
    totalBet: 0,
    totalWon: 0,
    maxWin: 0,
    hitCount: 0, 
    
    baseGame: {
        totalWin: 0,
        lineHits: 0,
        lineWinTotal: 0,
        featureHits: 0,
        featureWinTotal: 0, 
        triggerHits: 0,
        triggerWinTotal: 0
    },
    
    freeSpins: {
        enteredCount: 0,
        totalSpinsPlayed: 0,
        totalWin: 0,
        maxWinInBonus: 0,
        lineHits: 0,
        lineWinTotal: 0,
        featureHits: 0,
        featureWinTotal: 0
    },

    buckets: { dead: 0, low: 0, medium: 0, big: 0, huge: 0, mega: 0 },
    squaredDiffs: 0
};

console.log(`\n🧪 STARTING EXTENDED SIMULATION`);
console.log(`🎰 Model: ${model.name} (${model.profile})`);
console.log(`🔄 Spins: ${SPINS.toLocaleString()}`);
console.log(`------------------------------------------------------------\n`);

const startTime = Date.now();

for (let i = 1; i <= SPINS; i++) {
    stats.totalSpins++;
    stats.totalBet += 1; 

    const bgResult = machine.spin(false);
    
    let spinTotalWin = 0;
    
    let currentSpinFeatureWin = 0;
    if (bgResult.isFeatureHit) { 
        stats.baseGame.featureHits++;
        currentSpinFeatureWin = bgResult.totalWin; 
        stats.baseGame.featureWinTotal += currentSpinFeatureWin;
    }

    let currentSpinLineWin = 0;
    if (!bgResult.isFeatureHit && bgResult.totalWin > 0) {
        stats.baseGame.lineHits++;
        currentSpinLineWin = bgResult.totalWin;
        stats.baseGame.lineWinTotal += currentSpinLineWin;
    }

    spinTotalWin = currentSpinFeatureWin + currentSpinLineWin;
    stats.baseGame.totalWin += spinTotalWin;

    let bonusWin = 0;
    if (bgResult.freeSpinsTriggered) {
        stats.freeSpins.enteredCount++;
        stats.baseGame.triggerHits++;
        

        const fsCount = model.freeSpins.awardAmount;
        if (VERBOSE) console.log(`   🚨 BONUS TRIGGERED! (${bgResult.scattersFound} Scatters)`);

        for (let f = 1; f <= fsCount; f++) {
            const fsResult = machine.spin(true);
            
            if (fsResult.isFeatureHit) {
                stats.freeSpins.featureHits++;
                stats.freeSpins.featureWinTotal += fsResult.totalWin;
            } else if (fsResult.totalWin > 0) {
                stats.freeSpins.lineHits++;
                stats.freeSpins.lineWinTotal += fsResult.totalWin;
            }

            bonusWin += fsResult.totalWin;
            stats.freeSpins.totalSpinsPlayed++;
        }
        
        stats.freeSpins.totalWin += bonusWin;
        if (bonusWin > stats.freeSpins.maxWinInBonus) stats.freeSpins.maxWinInBonus = bonusWin;
        
        spinTotalWin += bonusWin;
    }

    stats.totalWon += spinTotalWin;
    if (spinTotalWin > 0) stats.hitCount++;
    if (spinTotalWin > stats.maxWin) stats.maxWin = spinTotalWin;

    if (spinTotalWin === 0) stats.buckets.dead++;
    else if (spinTotalWin < 1) stats.buckets.low++;
    else if (spinTotalWin < 10) stats.buckets.medium++;
    else if (spinTotalWin < 50) stats.buckets.big++;
    else if (spinTotalWin < 100) stats.buckets.huge++;
    else stats.buckets.mega++;

    stats.squaredDiffs += Math.pow(spinTotalWin, 2);

    if (VERBOSE) {
        console.log(`Spin #${i} | Win: ${spinTotalWin.toFixed(2)} | Feat: ${bgResult.isFeatureHit}`);
    } else if (i % 100000 === 0) process.stdout.write('.');
}

const duration = (Date.now() - startTime) / 1000;
const rtp = (stats.totalWon / stats.totalBet);
const stdDev = Math.sqrt((stats.squaredDiffs / stats.totalSpins) - Math.pow(rtp, 2));

console.log(`\n\n============================================================`);
console.log(`📊 MATHEMATICIAN TASK REPORT: ${model.name}`);
console.log(`============================================================`);
console.log(`(Simulated ${SPINS.toLocaleString()} spins)`);

const calcStats = (wins: number, hits: number, divisor: number) => {
    const hitRate = hits > 0 ? `1 in ${(divisor / hits).toFixed(2)}` : "0";
    const avgPay = hits > 0 ? `${(wins / hits).toFixed(2)}x` : "0.00x";
    const rtpVal = `${((wins / stats.totalBet) * 100).toFixed(2)}%`;
    return { hitRate, avgPay, rtpVal };
};

const bgLines = calcStats(stats.baseGame.lineWinTotal, stats.baseGame.lineHits, stats.totalSpins);
const bgFeat = calcStats(stats.baseGame.featureWinTotal, stats.baseGame.featureHits, stats.totalSpins);
const bgTrigger = calcStats(stats.freeSpins.totalWin, stats.freeSpins.enteredCount, stats.totalSpins); 

console.log(`\n[BASE GAME]`);
console.log(`- Win Lines  | Hit Rate: ${bgLines.hitRate.padEnd(10)} | Avg payout: ${bgLines.avgPay.padEnd(8)} | RTP: ${bgLines.rtpVal}`);
console.log(`- Feature #1 | Hit Rate: ${bgFeat.hitRate.padEnd(10)} | Avg payout: ${bgFeat.avgPay.padEnd(8)} | RTP: ${bgFeat.rtpVal}`);
console.log(`- Free Spins | Hit Rate: ${bgTrigger.hitRate.padEnd(10)} | Avg payout: ${bgTrigger.avgPay.padEnd(8)} | RTP: ${bgTrigger.rtpVal}`);

const fsLines = calcStats(stats.freeSpins.lineWinTotal, stats.freeSpins.lineHits, stats.freeSpins.totalSpinsPlayed);
const fsFeat = calcStats(stats.freeSpins.featureWinTotal, stats.freeSpins.featureHits, stats.freeSpins.totalSpinsPlayed);

console.log(`\n[FREE SPINS] (Avg Spins: ${(stats.freeSpins.totalSpinsPlayed/stats.freeSpins.enteredCount || 0).toFixed(1)})`);
console.log(`- Win Lines  | Hit Rate: ${fsLines.hitRate.padEnd(10)} | Avg payout: ${fsLines.avgPay.padEnd(8)} | RTP: (Inc. in Trigger)`);
console.log(`- Feature #1 | Hit Rate: ${fsFeat.hitRate.padEnd(10)} | Avg payout: ${fsFeat.avgPay.padEnd(8)} | RTP: (Inc. in Trigger)`);

console.log(`\n------------------------------------------------------------`);
console.log(`TOTAL RTP: ${(rtp * 100).toFixed(2)}% | MAX WIN: ${stats.maxWin.toFixed(2)}x | VOLATILITY (SD): ${stdDev.toFixed(2)}`);
console.log(`============================================================\n`);