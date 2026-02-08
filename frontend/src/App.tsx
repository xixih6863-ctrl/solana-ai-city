import React, { useState, useEffect } from 'react';

// Simple game demo - no external dependencies
export default function App() {
  const [gold, setGold] = useState(1000);
  const [energy, setEnergy] = useState(100);
  const [population, setPopulation] = useState(50);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [buildings, setBuildings] = useState([
    { id: 1, name: '🏠 House', level: 1, cost: 100 },
    { id: 2, name: '⚡ Power Plant', level: 1, cost: 200 },
    { id: 3, name: '💰 Shop', level: 1, cost: 150 },
  ]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('build');

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev.slice(0, 4)]);
  };

  const build = (building: typeof buildings[0]) => {
    if (gold >= building.cost) {
      setGold(g => g - building.cost);
      addNotification(`Built ${building.name}!`);
    } else {
      addNotification('Not enough gold!');
    }
  };

  const collectResources = () => {
    const goldGain = population * 2;
    const energyGain = 10;
    setGold(g => g + goldGain);
    setEnergy(e => Math.min(100, e + energyGain);
    setXp(x => {
      const newXp = x + 25;
      if (newXp >= level * 100) {
        setLevel(l => l + 1);
        addNotification(`🎉 Level Up! Now level ${level + 1}`);
      }
      return newXp;
    });
    addNotification(`+${goldGain} gold, +${energyGain} energy`);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          🏙️ Solana AI City
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '10px 0 0' }}>
          v1.0.6 - Web3 City Building Game
        </p>
      </header>

      {/* Stats Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {[
          { icon: '💰', label: 'Gold', value: gold, color: '#fbbf24' },
          { icon: '⚡', label: 'Energy', value: `${energy}%`, color: '#34d399' },
          { icon: '👥', label: 'Population', value: population, color: '#60a5fa' },
          { icon: '⭐', label: 'Level', value: level, color: '#a78bfa' },
          { icon: '📊', label: 'XP', value: `${xp}/${level * 100}`, color: '#f472b6' },
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px' }}>{stat.icon}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px',
        height: '8px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${Math.min(100, (xp / (level * 100)) * 100)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
          transition: 'width 0.3s'
        }} />
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', gap: '20px' }}>
        
        {/* Left Panel - Buildings */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '18px' }}>🏗️ Buildings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {buildings.map(b => (
              <button
                key={b.id}
                onClick={() => build(b)}
                style={{
                  background: gold >= b.cost ? 'linear-gradient(135deg, #00d18b, #00b359)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px',
                  color: 'white',
                  cursor: gold >= b.cost ? 'pointer' : 'not-allowed',
                  opacity: gold >= b.cost ? 1 : 0.5,
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '18px' }}>{b.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Level {b.level} • 💰 {b.cost}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Game Area */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '20px',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['build', 'quests', 'shop', 'social'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'build' && '🏗️'}
                {tab === 'quests' && '📋'}
                {tab === 'shop' && '🛒'}
                {tab === 'social' && '👥'}
                {' '}{tab}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={collectResources}
              style={{
                background: 'linear-gradient(135deg, #9945ff, #00d4ff)',
                border: 'none',
                borderRadius: '20px',
                padding: '30px 60px',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(153, 69, 255, 0.3)'
              }}
            >
              🎮 Collect Resources
            </button>
          </div>

          {/* City Preview */}
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 10px' }}>🏙️ Your City</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '5px',
              fontSize: '24px'
            }}>
              {Array(25).fill(0).map((_, i) => (
                <div key={i} style={{ 
                  aspectRatio: '1',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {i === 7 ? '🏠' : i === 12 ? '⚡' : i === 17 ? '🏭' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Info */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '18px' }}>📊 Stats</h3>
          
          {/* Daily Reward */}
          <div style={{ 
            background: 'linear-gradient(135deg, #00d18b, #00b359)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>🎁 Daily Bonus</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>💰 500 Gold</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Claim in 23:59:59</div>
          </div>

          {/* Notifications */}
          <h4 style={{ margin: '0 0 10px' }}>🔔 Notifications</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                No notifications yet...
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} style={{ 
                  fontSize: '12px', 
                  padding: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '6px'
                }}>
                  {n}
                </div>
              ))
            )}
          </div>

          {/* Leaderboard Preview */}
          <h4 style={{ margin: '20px 0 10px' }}>🏆 Top Players</h4>
          {[
            { name: 'CryptoKing', level: 42 },
            { name: 'SolanaBuilder', level: 38 },
            { name: 'Web3Gamer', level: 25 },
          ].map((p, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span>{i + 1}. {p.name}</span>
              <span style={{ color: '#fbbf24' }}>Lv.{p.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px',
        marginTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px'
      }}>
        <p>🏙️ Solana AI City v1.0.6 | Built with React + Solana Web3.js</p>
        <p>⭐ Star on GitHub | 💝 Support on GitHub Sponsors</p>
      </footer>
    </div>
  );
}
