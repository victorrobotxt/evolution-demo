import { useState, useEffect, useRef } from 'react';
import { LowVolModel } from './config/low-vol';
import { HighVolModel } from './config/high-vol';
import { SlotMachine } from './engine/SlotMachine';
import SimWorker from './workers/sim.worker?worker';
import type { SimResults, TheoreticalProfile } from './config/types';
import './App.css';

const MODELS = {
  LOW: LowVolModel,
  HIGH: HighVolModel,
};

function App() {
  const [selectedModel, setSelectedModel] = useState<'LOW' | 'HIGH'>('LOW');
  const [simConfig, setSimConfig] = useState<{ status: 'IDLE' | 'RUNNING' | 'DONE'; progress: number; target: number }>({ 
    status: 'IDLE', 
    progress: 0, 
    target: 0 
  });
  const [stats, setStats] = useState<SimResults | null>(null);
  const [lastSpin, setLastSpin] = useState<string[][] | null>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const activeModel = MODELS[selectedModel];
  const theo: TheoreticalProfile | undefined = activeModel.theoretical;

  useEffect(() => {
    workerRef.current = new SimWorker();
    workerRef.current.onmessage = (e) => {
      const { type, progress, results } = e.data;
      if (type === 'PROGRESS') setSimConfig((prev) => ({ ...prev, progress }));
      if (type === 'DONE') {
        setStats(results);
        setSimConfig((prev) => ({ ...prev, status: 'DONE', progress: 100 }));
      }
    };
    return () => workerRef.current?.terminate();
  }, []); 

  const runSimulation = (iterations: number) => {
    setSimConfig({ status: 'RUNNING', progress: 0, target: iterations });
    setStats(null);
    workerRef.current?.postMessage({ model: activeModel, iterations });
  };

  const spinOnce = () => {
    const machine = new SlotMachine(activeModel);
    const result = machine.spin();
    setLastSpin(result.grid);
  };

  const exportResults = () => {
    if (!stats) return;
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify({ model: activeModel.name, date: new Date().toISOString(), stats }, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${activeModel.name.replace(/\s+/g, '_')}_${simConfig.target}_spins.json`;
    link.click();
  };

  return (
    <div className="dashboard-container">
      
      <header className="header-bar">
        <div className="brand">
          <h1>MATH_ENGINE_v2.718281</h1>
          <div className="brand-subtitle">EVOLUTION GAMING </div>
        </div>
        
        <div className="controls-area">
           <div className="pill-group">
             {(['LOW', 'HIGH'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setSelectedModel(m); setStats(null); setLastSpin(null); }}
                  disabled={simConfig.status === 'RUNNING'}
                  className={`pill-btn ${selectedModel === m ? 'active' : ''}`}
                >
                  {m}_VOL
                </button>
             ))}
           </div>

           <button onClick={spinOnce} disabled={simConfig.status === 'RUNNING'} className="pill-btn active">
              DEBUG SPIN
           </button>
           
           <div className="pill-group">
             <button onClick={() => runSimulation(1_000_000)} disabled={simConfig.status === 'RUNNING'} className="pill-btn">1M SIM</button>
             <button onClick={() => runSimulation(10_000_000)} disabled={simConfig.status === 'RUNNING'} className="pill-btn">10M SIM</button>
             <button onClick={() => runSimulation(50_000_000)} disabled={simConfig.status === 'RUNNING'} className="pill-btn">50M SIM</button>
           </div>

            {simConfig.status === 'RUNNING' ? (
                <button disabled className="action-btn">
                    {`RUNNING ${(simConfig.progress).toFixed(0)}%`}
                </button>
            ) : (
                <button onClick={exportResults} disabled={!stats} className="action-btn">
                    {stats ? 'EXPORT JSON' : 'READY'}
                </button>
            )}
        </div>
      </header>

      <div className="main-grid">
        
        <div className="sidebar space-y-4">
          <div className="panel">
            <div className="panel-header">Active Configuration</div>
            <div className="panel-body">
              <ul className="config-list">
                <li className="config-item">
                  <span>Profile ID</span>
                  <span className="config-val">{activeModel.name}</span>
                </li>
                <li className="config-item">
                  <span>Volatility</span>
                  <span className="config-val">{activeModel.volatility}</span>
                </li>
                 <li className="config-item">
                  <span>Target RTP</span>
                  <span className="config-val">{(activeModel.rtpTarget * 100).toFixed(1)}%</span>
                </li>
                <li className="config-item">
                  <span>Max exposure</span>
                  <span className="config-val">{theo?.risk?.maxExposure || '---'}</span>
                </li>
              </ul>
              {theo && (
                <div style={{marginTop: 15, fontSize: '0.75rem', color: '#8b949e', fontStyle: 'italic', lineHeight: '1.4'}}>
                   {theo.explanation}
                </div>
              )}
            </div>
          </div>

          {lastSpin && (
            <div className="panel">
              <div className="panel-header">Visual Debugger</div>
              <div className="panel-body">
                <div className="reel-viewport">
                  {lastSpin[0].map((_, colIndex) => (
                    <div key={colIndex} className="reel-col">
                      {lastSpin.map((row, rowIndex) => (
                        <div key={rowIndex} className={`symbol-cell ${['S', 'W'].includes(row[colIndex]) ? 'special' : ''}`}>
                          {row[colIndex]}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="results-area">
          <div className="metrics-grid">
              <MetricCard 
                label="Total RTP" 
                value={stats ? `${(stats.totalRtp * 100).toFixed(2)}%` : '---'} 
                sub={`Target: ${(activeModel.rtpTarget * 100).toFixed(2)}%`}
                valClass={stats && Math.abs(stats.totalRtp - activeModel.rtpTarget) < 0.005 ? 'val-green' : ''}
              />
              <MetricCard 
                label="Standard deviation" 
                value={stats ? stats.stdDev.toFixed(2) : '---'} 
                sub={theo ? `Theory: ${theo.risk.volatilitySd}` : 'Theory: ---'}
              />
              <MetricCard 
                label="Simulation depth" 
                value={simConfig.target > 0 ? (simConfig.target / 1000000).toFixed(1) + 'M' : '0'} 
                sub="Total spins"
              />
               <MetricCard 
                label="Confidence (95%)" 
                value={stats ? `±${stats.volatilityIndex.toFixed(2)}` : '---'} 
                sub="Margin of error"
              />
          </div>

          <div className="panel">
            <div className="panel-header">Distribution analysis: Theoretical vs actual</div>
            <div className="data-table-wrapper">
              <table className="data-table">
                  <thead>
                  <tr>
                    <th>Source of funds</th>
                    <th style={{textAlign:'right'}}>Hit rate (Theory / sim)</th>
                    <th style={{textAlign:'right'}}>Avg payout (Theory / sim)</th>
                    <th style={{textAlign:'right'}}>RTP contribution</th>
                  </tr>
                </thead>
                <tbody>
                    <Row 
                      label="BG: Win lines" 
                      theory={theo?.stats.baseGame.winLines} 
                      sim={stats?.baseGame.winLines} 
                    />
                    <Row 
                      label="BG: Feature #1" 
                      theory={theo?.stats.baseGame.feature1} 
                      sim={stats?.baseGame.feature1} 
                      highlight 
                    />
                    <Row 
                      label="Trigger (Bonus)" 
                      theory={theo?.stats.baseGame.trigger} 
                      sim={stats?.baseGame.freeSpinsTrigger} 
                    />

                    <tr className="row-group-header">
                      <td colSpan={4}>-- BONUS MODE ({activeModel.freeSpins.awardAmount} spins) --</td>
                    </tr>
                    
                    <Row 
                      label="FS: Win lines" 
                      theory={theo?.stats.freeSpins.winLines} 
                      sim={stats?.freeSpins.winLines}
                      isInternal
                    />
                     <Row 
                      label="FS: Feature #1" 
                      theory={theo?.stats.freeSpins.feature1} 
                      sim={stats?.freeSpins.feature1}
                      isInternal
                    />
                </tbody>
                <tfoot>
                    <tr className="tfoot-row">
                      <td className="table-label">TOTAL AGGREGATE</td>
                      <td style={{textAlign:'right'}}>-</td>
                      <td style={{textAlign:'right'}}>-</td>
                      <td style={{textAlign:'right', color: stats ? '#3fb950' : '#8b949e'}}>
                        {stats ? (stats.totalRtp * 100).toFixed(2) + '%' : 'PENDING'}
                      </td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <a 
          href="https://github.com/victorrobotxt/evolution-demo" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <svg className="github-icon" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          github.com/victorrobotxt/evolution-demo
        </a>
      </footer>

    </div>
  );
}

const MetricCard = ({ label, value, sub, valClass }: any) => (
  <div className="metric-card">
    <div className="metric-label">{label}</div>
    <div className={`metric-value ${valClass || ''}`}>{value}</div>
    <div className="metric-sub">{sub}</div>
  </div>
);

const fmtHit = (h: number) => h > 0 ? `1 in ${h.toFixed(2)}` : '-';
const fmtPay = (p: number) => p > 0 ? `${p.toFixed(2)}x` : '-';
const fmtRtp = (r: number) => r > 0 ? `${(r * 100).toFixed(2)}%` : '-';

const Row = ({ label, theory, sim, highlight, isInternal }: any) => {
  return (
    <tr className={highlight ? 'row-highlight' : ''}>
      <td className="table-label">{label}</td>
      
      <td style={{textAlign:'right'}}>
         <span className="val-muted">{theory?.hitRate || '-'}</span>
         {sim && <span className="val-sim"> / {fmtHit(sim.hitRate)}</span>}
      </td>

      <td style={{textAlign:'right'}}>
         <span className="val-muted">{theory?.avgPayout || '-'}</span>
         {sim && <span className="val-sim"> / {fmtPay(sim.avgPayout)}</span>}
      </td>

      <td style={{textAlign:'right', color: isInternal ? '#8b949e' : '#58a6ff'}}>
         <span className="val-muted">{theory?.rtp || '-'}</span>
         {sim && !isInternal && <span className="val-sim"> / {fmtRtp(sim.rtp)}</span>}
      </td>
    </tr>
  );
};

export default App;
