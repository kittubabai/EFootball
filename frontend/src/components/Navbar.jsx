import React from 'react';
import { Trophy, ShieldCheck, Lock, Users, Clock, Sun, Moon } from 'lucide-react';

export default function Navbar({ tournamentStatus, isAdmin, onOpenAdmin, theme, onToggleTheme }) {
  const getStatusBadge = () => {
    switch (tournamentStatus?.status) {
      case 'in_progress':
        return (
          <span className="badge badge-live">
            <span className="pulse-dot"></span> TOURNAMENT LIVE
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-completed">
            <Trophy size={14} /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            <span className="pulse-dot"></span> REGISTRATION OPEN
          </span>
        );
    }
  };

  return (
    <header className="header">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <Trophy size={26} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-sub">eFootball Mobile 2026</div>
          <h1 className="brand-title">{tournamentStatus?.title || '32-Player Knockout Cup'}</h1>
        </div>
      </div>

      <div className="header-actions">
        {getStatusBadge()}

        <div className="badge badge-pending" title="Confirmed Paid Players vs Total Registered">
          <Users size={14} />
          <span>{tournamentStatus?.verified_count || 0}/32 Paid ({tournamentStatus?.registered_count || 0} Registered)</span>
        </div>

        <div className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
          <Clock size={14} />
          <span>{tournamentStatus?.match_time_mins || 14} Mins Match (7m/half)</span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button 
          className="btn btn-outline" 
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          style={{ 
            padding: '6px 12px', 
            fontSize: '0.8rem', 
            gap: '6px',
            borderColor: 'var(--border-color)',
            background: 'rgba(255, 255, 255, 0.05)'
          }}
        >
          {theme === 'light' ? <Moon size={15} color="#0284c7" /> : <Sun size={15} color="#ffbe0b" />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <button 
          className={`btn btn-admin ${isAdmin ? 'logged-in' : ''}`}
          onClick={onOpenAdmin}
          title={isAdmin ? "Admin Panel (Active)" : "Organizer Login"}
        >
          {isAdmin ? <ShieldCheck size={16} /> : <Lock size={15} />}
          <span>{isAdmin ? 'Admin Active' : 'Admin Login'}</span>
        </button>
      </div>
    </header>
  );
}
