import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Flame, Calendar, IndianRupee, Sparkles, Timer } from 'lucide-react';

export default function HeroBanner({ tournamentStatus, playersCount, onOpenPrizes }) {
  const registeredCount = tournamentStatus?.registered_count || playersCount || 0;
  const verifiedCount = tournamentStatus?.verified_count || 0;
  const maxPlayers = tournamentStatus?.max_players || 32;

  // Countdown to 18th October 2026, 11:00 AM IST
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-18T11:00:00+05:30').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <Flame size={14} color="var(--accent-gold)" />
          <span>Pantihal eFootball Dream Team Cup</span>
        </div>

        <h1 className="hero-title-main">
          Pantihal eFootball Cup
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '4px 0 8px' }}>
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

        {/* Live Kickoff Countdown */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          padding: '5px 16px',
          margin: '2px auto 10px',
          fontSize: '0.82rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
        }}>
          <Timer size={14} color="var(--accent-gold)" />
          <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Kickoff Countdown:</span>
          <strong style={{ color: '#fff', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </strong>
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

          <button 
            type="button"
            onClick={onOpenPrizes}
            className="hero-stat-pill prize-pool-btn prizes-btn-highlight" 
            title="Click to view tournament prize pool distribution"
            style={{ 
              borderColor: 'rgba(255, 190, 11, 0.75)', 
              background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.22), rgba(255, 190, 11, 0.06))',
              cursor: 'pointer',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 16px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              fontSize: '0.88rem'
            }}
          >
            <Sparkles size={15} className="star-blink-icon" />
            <Trophy size={14} color="#ffbe0b" />
            <span style={{ color: '#ffbe0b', fontWeight: '800', letterSpacing: '0.02em' }}>Prizes</span>
            <Sparkles size={13} className="star-blink-icon" style={{ animationDelay: '0.6s' }} />
          </button>
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
