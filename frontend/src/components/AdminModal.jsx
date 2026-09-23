import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Shuffle, RotateCcw, UserPlus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  isAdmin, 
  adminPin, 
  onLoginSuccess, 
  onLogout, 
  tournamentStatus, 
  players, 
  onRefresh 
}) {
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Incorrect PIN');
      }

      onLoginSuccess(pinInput);
      setPinInput('');
      setMsg({ text: 'Admin authentication verified!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (players.length < 2) {
      setMsg({ text: 'You need at least 2 registered players to generate a tournament bracket!', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/bracket/generate', {
        method: 'POST',
        headers: { 'X-Admin-Pin': adminPin }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate bracket.');

      setMsg({ text: `Knockout bracket successfully generated (${data.bracket_size}-player tree, ${data.total_rounds} rounds)!`, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDemoPlayers = async (count = 16) => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/admin/seed-demo?count=${count}`, {
        method: 'POST',
        headers: { 'X-Admin-Pin': adminPin }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add demo players.');

      setMsg({ text: data.message, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Pin': adminPin }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete player.');

      setMsg({ text: `${playerName} removed.`, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleResetTournament = async (resetPlayers = false) => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/admin/reset?reset_players=${resetPlayers}`, {
        method: 'POST',
        headers: { 'X-Admin-Pin': adminPin }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reset tournament.');

      setMsg({ text: 'Tournament reset successfully.', type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} className="glow-text-green" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Organizer Control Hub</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {msg.text && (
          <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <div>{msg.text}</div>
          </div>
        )}

        {!isAdmin ? (
          /* Login Form */
          <form onSubmit={handleLogin} style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter the Tournament Organizer PIN to access bracket generation and score management.
            </p>

            <div className="form-group">
              <label className="form-label">Admin PIN (Default: <code>1234</code>)</label>
              <input 
                type="password"
                placeholder="Enter PIN..."
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="form-input"
                autoFocus
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <Lock size={16} />
              <span>{loading ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontWeight: '800', color: 'var(--accent-green)', textTransform: 'uppercase' }}>
                  {tournamentStatus?.status} ({players.length} Players)
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Log Out
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerateBracket}
                disabled={loading || players.length < 2}
                style={{ height: '56px', fontSize: '0.9rem', gap: '8px' }}
              >
                <Shuffle size={18} />
                <span>Shuffle & Generate Bracket</span>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => handleAddDemoPlayers(16)}
                disabled={loading}
                style={{ height: '56px', fontSize: '0.88rem', gap: '8px', borderColor: 'rgba(0, 229, 255, 0.4)' }}
              >
                <UserPlus size={18} color="#00e5ff" />
                <span>Add 16 Demo Players</span>
              </button>
            </div>

            {/* Players Management */}
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Registered Participants ({players.length}):
            </h4>
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {players.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                  No registered players yet.
                </div>
              ) : (
                players.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,12,20,0.7)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginLeft: '8px' }}>({p.efootball_id})</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>WA: {p.whatsapp}</div>
                    </div>
                    <button 
                      onClick={() => handleDeletePlayer(p.id, p.name)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px' }}
                      title="Remove Player"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Reset Area */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, borderColor: 'rgba(255,190,11,0.3)', color: 'var(--accent-gold)', fontSize: '0.82rem' }}
                onClick={() => handleResetTournament(false)}
                disabled={loading}
              >
                <RotateCcw size={14} />
                <span>Reset Bracket Only</span>
              </button>

              <button 
                className="btn btn-outline" 
                style={{ flex: 1, borderColor: 'rgba(255,51,102,0.3)', color: 'var(--accent-red)', fontSize: '0.82rem' }}
                onClick={() => handleResetTournament(true)}
                disabled={loading}
              >
                <Trash2 size={14} />
                <span>Full Wipe (All Data)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
