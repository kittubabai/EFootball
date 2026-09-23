import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Shuffle, RotateCcw, UserPlus, Trash2, AlertCircle, CheckCircle2, Check, Clock, Eye } from 'lucide-react';

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
  const [viewScreenshot, setViewScreenshot] = useState(null);

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

  const handleVerifyPayment = async (playerId, newStatus = 'verified') => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': adminPin
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update payment status.');

      setMsg({ text: `Payment status updated to ${newStatus}.`, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleGenerateGroups = async () => {
    if (players.length < 4) {
      setMsg({ text: 'You need at least 4 registered players to generate tournament groups!', type: 'error' });
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
      if (!res.ok) throw new Error(data.detail || 'Failed to generate groups.');

      setMsg({ text: '4 Custom Rooms (A, B, C, D) & Final 4 Championship generated successfully!', type: 'success' });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDemoPlayers = async (count = 32) => {
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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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
              Enter the Tournament Organizer PIN to verify player payments, seed 8-player groups, and record match results.
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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontWeight: '800', color: 'var(--accent-green)', textTransform: 'uppercase' }}>
                  {tournamentStatus?.status} • {players.length} Registrations
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
                onClick={handleGenerateGroups}
                disabled={loading || players.length < 4}
                style={{ height: '56px', fontSize: '0.88rem', gap: '8px' }}
              >
                <Shuffle size={18} />
                <span>Seed 4 Groups (8 Players Each)</span>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => handleAddDemoPlayers(32)}
                disabled={loading}
                style={{ height: '56px', fontSize: '0.85rem', gap: '8px', borderColor: 'rgba(0, 229, 255, 0.4)' }}
              >
                <UserPlus size={18} color="#00e5ff" />
                <span>Add 32 Demo Paid Players</span>
              </button>
            </div>

            {/* Players Management with UTR Verification */}
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Registered Players & UTR Payments ({players.length}):
            </h4>
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {players.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                  No registered players yet.
                </div>
              ) : (
                players.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,12,20,0.7)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginLeft: '8px' }}>({p.efootball_id})</span>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        WA: <strong>{p.whatsapp}</strong> • UTR: <code style={{ color: 'var(--accent-gold)' }}>{p.utr_number || 'N/A'}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.payment_screenshot && (
                        <button 
                          onClick={() => setViewScreenshot(p.payment_screenshot)}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', borderColor: 'rgba(0,229,255,0.4)', color: 'var(--accent-cyan)' }}
                          title="View Payment Screenshot"
                        >
                          <Eye size={12} /> Receipt
                        </button>
                      )}

                      {p.payment_status === 'verified' ? (
                        <span style={{ fontSize: '0.74rem', background: 'rgba(0,255,135,0.12)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>
                          ✓ Verified
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleVerifyPayment(p.id, 'verified')}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          title="Verify ₹100 Payment"
                        >
                          <Check size={12} /> Verify ₹100
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px' }}
                        title="Remove Player"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                <span>Reset Brackets Only</span>
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

      {/* Screenshot Preview Modal */}
      {viewScreenshot && (
        <div 
          onClick={() => setViewScreenshot(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '90%', maxHeight: '85%', position: 'relative' }}
          >
            <button 
              onClick={() => setViewScreenshot(null)}
              style={{
                position: 'absolute',
                top: '-36px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
              title="Close Preview"
            >
              <X size={26} />
            </button>
            <img 
              src={viewScreenshot} 
              alt="Payment receipt proof" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', border: '2px solid var(--accent-green)', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
