import React from 'react';
import { Trophy, Clock, Users, Flame, Calendar, IndianRupee } from 'lucide-react';

export default function HeroBanner({ tournamentStatus, playersCount }) {
  const registeredCount = tournamentStatus?.registered_count || playersCount || 0;
  const verifiedCount = tournamentStatus?.verified_count || 0;
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
          <span>Pantihal eFootball Dream Team Cup</span>
        </div>

        <h1 className="hero-title-main">
          Pantihal eFootball Cup
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '4px 0 10px' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={15} /> 18th October 2026
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={15} /> 11:00 AM Onwards
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--accent-gold)', fontWeight: '800', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <IndianRupee size={14} /> 100 Entry Fee
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '520px', margin: '0 auto' }}>
          4 Custom Rooms (8+8+8+8) • 14-Min Matches (7m/half) • Final 4 Championship (1st, 2nd, 3rd Place)
        </p>

        <div className="hero-stats-row">
          <div className="hero-stat-pill">
            <Users size={14} color="#00e5ff" />
            <span>Slots: <strong>{verifiedCount} / 32 Paid</strong> ({registeredCount} Registered)</span>
          </div>

          <div className="hero-stat-pill">
            <Clock size={14} color="#00ff87" />
            <span>Match Time: <strong>14 Mins (7m/half)</strong></span>
          </div>

          <div className="hero-stat-pill" style={{ borderColor: 'rgba(0, 255, 135, 0.35)' }}>
            <span style={{ color: '#00ff87', fontWeight: '700' }}>🟢 Form: <strong>Excellent Only</strong></span>
          </div>

          <div className="hero-stat-pill">
            <Trophy size={14} color="#ffbe0b" />
            <span>Format: <strong>4 Groups &gt; Final 4</strong></span>
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
