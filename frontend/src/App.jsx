import React, { useState, useEffect, useCallback } from 'react';
import { Home, UserPlus, GitFork, Calendar, BookOpen, Trophy, QrCode, Target, PhoneCall, Phone, MessageSquare } from 'lucide-react';

import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import RegistrationTab from './components/RegistrationTab';
import PaymentTab from './components/PaymentTab';
import BracketTab from './components/BracketTab';
import FixturesTab from './components/FixturesTab';
import TopScorersTab from './components/TopScorersTab';
import RulesTab from './components/RulesTab';
import AdminModal from './components/AdminModal';
import ScoreModal from './components/ScoreModal';
import PrizesModal from './components/PrizesModal';

// Differentiate Page Reload vs Fresh Visit
const getInitialTab = () => {
  try {
    let isReload = false;
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      isReload = navEntries[0].type === 'reload';
    } else if (window.performance && window.performance.navigation) {
      isReload = window.performance.navigation.type === 1; // 1 = TYPE_RELOAD
    }

    // On browser Reload/Refresh (F5/Ctrl+R/swipe), keep user on the exact same tab
    if (isReload) {
      const savedTab = sessionStorage.getItem('ef_active_tab');
      if (savedTab) return savedTab;
    }
  } catch (err) {
    console.warn('Navigation check failed:', err);
  }

  // On fresh visit / newly opened website, always start on Tournament Overview
  try {
    sessionStorage.setItem('ef_active_tab', 'home');
  } catch (e) {}
  return 'home';
};

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [tournamentStatus, setTournamentStatus] = useState(null);
  const [players, setPlayers] = useState([]);
  const [bracketData, setBracketData] = useState({ 
    tournament_status: 'registration', 
    groups: {}, 
    finals: { semi_finals: [], third_place: null, grand_final: null, podium: {} } 
  });
  const [matches, setMatches] = useState([]);
  
  // Admin auth state
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('ef_admin_logged') === 'true');
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('ef_admin_pin') || '');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [activeScoreMatch, setActiveScoreMatch] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clean legacy localStorage keys
  useEffect(() => {
    localStorage.removeItem('tab_chosen_id');
    localStorage.removeItem('tab_chosen');
  }, []);

  const navItems = [
    { id: 'home', label: 'Tournament Overview', icon: Home },
    { id: 'register', label: `Register (${players.length})`, icon: UserPlus },
    { id: 'payment', label: `Pay Fee (₹100) • ${tournamentStatus?.verified_count || 0}/32`, icon: QrCode },
    { id: 'bracket', label: 'Knockout Bracket', icon: GitFork },
    { id: 'fixtures', label: 'Fixtures & Results', icon: Calendar },
    { id: 'scorers', label: 'Top Scorers ⚽ (₹200)', icon: Target },
    { id: 'rules', label: '14-Min Match Rules', icon: BookOpen }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    try {
      sessionStorage.setItem('ef_active_tab', tabId);
    } catch (e) {}
    setIsSidebarOpen(false); // Auto close sidebar on mobile when tab is tapped
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch status
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const s = await statusRes.json();
        setTournamentStatus(s);
      }

      // 2. Fetch players
      const playersRes = await fetch('/api/players');
      if (playersRes.ok) {
        const p = await playersRes.json();
        setPlayers(p);
      }

      // 3. Fetch bracket
      const bracketRes = await fetch('/api/bracket');
      if (bracketRes.ok) {
        const b = await bracketRes.json();
        setBracketData(b);
      }

      // 4. Fetch matches
      const matchesRes = await fetch('/api/matches');
      if (matchesRes.ok) {
        const m = await matchesRes.json();
        setMatches(m);
      }
    } catch (err) {
      console.error('Error fetching tournament data:', err);
    }
  }, [activeTab]);

  // Initial fetch and auto-polling every 10s for real-time live match updates
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAdminLoginSuccess = (pin) => {
    setIsAdmin(true);
    setAdminPin(pin);
    localStorage.setItem('ef_admin_logged', 'true');
    localStorage.setItem('ef_admin_pin', pin);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPin('');
    localStorage.removeItem('ef_admin_logged');
    localStorage.removeItem('ef_admin_pin');
  };

  // Find if tournament is completed and who is the champion
  const champion = bracketData?.finals?.podium?.first || null;

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar 
        tournamentStatus={tournamentStatus} 
        isAdmin={isAdmin}
        onOpenAdmin={() => setShowAdminModal(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Two-Column Layout (Left Navigation Sidebar + Content Area) */}
      <div className="layout-with-sidebar">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="sidebar-backdrop" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Navigation Sidebar */}
        <aside className={`left-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src="/efootball_logo.jpg" 
                alt="eFootball" 
                style={{ width: '20px', height: '20px', objectFit: 'contain', filter: 'invert(1)' }} 
              />
              <span className="sidebar-title">eFootball Cup</span>
            </div>
            <button 
              type="button" 
              className="sidebar-close-btn" 
              onClick={() => setIsSidebarOpen(false)}
              title="Close Navigation"
            >
              ✕
            </button>
          </div>

          <nav className="sidebar-nav-list">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <Icon size={18} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>
                  {isActive && <div className="active-indicator" />}
                </button>
              );
            })}
          </nav>

          {/* Organizer Help & Support Section */}
          <div className="sidebar-contacts-card">
            <div className="sidebar-contacts-header">
              <PhoneCall size={13} />
              <span>Organizer Contacts</span>
            </div>

            <div className="sidebar-contact-item">
              <div className="sidebar-contact-info">
                <img 
                  src="/sukamal.png" 
                  alt="Sukamal Malick" 
                  className="sidebar-contact-avatar"
                />
                <div>
                  <div className="sidebar-contact-name">Sukamal Malick</div>
                  <div className="sidebar-contact-role">Organizer</div>
                </div>
              </div>
              <a href="tel:7076962130" className="sidebar-contact-btn call" title="Call Sukamal Malick">
                <Phone size={12} /> 7076962130
              </a>
            </div>

            <div className="sidebar-contact-item">
              <div className="sidebar-contact-info">
                <img 
                  src="/soumojit.jpg" 
                  alt="Soumojit Nandi" 
                  className="sidebar-contact-avatar"
                />
                <div>
                  <div className="sidebar-contact-name">Soumojit Nandi</div>
                  <div className="sidebar-contact-role">Organizer</div>
                </div>
              </div>
              <a href="tel:8348082759" className="sidebar-contact-btn call" title="Call Soumojit Nandi">
                <Phone size={12} /> 8348082759
              </a>
            </div>
          </div>
        </aside>

        {/* Right Main Body Content */}
        <div className="main-content-column">
          {/* Champion Banner if finished */}
          {champion && (
            <div className="glass-card" style={{ 
              marginBottom: '24px', 
              background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.15), rgba(0, 255, 135, 0.15))', 
              borderColor: 'rgba(255, 190, 11, 0.4)',
              textAlign: 'center',
              padding: '24px'
            }}>
              <Trophy size={42} color="#ffbe0b" style={{ display: 'inline-block', marginBottom: '8px' }} />
              <h2 style={{ fontSize: '1.6rem', color: '#ffbe0b', fontWeight: '900' }}>
                🎉 TOURNAMENT CHAMPION: {champion.name} 🎉
              </h2>
              <div style={{ color: 'var(--text-main)', marginTop: '4px', fontSize: '1.05rem' }}>
                Team: <strong>{champion.team_name || 'Dream Team'}</strong> • eFootball ID: <code>{champion.efootball_id}</code>
              </div>
            </div>
          )}

          {/* Tab Views */}
          <main style={{ flexGrow: 1 }}>
            {activeTab === 'home' && (
              <div>
                <HeroBanner 
                  tournamentStatus={tournamentStatus}
                  playersCount={players.length}
                  onOpenPrizes={() => setShowPrizesModal(true)}
                  onNavigate={handleTabChange}
                />
              </div>
            )}

            {activeTab === 'register' && (
              <RegistrationTab 
                tournamentStatus={tournamentStatus}
                players={players}
                onPlayerRegistered={fetchData}
                onSwitchToPayment={() => handleTabChange('payment')}
              />
            )}

            {activeTab === 'payment' && (
              <PaymentTab 
                tournamentStatus={tournamentStatus}
                players={players}
                onPaymentSubmitted={fetchData}
                onSwitchToRegister={() => handleTabChange('register')}
              />
            )}

            {activeTab === 'bracket' && (
              <BracketTab 
                bracketData={bracketData}
                isAdmin={isAdmin}
                onOpenScoreModal={(match) => setActiveScoreMatch(match)}
              />
            )}

            {activeTab === 'fixtures' && (
              <FixturesTab 
                matches={matches}
                isAdmin={isAdmin}
                onOpenScoreModal={(match) => setActiveScoreMatch(match)}
              />
            )}

            {activeTab === 'scorers' && (
              <TopScorersTab 
                isAdmin={isAdmin}
                adminPin={adminPin}
                onScoreUpdated={fetchData}
              />
            )}

            {activeTab === 'rules' && (
              <RulesTab />
            )}
          </main>
        </div>
      </div>

      {/* Admin Management Modal */}
      <AdminModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        isAdmin={isAdmin}
        adminPin={adminPin}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
        tournamentStatus={tournamentStatus}
        players={players}
        bracketData={bracketData}
        onRefresh={fetchData}
      />

      {/* Match Score Record Modal */}
      {activeScoreMatch && (
        <ScoreModal 
          match={activeScoreMatch}
          adminPin={adminPin}
          onClose={() => setActiveScoreMatch(null)}
          onScoreUpdated={fetchData}
        />
      )}

      {/* Official Prize Money Distribution Modal */}
      <PrizesModal 
        isOpen={showPrizesModal}
        onClose={() => setShowPrizesModal(false)}
      />
    </div>
  );
}
