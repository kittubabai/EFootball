import React, { useState } from 'react';
import { UserCheck, Shield, Sparkles, AlertCircle, CheckCircle2, Search, Info, QrCode, Copy, Check, IndianRupee } from 'lucide-react';

export default function RegistrationTab({ tournamentStatus, players, onPlayerRegistered }) {
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
  const [copiedUpi, setCopiedUpi] = useState(false);

  const registeredCount = tournamentStatus?.registered_count || players.length;
  const maxPlayers = tournamentStatus?.max_players || 32;
  const isRegistrationClosed = tournamentStatus?.status !== 'registration' || registeredCount >= maxPlayers;
  const percentage = Math.min(100, Math.round((registeredCount / maxPlayers) * 100));

  const upiId = tournamentStatus?.upi_id || 'sayantanbabu2000-1@oksbi';
  const upiName = tournamentStatus?.upi_name || 'Sayantan Chakraborty';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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

    if (!formData.name.trim() || !formData.efootball_id.trim() || !formData.whatsapp.trim() || !formData.utr_number.trim()) {
      setErrorMsg('Please fill in your Player Name, eFootball ID, WhatsApp, and Payment UTR / Transaction ID.');
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

      setSuccessMsg(`Registration received for ${data.name}! The admin team will verify your ₹100 payment (UTR: ${data.utr_number}) and assign your 8-player room.`);
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
    (p.team_name && p.team_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.utr_number && p.utr_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* Payment Instruction Banner */}
      <div className="glass-card" style={{ 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, rgba(16, 26, 46, 0.85), rgba(10, 16, 30, 0.95))',
        border: '1px solid rgba(0, 229, 255, 0.35)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* QR Code Container */}
        <div style={{ textAlign: 'center', background: '#fff', padding: '10px', borderRadius: '12px', width: '160px', margin: '0 auto' }}>
          <img 
            src="/payment_qr.png" 
            alt="Scan to pay entry fee via UPI" 
            style={{ width: '140px', height: 'auto', display: 'block', borderRadius: '6px' }}
          />
          <div style={{ color: '#040812', fontSize: '0.72rem', fontWeight: '800', marginTop: '6px' }}>
            SCAN & PAY ₹100
          </div>
        </div>

        {/* Payment Details & Steps */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 135, 0.12)', color: 'var(--accent-green)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px' }}>
            <IndianRupee size={14} /> ENTRY FEE: ₹100 PER PLAYER
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px' }}>
            How to Pay & Confirm Your Slot
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '12px' }}>
            Pay via GPay, PhonePe, Paytm, or any UPI app. After payment, copy the <strong>12-digit UTR / Reference ID</strong> from your transaction receipt and paste it below.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Payee Name: </span>
              <strong>{upiName}</strong>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-dim)' }}>UPI ID: </span>
              <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{upiId}</strong>
              <button 
                onClick={handleCopyUpi} 
                style={{ background: 'transparent', border: 'none', color: copiedUpi ? '#00ff87' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Registration & Contenders Grid */}
      <div className="registration-layout">
        {/* Left Column: Form */}
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck className="glow-text-green" size={22} />
                Register for Pantihal Cup
              </h2>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-green)' }}>
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
                  All 32 slots are filled or tournament groups have commenced.
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

                <div className="form-group" style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
                  <label className="form-label" style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>
                    Payment UTR / Transaction ID (12 Digits) *
                  </label>
                  <input 
                    type="text"
                    name="utr_number"
                    value={formData.utr_number}
                    onChange={handleChange}
                    placeholder="e.g. 427189028193"
                    className="form-input"
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Sent after scanning QR and paying ₹100. Admin verifies this before approving your slot.
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={loading}
                >
                  <Sparkles size={18} />
                  <span>{loading ? 'Submitting Registration...' : 'Submit ₹100 Entry & Register'}</span>
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
                placeholder="Search by player, eFootball ID, or UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', height: '40px', fontSize: '0.88rem' }}
              />
            </div>

            <div className="registered-players-list">
              {filteredPlayers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
                  {players.length === 0 ? 'No players registered yet. Scan QR and be the first to enter!' : 'No matching players found.'}
                </div>
              ) : (
                filteredPlayers.map((player, index) => (
                  <div key={player.id} className="player-item-card">
                    <div className="player-info">
                      <div className="player-num">#{index + 1}</div>
                      <div>
                        <div className="player-name">{player.name}</div>
                        <div className="player-team">{player.team_name || 'Dream Team'}</div>
                        {player.group_assigned && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: '700' }}>
                            Room: Group {player.group_assigned}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="player-id-badge">{player.efootball_id}</div>
                      <div style={{ marginTop: '4px' }}>
                        {player.payment_status === 'verified' ? (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: '700' }}>
                            ✓ Paid & Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: '600' }}>
                            ⏳ Payment Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
