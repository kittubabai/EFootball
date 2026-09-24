import React from 'react';
import { Trophy, ShieldCheck, Lock, Users, Clock, Menu } from 'lucide-react';

export default function Navbar({ tournamentStatus, isAdmin, onOpenAdmin, onToggleSidebar }) {
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
        {/* Mobile Sidebar Toggle Button */}
        <button 
          type="button" 
          onClick={onToggleSidebar} 
          className="mobile-sidebar-toggle"
          title="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="brand-logo-badge" title="eFootball Mobile Official Cup">
          <img 
            src="/efootball_logo.jpg" 
            alt="eFootball Logo" 
            className="brand-logo-img"
          />
        </div>
        <div>
          <div className="brand-sub">eFootball™ Mobile 2026</div>
          <h1 className="brand-title">{tournamentStatus?.title || 'Pantihal eFootball Cup'}</h1>
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
