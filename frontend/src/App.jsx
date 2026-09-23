import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, GitFork, Calendar, BookOpen, Trophy, QrCode, Target } from 'lucide-react';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
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

  // Fetch all tournament data
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch status
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const s = await statusRes.json();
        setTournamentStatus(s);
        if (s.status !== 'registration' && activeTab === 'register' && !localStorage.getItem('tab_chosen')) {
          setActiveTab('bracket');
        }
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
      {/* Top Navigation */}
      <Navbar 
        tournamentStatus={tournamentStatus} 
        isAdmin={isAdmin}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Messi & Ronaldo eFootball Hero Showcase */}
      <HeroBanner 
        tournamentStatus={tournamentStatus}
        playersCount={players.length}
        onOpenPrizes={() => setShowPrizesModal(true)}
      />

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

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <UserPlus size={16} />
          <span>Register ({players.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => { setActiveTab('payment'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <QrCode size={16} />
          <span>Pay Fee (₹100) • {tournamentStatus?.verified_count || 0}/32</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bracket'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <GitFork size={16} />
          <span>Knockout Bracket</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'fixtures' ? 'active' : ''}`}
          onClick={() => { setActiveTab('fixtures'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <Calendar size={16} />
          <span>Fixtures & Results</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'scorers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('scorers'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <Target size={16} />
          <span>Top Scorers ⚽ (₹200)</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => { setActiveTab('rules'); localStorage.setItem('tab_chosen', 'true'); }}
        >
          <BookOpen size={16} />
          <span>14-Min Match Rules</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === 'register' && (
          <RegistrationTab 
            tournamentStatus={tournamentStatus}
            players={players}
            onPlayerRegistered={fetchData}
            onSwitchToPayment={() => { setActiveTab('payment'); localStorage.setItem('tab_chosen', 'true'); }}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentTab 
            tournamentStatus={tournamentStatus}
            players={players}
            onPaymentSubmitted={fetchData}
            onSwitchToRegister={() => { setActiveTab('register'); localStorage.setItem('tab_chosen', 'true'); }}
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
