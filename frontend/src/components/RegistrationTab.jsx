import React, { useState } from 'react';
import { UserCheck, Shield, Sparkles, AlertCircle, CheckCircle2, Search, Info } from 'lucide-react';

export default function RegistrationTab({ tournamentStatus, players, onPlayerRegistered, onSwitchToPayment }) {
  const [formData, setFormData] = useState({
    name: '',
    efootball_id: '',
    whatsapp: '',
    team_name: '',
    utr_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const registeredCount = tournamentStatus?.registered_count || players.length;
  const verifiedCount = tournamentStatus?.verified_count || 0;
  const maxPlayers = tournamentStatus?.max_players || 32;
  // Registration and payments ONLY close when all 32 payments are verified or tournament is completed
  const isRegistrationClosed = Boolean(
    tournamentStatus && (
      tournamentStatus.status === 'completed' || 
      verifiedCount >= maxPlayers
    )
  );
  const percentage = Math.min(100, Math.round((verifiedCount / maxPlayers) * 100));

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
      setErrorMsg('Please fill in your Player Name, eFootball ID, and WhatsApp contact number.');
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

      setSuccessMsg(`Welcome, ${data.name}! You are registered. Please complete your ₹100 payment in the "Pay Entry Fee" tab to lock in your confirmed slot among the 32 spots!`);
      setFormData({ name: '', efootball_id: '', whatsapp: '', team_name: '', utr_number: '' });
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
    <div>
      {/* Main Registration & Contenders Grid */}
      <div className="registration-layout">
        {/* Left Column: Form */}
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck className="glow-text-green" size={22} />
                Player Registration
              </h2>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                {verifiedCount} / {maxPlayers} Paid Slots Confirmed ({registeredCount} Registered)
              </span>
            </div>

            {/* Payment Reminder Notice */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(229, 185, 76, 0.12), rgba(255, 158, 0, 0.08))',
              border: '1px solid rgba(229, 185, 76, 0.35)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                ⚡ <strong style={{ color: 'var(--accent-gold)' }}>Important:</strong> Registering alone does not lock your slot. Please complete the ₹100 entry fee to confirm your seat among the 32 slots!
              </div>
              {onSwitchToPayment && (
                <button
                  type="button"
                  onClick={onSwitchToPayment}
                  className="btn btn-outline"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderColor: 'rgba(229, 185, 76, 0.5)',
                    color: 'var(--accent-gold)',
                    fontWeight: '700'
                  }}
                >
                  Pay Fee Now →
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
              <div 
                style={{ 
                  width: `${percentage}%`, 
                  height: '100%', 
                  background: 'linear-gradient(to right, #ffd166, #ff9e00)',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>

            {successMsg && (
              <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0, color: 'var(--accent-gold)' }} />
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{successMsg}</div>
                </div>
                {onSwitchToPayment && (
                  <button
                    type="button"
                    onClick={onSwitchToPayment}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    <span>👉 Proceed to Pay Entry Fee (₹100)</span>
                  </button>
                )}
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
                  {tournamentStatus?.status === 'completed' ? (
                    <>
                      <strong>Tournament Completed!</strong><br />
                      The Pantihal eFootball Cup has officially concluded. Thank you to all participants!
                    </>
                  ) : (
                    <>
                      <strong>All 32 Tournament Slots Are Confirmed!</strong><br />
                      All 32 slots have been paid and verified. Registration and payments are officially closed.
                    </>
                  )}
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
                      (Required for Custom Room Invites)
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
                </div>

                <div className="form-group">
                  <label className="form-label">Dream Team Name (Optional)</label>
                  <input 
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleChange}
                    placeholder="e.g. FC Barcelona DT / Custom Team"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Payment UTR / Transaction ID (Optional if paying later)
                  </label>
                  <input 
                    type="text"
                    name="utr_number"
                    value={formData.utr_number}
                    onChange={handleChange}
                    placeholder="e.g. 427189028193 (or enter in Pay tab later)"
                    className="form-input"
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    If you haven't paid yet, you can leave this blank and submit payment via the Pay Entry Fee tab.
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading}
                >
                  <Sparkles size={18} />
                  <span>{loading ? 'Submitting Registration...' : 'Complete Registration'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Registered Contenders */}
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                filteredPlayers.map((player, index) => {
                  const isVerified = player.payment_status === 'verified';
                  return (
                    <div key={player.id} className="player-item-card">
                      <div className="player-info">
                        <div className={`player-num ${isVerified ? 'verified' : ''}`}>
                          {isVerified ? '✓' : `#${index + 1}`}
                        </div>
                        <div>
                          <div className="player-name">{player.name}</div>
                          <div className="player-team">{player.team_name || 'Dream Team'}</div>
                          {player.group_assigned && (
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                color: player.group_assigned === 'A' ? '#00e5ff' : player.group_assigned === 'B' ? '#00ff87' : player.group_assigned === 'C' ? '#b388ff' : '#ff7043', 
                                background: player.group_assigned === 'A' ? 'rgba(0, 229, 255, 0.12)' : player.group_assigned === 'B' ? 'rgba(0, 255, 135, 0.12)' : player.group_assigned === 'C' ? 'rgba(179, 136, 255, 0.12)' : 'rgba(255, 112, 67, 0.12)',
                                border: `1px solid ${player.group_assigned === 'A' ? 'rgba(0, 229, 255, 0.35)' : player.group_assigned === 'B' ? 'rgba(0, 255, 135, 0.35)' : player.group_assigned === 'C' ? 'rgba(179, 136, 255, 0.35)' : 'rgba(255, 112, 67, 0.35)'}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '700',
                                display: 'inline-block',
                                marginTop: '2px'
                              }}
                            >
                              Room: Group {player.group_assigned}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="player-id-badge">
                          {player.efootball_id}
                        </div>
                        <div style={{ marginTop: '5px' }}>
                          {isVerified ? (
                            <span className="player-status-pill verified">
                              ✓ Paid & Confirmed
                            </span>
                          ) : (
                            <span className="player-status-pill pending">
                              ⏳ Payment Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
