import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Shuffle, RotateCcw, UserPlus, Trash2, AlertCircle, CheckCircle2, Check, Clock, Eye, Target, Trophy, Flame, Edit2, RefreshCw } from 'lucide-react';

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
  const [adminTab, setAdminTab] = useState('players'); // 'players' | 'goals'
  
  // Goals tracking state
  const [topScorers, setTopScorers] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState(0);

  const fetchTopScorers = async () => {
    try {
      const res = await fetch('/api/top-scorers');
      if (res.ok) {
        const data = await res.json();
        setTopScorers(data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchTopScorers();
    }
  }, [isOpen, isAdmin]);

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
      fetchTopScorers();
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

      setMsg({ text: data.message || `Payment status updated to ${newStatus}.`, type: 'success' });
      if (onRefresh) onRefresh();
      fetchTopScorers();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleSaveGoal = async (playerId) => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': adminPin
        },
        body: JSON.stringify({ goals: parseInt(editGoalValue, 10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update goals.');

      setMsg({ text: data.message, type: 'success' });
      setEditingGoalId(null);
      fetchTopScorers();
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleGenerateGroups = async () => {
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
      fetchTopScorers();
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

      setMsg({ text: `Removed player: ${playerName}`, type: 'success' });
      if (onRefresh) onRefresh();
      fetchTopScorers();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleResetTournament = async (resetPlayers = false) => {
    const confirmPrompt = resetPlayers 
      ? 'ARE YOU SURE? This will permanently wipe ALL registered players and bracket fixtures.' 
      : 'Reset knockout matches back to registration state? (Player registrations will be kept)';

    if (!window.confirm(confirmPrompt)) return;

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch(`/api/admin/reset?reset_players=${resetPlayers}`, {
        method: 'POST',
        headers: { 'X-Admin-Pin': adminPin }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed.');

      setMsg({ text: data.message, type: 'success' });
      if (onRefresh) onRefresh();
      fetchTopScorers();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Organizer Admin Panel</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pantihal eFootball Cup Management</div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
        </div>

        {/* Feedback message */}
        {msg.text && (
          <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
            {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <div>{msg.text}</div>
          </div>
        )}

        {/* Unauthenticated Pin Form */}
        {!isAdmin ? (
          <form onSubmit={handleLogin}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Please enter your 4-digit Administrator PIN to manage players, verify ₹100 payments, and record goals.
            </p>
            <div className="form-group">
              <label className="form-label">Organizer Security PIN</label>
              <input 
                type="password" 
                placeholder="Default: 1234" 
                value={pinInput} 
                onChange={e => setPinInput(e.target.value)} 
                className="form-input" 
                maxLength={8}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tournament Status</div>
                <div style={{ fontWeight: '800', color: 'var(--accent-green)', textTransform: 'uppercase', fontSize: '0.86rem' }}>
                  {tournamentStatus?.status} • {tournamentStatus?.verified_count || 0}/32 Paid ({players.length} Registered)
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                Log Out
              </button>
            </div>

            {/* Admin Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <button 
                type="button"
                onClick={() => setAdminTab('players')}
                className={`tab-btn ${adminTab === 'players' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <UserPlus size={14} />
                <span>Players & Payments ({players.length})</span>
              </button>

              <button 
                type="button"
                onClick={() => { setAdminTab('goals'); fetchTopScorers(); }}
                className={`tab-btn ${adminTab === 'goals' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Target size={14} />
                <span>⚽ Goals & Top Scorers</span>
              </button>
            </div>

            {/* TAB 1: Players & Payments */}
            {adminTab === 'players' && (
              <div>
                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerateGroups}
                    disabled={loading || (tournamentStatus?.verified_count || 0) < 4}
                    style={{ height: '48px', fontSize: '0.84rem', gap: '6px' }}
                  >
                    <Shuffle size={16} />
                    <span>Seed 4 Groups (Paid Only)</span>
                  </button>

                  <button 
                    className="btn btn-outline" 
                    onClick={() => handleAddDemoPlayers(32)}
                    disabled={loading}
                    style={{ height: '48px', fontSize: '0.84rem', gap: '6px', borderColor: 'rgba(0, 229, 255, 0.4)' }}
                  >
                    <UserPlus size={16} color="#00e5ff" />
                    <span>Add 32 Demo Paid Players</span>
                  </button>
                </div>

                <h4 style={{ fontSize: '0.92rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                  Registered Players ({players.length}):
                </h4>
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {players.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                      No registered players yet.
                    </div>
                  ) : (
                    players.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,12,20,0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginLeft: '8px' }}>({p.efootball_id})</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            WA: <strong>{p.whatsapp}</strong> • UTR: <code style={{ color: 'var(--accent-gold)' }}>{p.utr_number || 'None'}</code>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {p.payment_screenshot && (
                            <button 
                              onClick={() => setViewScreenshot(p.payment_screenshot)}
                              className="btn btn-outline"
                              style={{ padding: '3px 8px', fontSize: '0.72rem', borderColor: 'rgba(0,229,255,0.4)', color: 'var(--accent-cyan)' }}
                              title="View Payment Screenshot"
                            >
                              <Eye size={12} /> Receipt
                            </button>
                          )}

                          {p.payment_status === 'verified' ? (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(0,255,135,0.12)', color: 'var(--accent-green)', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                              ✓ Verified
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleVerifyPayment(p.id, 'verified')}
                              className="btn btn-primary"
                              style={{ padding: '3px 8px', fontSize: '0.72rem' }}
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
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Goals & Top Scorers Tracker */}
            {adminTab === 'goals' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Note down or update goals scored per player for the <strong>₹200 Golden Boot</strong> award:
                  </div>
                  <button 
                    onClick={fetchTopScorers}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
                  >
                    <RefreshCw size={12} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {topScorers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                      No players available to track goals.
                    </div>
                  ) : (
                    topScorers.map((p, idx) => {
                      const isEditing = editingGoalId === p.id;

                      return (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,12,20,0.7)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>#{idx + 1} {p.name}</span>
                              {idx === 0 && p.total_goals > 0 && <Flame size={14} color="#ffbe0b" />}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Match Goals: <strong>{p.match_goals}</strong> • Extra Adj: <strong>{p.goals_scored}</strong> • Group: {p.group_assigned || 'N/A'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '900', color: p.total_goals > 0 ? 'var(--accent-gold)' : 'var(--text-dim)', minWidth: '28px', textAlign: 'right' }}>
                              {p.total_goals} ⚽
                            </span>

                            {isEditing ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <input 
                                  type="number"
                                  min="0"
                                  max="99"
                                  value={editGoalValue}
                                  onChange={e => setEditGoalValue(e.target.value)}
                                  style={{ width: '46px', padding: '2px 4px', borderRadius: '4px', background: '#0a0e17', border: '1px solid var(--accent-cyan)', color: '#fff', textAlign: 'center', fontSize: '0.82rem' }}
                                />
                                <button 
                                  onClick={() => handleSaveGoal(p.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '3px 6px', fontSize: '0.72rem' }}
                                  title="Save"
                                >
                                  <Check size={12} />
                                </button>
                                <button 
                                  onClick={() => setEditingGoalId(null)}
                                  className="btn btn-outline"
                                  style={{ padding: '3px 6px', fontSize: '0.72rem' }}
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingGoalId(p.id);
                                  setEditGoalValue(p.goals_scored || p.total_goals);
                                }}
                                className="btn btn-outline"
                                style={{ padding: '3px 8px', fontSize: '0.72rem', gap: '4px' }}
                                title="Edit Goals"
                              >
                                <Edit2 size={11} />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Reset Area */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, borderColor: 'rgba(255,190,11,0.3)', color: 'var(--accent-gold)', fontSize: '0.8rem' }}
                onClick={() => handleResetTournament(false)}
                disabled={loading}
              >
                <RotateCcw size={13} />
                <span>Reset Brackets Only</span>
              </button>

              <button 
                className="btn btn-outline" 
                style={{ flex: 1, borderColor: 'rgba(255,51,102,0.3)', color: 'var(--accent-red)', fontSize: '0.8rem' }}
                onClick={() => handleResetTournament(true)}
                disabled={loading}
              >
                <Trash2 size={13} />
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
