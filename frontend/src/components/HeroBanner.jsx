import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Flame, Calendar, IndianRupee, Sparkles, Timer, PhoneCall } from 'lucide-react';

export default function HeroBanner({ tournamentStatus, playersCount, onOpenPrizes, onNavigate }) {
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
          <img 
            src="/efootball_logo.jpg" 
            alt="eFootball" 
            style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'invert(1)' }} 
          />
          <span>Pantihal eFootball Dream Team Cup</span>
        </div>

        <div className="hero-title-wrapper">
          <img 
            src="/efootball_logo.jpg" 
            alt="eFootball Logo" 
            className="hero-heading-logo left" 
          />
          <h1 className="hero-title-main">
            Pantihal eFootball Cup
          </h1>
          <img 
            src="/efootball_logo.jpg" 
            alt="eFootball Logo" 
            className="hero-heading-logo right" 
          />
        </div>

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

        {/* Quick Action Buttons for Home View */}
        {onNavigate && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.92rem' }}
              >
                <span>Register Now</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('payment')}
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontSize: '0.92rem', borderColor: 'rgba(229,185,76,0.4)', color: 'var(--accent-gold)' }}
              >
                <span>Pay Entry Fee (₹100)</span>
              </button>
            </div>

            {/* Organizer Helpline Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-gold)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PhoneCall size={12} /> Helpline:
              </span>
              <a href="tel:7076962130" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title="Call Sukamal Malick">
                <img src="/sukamal.png" alt="Sukamal" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                <span>Sukamal: <strong>7076962130</strong></span>
              </a>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <a href="tel:8348082759" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title="Call Soumojit Nandi">
                <img src="/soumojit.jpg" alt="Soumojit" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                <span>Soumojit: <strong>8348082759</strong></span>
              </a>
            </div>
          </div>
        )}
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
