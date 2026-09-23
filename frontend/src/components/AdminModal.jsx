import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ShieldCheck, Shuffle, RotateCcw, UserPlus, Trash2, AlertCircle, CheckCircle2, Check, Clock, Eye, Target, Trophy, Flame, Edit2, RefreshCw, Award, Download, Send, Share2, Sparkles, Medal, FileText } from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  isAdmin, 
  adminPin, 
  onLoginSuccess, 
  onLogout, 
  tournamentStatus, 
  players, 
  bracketData,
  onRefresh 
}) {
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [viewScreenshot, setViewScreenshot] = useState(null);
  const [adminTab, setAdminTab] = useState('players'); // 'players' | 'goals' | 'certificates'
  
  // Player Edit State
  const [editPlayerForm, setEditPlayerForm] = useState(null);

  // Certificates State
  const [selectedCertPlayerId, setSelectedCertPlayerId] = useState('');
  const [manualRank, setManualRank] = useState('');
  const certCanvasRef = useRef(null);
  
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    if (!editPlayerForm) return;

    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/admin/players/${editPlayerForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': adminPin
        },
        body: JSON.stringify(editPlayerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update player.');

      setMsg({ text: data.message, type: 'success' });
      setEditPlayerForm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const drawCertificate = (player, rankText) => {
    const canvas = certCanvasRef.current;
    if (!canvas || !player) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1200;
    const h = 800;
    canvas.width = w;
    canvas.height = h;

    // Background Gradient (Royal Stadium Navy)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#070b15');
    bgGrad.addColorStop(0.5, '#0c162e');
    bgGrad.addColorStop(1, '#050811');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Ornate Golden Borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    ctx.strokeStyle = 'rgba(255, 190, 11, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // Corner Accents
    const drawCorner = (x, y) => {
      ctx.fillStyle = '#ffbe0b';
      ctx.fillRect(x - 8, y - 8, 16, 16);
    };
    drawCorner(48, 48);
    drawCorner(w - 48, 48);
    drawCorner(48, h - 48);
    drawCorner(w - 48, h - 48);

    // Header Emblem
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#00ff87';
    ctx.fillText('⚽ PANTIHAL eFOOTBALL CUP 2026 ⚽', w / 2, 105);

    // Certificate Title
    ctx.font = '900 48px Outfit, sans-serif';
    ctx.fillStyle = '#ffbe0b';
    ctx.shadowColor = 'rgba(255, 190, 11, 0.5)';
    ctx.shadowBlur = 12;
    ctx.fillText('CERTIFICATE OF EXCELLENCE', w / 2, 175);
    ctx.shadowBlur = 0;

    // Presentation text
    ctx.font = 'italic 20px Inter, sans-serif';
    ctx.fillStyle = '#a0b3cf';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY CONFERRED UPON', w / 2, 235);

    // Player Name
    ctx.font = '900 52px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(player.name.toUpperCase(), w / 2, 310);

    // Underline
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 220, 335);
    ctx.lineTo(w / 2 + 220, 335);
    ctx.stroke();

    // Player ID & Team
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`eFootball ID: ${player.efootball_id}   •   Team: ${player.team_name || 'Dream Team'}`, w / 2, 375);

    // Citation
    ctx.font = '18px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('In recognition of exemplary tactical gaming performance, skill, and securing', w / 2, 435);

    // Rank Ribbon Box
    ctx.fillStyle = 'rgba(255, 190, 11, 0.15)';
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 2;
    ctx.fillRect(w / 2 - 320, 470, 640, 65);
    ctx.strokeRect(w / 2 - 320, 470, 640, 65);

    ctx.font = '900 28px Outfit, sans-serif';
    ctx.fillStyle = '#ffbe0b';
    ctx.fillText(rankText.toUpperCase(), w / 2, 513);

    // Date & Context
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Held on 18th October 2026   •   Official 32-Player Knockout Championship', w / 2, 585);

    // Signatures
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 690);
    ctx.lineTo(360, 690);
    ctx.stroke();

    ctx.font = 'italic bold 20px cursive, sans-serif';
    ctx.fillStyle = '#00ff87';
    ctx.fillText('Pantihal Committee', 250, 675);

    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Tournament Director', 250, 715);

    // Center Gold Seal
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, 680, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#ffbe0b';
    ctx.fillText('★ VERIFIED ★', w / 2, 675);
    ctx.fillText('OFFICIAL SEAL', w / 2, 692);

    // Right Signature
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 360, 690);
    ctx.lineTo(w - 140, 690);
    ctx.stroke();

    ctx.font = 'italic bold 20px cursive, sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('Match Operations', w - 250, 675);

    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Chief Coordinator', w - 250, 715);
  };

  const handleDownloadCertificate = (playerName, rankText) => {
    if (!certCanvasRef.current) return;
    const url = certCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${playerName.replace(/\s+/g, '_')}_${rankText.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    a.click();
  };

  const handleSendWhatsAppCertificate = (player, rankText) => {
    if (!player) return;
    const cleanWA = player.whatsapp.replace(/[^0-9]/g, '');
    const phone = cleanWA.length === 10 ? `91${cleanWA}` : cleanWA;
    const text = encodeURIComponent(
      `*Pantihal eFootball Cup 2026 - Certificate of Excellence*\n\n` +
      `Dear *${player.name}* (eFootball ID: ${player.efootball_id}),\n\n` +
      `🎉 Congratulations! You have secured *${rankText}* in the Pantihal eFootball Cup!\n\n` +
      `Your official tournament Certificate of Excellence has been generated and approved by the tournament committee.\n\n` +
      `Please contact the organizers to collect your award and cash prize payout!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
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

  // Certificate player and rank selection
  const currCertPlayer = players.find(p => String(p.id) === String(selectedCertPlayerId)) || players[0] || null;
  const podium = bracketData?.finals?.podium || {};

  let detectedRankTitle = 'Grand Champion (1st Place) 🥇';
  let isEligibleTop4 = false;

  if (currCertPlayer) {
    if (podium.first && (podium.first.id === currCertPlayer.id || podium.first.name === currCertPlayer.name)) {
      detectedRankTitle = 'Grand Champion (1st Place) 🥇';
      isEligibleTop4 = true;
    } else if (podium.second && (podium.second.id === currCertPlayer.id || podium.second.name === currCertPlayer.name)) {
      detectedRankTitle = 'Runner-Up (2nd Place) 🥈';
      isEligibleTop4 = true;
    } else if (podium.third && (podium.third.id === currCertPlayer.id || podium.third.name === currCertPlayer.name)) {
      detectedRankTitle = '3rd Position 🥉';
      isEligibleTop4 = true;
    } else if (podium.fourth && (podium.fourth.id === currCertPlayer.id || podium.fourth.name === currCertPlayer.name)) {
      detectedRankTitle = '4th Position 🏅';
      isEligibleTop4 = true;
    }
  }

  const effectiveCertRank = manualRank || detectedRankTitle;

  useEffect(() => {
    if (adminTab === 'certificates' && currCertPlayer) {
      // Short delay to ensure canvas DOM element is mounted
      const timer = setTimeout(() => {
        drawCertificate(currCertPlayer, effectiveCertRank);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [adminTab, selectedCertPlayerId, manualRank, currCertPlayer, effectiveCertRank]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay modal-backdrop" onClick={onClose}>
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
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
                <span>⚽ Goals Tracker</span>
              </button>

              <button 
                type="button"
                onClick={() => setAdminTab('certificates')}
                className={`tab-btn ${adminTab === 'certificates' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Award size={14} color="#ffbe0b" />
                <span>📜 Top 4 Certificates</span>
              </button>
            </div>

            {/* TAB 1: Players & Payments */}
            {adminTab === 'players' && (
              <div>
                {/* Inline Player Edit Form */}
                {editPlayerForm && (
                  <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid var(--accent-cyan)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Edit2 size={14} /> Edit Player #{editPlayerForm.id} Details
                      </strong>
                      <button type="button" onClick={() => setEditPlayerForm(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                    </div>
                    <form onSubmit={handleUpdatePlayer}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Name / IGN</label>
                          <input 
                            type="text" 
                            value={editPlayerForm.name} 
                            onChange={e => setEditPlayerForm({ ...editPlayerForm, name: e.target.value })} 
                            className="form-input" 
                            style={{ padding: '6px 8px', fontSize: '0.82rem' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>eFootball User ID</label>
                          <input 
                            type="text" 
                            value={editPlayerForm.efootball_id} 
                            onChange={e => setEditPlayerForm({ ...editPlayerForm, efootball_id: e.target.value })} 
                            className="form-input" 
                            style={{ padding: '6px 8px', fontSize: '0.82rem' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>WhatsApp Number</label>
                          <input 
                            type="text" 
                            value={editPlayerForm.whatsapp} 
                            onChange={e => setEditPlayerForm({ ...editPlayerForm, whatsapp: e.target.value })} 
                            className="form-input" 
                            style={{ padding: '6px 8px', fontSize: '0.82rem' }} 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Dream Team Name</label>
                          <input 
                            type="text" 
                            value={editPlayerForm.team_name} 
                            onChange={e => setEditPlayerForm({ ...editPlayerForm, team_name: e.target.value })} 
                            className="form-input" 
                            style={{ padding: '6px 8px', fontSize: '0.82rem' }} 
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEditPlayerForm(null)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.76rem' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.76rem' }} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Player Details'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerateGroups}
                    disabled={loading || (tournamentStatus?.verified_count || 0) < 4}
                    title={(tournamentStatus?.verified_count || 0) < 4 ? `Need at least 4 verified paid players to seed rooms (currently ${tournamentStatus?.verified_count || 0})` : 'Seed 4 Custom Rooms and Brackets'}
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
                            onClick={() => setEditPlayerForm({
                              id: p.id,
                              name: p.name,
                              efootball_id: p.efootball_id,
                              whatsapp: p.whatsapp,
                              team_name: p.team_name || ''
                            })}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', borderColor: 'rgba(255,190,11,0.4)', color: 'var(--accent-gold)' }}
                            title="Edit Player (Fix eFootball ID / Name / WA)"
                          >
                            <Edit2 size={12} /> Edit
                          </button>

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

            {/* TAB 3: Certificates Generation (Top 4) */}
            {adminTab === 'certificates' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={18} color="#ffbe0b" />
                    Top 4 Tournament Certificate Generator
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Verifies tournament placement from DB, renders a high-res certificate, and sends via WhatsApp.
                  </p>
                </div>

                {/* Player & Rank Controls */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Tournament Player</label>
                      <select 
                        value={selectedCertPlayerId || (players[0]?.id || '')} 
                        onChange={e => {
                          setSelectedCertPlayerId(e.target.value);
                          setManualRank('');
                        }}
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                      >
                        {players.length === 0 && <option value="">No players registered yet</option>}
                        {players.map(p => (
                          <option key={p.id} value={p.id}>
                            #{p.id} {p.name} ({p.efootball_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tournament Placement / Award</label>
                      <select 
                        value={manualRank || detectedRankTitle} 
                        onChange={e => setManualRank(e.target.value)}
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                      >
                        <option value="Grand Champion (1st Place) 🥇">🥇 Grand Champion (1st Place)</option>
                        <option value="Runner-Up (2nd Place) 🥈">🥈 Runner-Up (2nd Place)</option>
                        <option value="3rd Position 🥉">🥉 3rd Position</option>
                        <option value="4th Position 🏅">🏅 4th Position</option>
                        <option value="⚽ Golden Boot (Top Goalscorer)">⚽ Golden Boot (Top Goalscorer)</option>
                        <option value="Certificate of Participation">🎖️ Certificate of Participation</option>
                      </select>
                    </div>
                  </div>

                  {/* Eligibility Status Banner */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: isEligibleTop4 ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 190, 11, 0.1)', 
                    border: `1px solid ${isEligibleTop4 ? 'rgba(0, 255, 135, 0.35)' : 'rgba(255, 190, 11, 0.35)'}`, 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                      {isEligibleTop4 ? <CheckCircle2 size={16} color="#00ff87" /> : <AlertCircle size={16} color="#ffbe0b" />}
                      <span style={{ color: isEligibleTop4 ? 'var(--accent-green)' : 'var(--accent-gold)', fontWeight: '700' }}>
                        {isEligibleTop4 
                          ? `Eligible: Verified ${detectedRankTitle} in Official Finals!` 
                          : tournamentStatus?.status !== 'completed' 
                            ? `Status: Finals in progress (DB auto-verifies when matches conclude). Admin issue active.`
                            : `Status: Did not finish in Top 4. Admin issue active.`}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      WA: <strong>{currCertPlayer?.whatsapp || 'N/A'}</strong>
                    </span>
                  </div>
                </div>

                {/* Certificate Live Canvas Preview */}
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ 
                    background: '#070b15', 
                    borderRadius: '8px', 
                    padding: '8px', 
                    border: '1px solid var(--border-glow)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                    overflow: 'hidden'
                  }}>
                    <canvas 
                      ref={certCanvasRef} 
                      style={{ 
                        width: '100%', 
                        maxWidth: '560px', 
                        height: 'auto', 
                        borderRadius: '6px', 
                        display: 'block', 
                        margin: '0 auto' 
                      }} 
                    />
                  </div>
                </div>

                {/* Actions: Download and Send WhatsApp */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => handleDownloadCertificate(currCertPlayer?.name || 'Player', manualRank || detectedRankTitle)}
                    disabled={!currCertPlayer}
                    className="btn btn-primary"
                    style={{ height: '42px', fontSize: '0.84rem', gap: '6px' }}
                  >
                    <Download size={16} />
                    <span>Download Certificate (PNG)</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleSendWhatsAppCertificate(currCertPlayer, manualRank || detectedRankTitle)}
                    disabled={!currCertPlayer}
                    className="btn btn-outline"
                    style={{ height: '42px', fontSize: '0.84rem', gap: '6px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
                  >
                    <Send size={16} />
                    <span>Send on WhatsApp</span>
                  </button>
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
