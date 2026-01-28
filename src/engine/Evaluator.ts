import type { MathModelConfig, PayTable } from '../config/types';

export interface WinLine {
  lineIndex: number;
  symbol: string;
  count: number;
  amount: number;
}

export class Evaluator {
  
  static evaluate(grid: string[][], config: MathModelConfig): { totalWin: number; winLines: WinLine[] } {
    const { payLines, payTable, wildSymbol } = config;
    let totalWin = 0;
    const winLines: WinLine[] = [];

    payLines.forEach((lineOffsets, lineIndex) => {
      const lineSymbols = lineOffsets.map((rowIndex, colIndex) => grid[rowIndex][colIndex]);
      
      const match = this.checkLine(lineSymbols, payTable, wildSymbol);
      
      if (match.amount > 0) {
        totalWin += match.amount;
        winLines.push({
          lineIndex,
          symbol: match.symbol,
          count: match.count,
          amount: match.amount
        });
      }
    });

    return { totalWin, winLines };
  }

  private static checkLine(symbols: string[], payTable: PayTable, wildSymbol: string): { symbol: string; count: number; amount: number } {
    const firstSymbol = symbols[0];
    
    if (firstSymbol !== wildSymbol && !payTable[firstSymbol]) {
      return { symbol: '', count: 0, amount: 0 };
    }

    let matchSymbol = firstSymbol;
    let count = 0;

    if (matchSymbol === wildSymbol) {
      const firstNonWild = symbols.find(s => s !== wildSymbol);
      if (firstNonWild) {
        matchSymbol = firstNonWild;
      } else {
        matchSymbol = wildSymbol; 
      }
    }

    for (let i = 0; i < symbols.length; i++) {
      const s = symbols[i];
      if (s === matchSymbol || s === wildSymbol) {
        count++;
      } else {
        break;
      }
    }

    if (!payTable[matchSymbol]) return { symbol: '', count: 0, amount: 0 };

    const payout = payTable[matchSymbol][count as 3|4|5] || 0;
    
    return { symbol: matchSymbol, count, amount: payout };
  }
}