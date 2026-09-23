import React, { useState } from 'react';
import { UserCheck, Shield, Phone, Sparkles, AlertCircle, CheckCircle2, Search, Info } from 'lucide-react';

export default function RegistrationTab({ tournamentStatus, players, onPlayerRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    efootball_id: '',
    whatsapp: '',
    team_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const registeredCount = tournamentStatus?.registered_count || players.length;
  const maxPlayers = tournamentStatus?.max_players || 32;
  const isRegistrationClosed = tournamentStatus?.status !== 'registration' || registeredCount >= maxPlayers;
  const percentage = Math.min(100, Math.round((registeredCount / maxPlayers) * 100));

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.efootball_id.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Please fill in your Player Name, eFootball ID, and WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/players/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to register player.');
      }

      setSuccessMsg(`Welcome, ${data.name}! You are registered for the Knockout Cup.`);
      setFormData({ name: '', efootball_id: '', whatsapp: '', team_name: '' });
      if (onPlayerRegistered) onPlayerRegistered();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.efootball_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.team_name && p.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="registration-layout">
      {/* Left Column: Form & Registration Rules */}
      <div>
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck className="glow-text-green" size={22} />
              Player Registration
            </h2>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-green)' }}>
              {registeredCount} / {maxPlayers} Slots
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
            <div 
              style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, #00ff87, #00e5ff)',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {isRegistrationClosed ? (
            <div className="alert alert-info">
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Registration is currently closed.</strong><br />
                {registeredCount >= maxPlayers 
                  ? 'All 32 slots have been filled! Check the Bracket tab for matchups.' 
                  : 'The tournament has already started. Check the Bracket tab for live results.'}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">In-Game Name (IGN) or Nickname *</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. ApexStriker"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  eFootball Owner/User ID *
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginLeft: '6px' }}>
                    (Needed for Match Room Invites)
                  </span>
                </label>
                <input 
                  type="text"
                  name="efootball_id"
                  value={formData.efootball_id}
                  onChange={handleChange}
                  placeholder="e.g. 738-921-004 or 123456789"
                  className="form-input"
                  required
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Find in eFootball: Extras &gt; User Information &gt; Owner Information &gt; Owner ID.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Contact Number *</label>
                <input 
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="form-input"
                  required
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Used strictly by organizers to coordinate match timings.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dream Team Name / Crest (Optional)</label>
                <input 
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleChange}
                  placeholder="e.g. Real Madrid / Custom DT"
                  className="form-input"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                <Sparkles size={18} />
                <span>{loading ? 'Submitting Registration...' : 'Confirm Registration'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Registered Contenders */}
      <div>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield className="glow-text-cyan" size={20} />
              Registered Contenders ({players.length})
            </h2>
          </div>

          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by player or eFootball ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.88rem' }}
            />
          </div>

          <div className="registered-players-list">
            {filteredPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
                {players.length === 0 ? 'No players registered yet. Be the first to join!' : 'No matching players found.'}
              </div>
            ) : (
              filteredPlayers.map((player, index) => (
                <div key={player.id} className="player-item-card">
                  <div className="player-info">
                    <div className="player-num">#{index + 1}</div>
                    <div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-team">{player.team_name || 'Dream Team'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="player-id-badge">{player.efootball_id}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
