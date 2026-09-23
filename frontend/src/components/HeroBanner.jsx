import React from 'react';
import { Trophy, Clock, Users, Flame, Sparkles } from 'lucide-react';

export default function HeroBanner({ tournamentStatus, playersCount }) {
  const registeredCount = tournamentStatus?.registered_count || playersCount || 0;
  const maxPlayers = tournamentStatus?.max_players || 32;

  return (
    <div className="legends-hero-banner">
      {/* Left: Messi Feature Card */}
      <div className="legend-showcase-card messi" title="Lionel Messi - eFootball Global Ambassador">
        <img 
          src="/messi_efootball.jpg" 
          alt="Lionel Messi eFootball" 
          className="legend-img"
          loading="eager"
        />
        <div className="legend-overlay">
          <div className="legend-tag glow-text-cyan">Ambassador #10</div>
          <div className="legend-name" style={{ color: '#fff' }}>Lionel Messi</div>
        </div>
      </div>

      {/* Center: Tournament Information */}
      <div className="hero-center-content">
        <div className="hero-badge-pill">
          <Flame size={14} color="#00ff87" />
          <span>Official Dream Team Championship</span>
        </div>

        <h1 className="hero-title-main">
          Jadupur eFootball Cup
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto' }}>
          32 Contenders • 7-Minute Knockout Matches • Winner Advances to Glory
        </p>

        <div className="hero-stats-row">
          <div className="hero-stat-pill">
            <Users size={14} color="#00e5ff" />
            <span>Slots: <strong>{registeredCount} / {maxPlayers}</strong></span>
          </div>

          <div className="hero-stat-pill">
            <Clock size={14} color="#00ff87" />
            <span>Time: <strong>7 Mins</strong></span>
          </div>

          <div className="hero-stat-pill">
            <Trophy size={14} color="#ffbe0b" />
            <span>Mode: <strong>Dream Team</strong></span>
          </div>
        </div>
      </div>

      {/* Right: Ronaldo Feature Card */}
      <div className="legend-showcase-card ronaldo" title="Cristiano Ronaldo - eFootball Icon">
        <img 
          src="/ronaldo_pes.jpg" 
          alt="Cristiano Ronaldo eFootball" 
          className="legend-img"
          loading="eager"
        />
        <div className="legend-overlay">
          <div className="legend-tag" style={{ color: '#ffbe0b' }}>Legendary #7</div>
          <div className="legend-name" style={{ color: '#fff' }}>C. Ronaldo</div>
        </div>
      </div>
    </div>
  );
}
