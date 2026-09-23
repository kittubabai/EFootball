import React from 'react';
import { Trophy, ShieldCheck, Lock, Users, Clock } from 'lucide-react';

export default function Navbar({ tournamentStatus, isAdmin, onOpenAdmin }) {
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

        <div className="badge badge-pending" title="Registered Players">
          <Users size={14} />
          <span>{tournamentStatus?.registered_count || 0} / {tournamentStatus?.max_players || 32}</span>
        </div>

        <div className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#a0b3cf' }}>
          <Clock size={14} />
          <span>{tournamentStatus?.match_time_mins || 7} Mins Match</span>
        </div>

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
