export interface PayTable {
  [symbolId: string]: {
    3: number;
    4: number;
    5: number;
  };
}

export interface ReelSet {
  reels: string[][];
}

export interface TheoreticalProfile {
  explanation: string;
  stats: {
    baseGame: {
      winLines: { hitRate: string; avgPayout: string; rtp: string };
      feature1: { hitRate: string; avgPayout: string; rtp: string };
      trigger: { hitRate: string; avgPayout: string; rtp: string };
    };
    freeSpins: {
      winLines: { hitRate: string; avgPayout: string; rtp: string };
      feature1: { hitRate: string; avgPayout: string; rtp: string };
    };
  };
  risk: {
    volatilitySd: number;
    maxExposure: string;
  }
}

export interface MathModelConfig {
  name: string;
  profile?: string;
  volatility: 'LOW' | 'HIGH';
  rtpTarget: number;
  theoretical?: TheoreticalProfile;
  symbols: string[];
  wildSymbol: string;
  scatterSymbol: string;
  payLines: number[][];
  payTable: PayTable;
  baseGame: {
    reels: ReelSet;
    featureProb: number;
  };
  freeSpins: {
    triggerCount: number;
    awardAmount: number;
    reels: ReelSet;
    featureProb: number;
    multiplier: number;
  };
}

export interface SimResults {
  spinsSimulated: number;
  totalRtp: number;
  totalBet: number;
  totalWon: number;
  
  variance: number;      
  stdDev: number;        
  volatilityIndex: number; 

  baseGame: {
    winLines: { hitRate: number; avgPayout: number; rtp: number };
    feature1: { hitRate: number; avgPayout: number; rtp: number };
    freeSpinsTrigger: { hitRate: number; avgPayout: number; rtp: number };
  };

  freeSpins: {
    count: number;
    winLines: { hitRate: number; avgPayout: number; rtp: number };
    feature1: { hitRate: number; avgPayout: number; rtp: number };
    totalRtp: number;
  };
}
