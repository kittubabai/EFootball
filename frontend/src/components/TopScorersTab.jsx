import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Flame, Edit2, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function TopScorersTab({ isAdmin, adminPin, onScoreUpdated }) {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState(0);
  const [actionMsg, setActionMsg] = useState('');

  const fetchScorers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/top-scorers');
      if (res.ok) {
        const data = await res.json();
        setScorers(data);
      }
    } catch (err) {
      console.error('Failed to fetch top scorers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorers();
  }, []);

  const handleSaveGoals = async (playerId) => {
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
      setActionMsg('Goals updated successfully!');
      setEditingId(null);
      fetchScorers();
      if (onScoreUpdated) onScoreUpdated();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const topScorer = scorers.length > 0 && scorers[0].total_goals > 0 ? scorers[0] : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Golden Boot Banner */}
      <div className="glass-card" style={{ 
        marginBottom: '24px', 
        padding: '24px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.12), rgba(0, 255, 135, 0.1))',
        borderColor: 'rgba(255, 190, 11, 0.35)'
      }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(255, 190, 11, 0.2)', 
          color: '#ffbe0b', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <Trophy size={30} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffbe0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>⚽ Golden Boot Leaderboard</span>
          <span style={{ fontSize: '0.9rem', background: 'rgba(255, 190, 11, 0.2)', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(255, 190, 11, 0.4)' }}>
            ₹200 CASH PRIZE
          </span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '580px', margin: '6px auto 0' }}>
          The player who scores the highest total goals across all group rooms and the Final 4 Championship wins the exclusive <strong>₹200 Top Scorer Cash Prize</strong>!
        </p>

        {topScorer && (
          <div style={{ 
            marginTop: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'rgba(0, 0, 0, 0.4)', 
            padding: '10px 20px', 
            borderRadius: '999px',
            border: '1px solid var(--accent-gold)'
          }}>
            <Flame size={20} color="#ffbe0b" />
            <span style={{ fontSize: '0.92rem' }}>
              Current Leader: <strong style={{ color: '#fff' }}>{topScorer.name}</strong> ({topScorer.team_name || 'Dream Team'}) — <strong style={{ color: 'var(--accent-gold)' }}>{topScorer.total_goals} Goals</strong>
            </span>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <Sparkles size={18} />
          <div>{actionMsg}</div>
        </div>
      )}

      {/* Leaderboard Table Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="#00ff87" />
              Tournament Goal Rankings
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Auto-tracked from match scorecards {isAdmin ? '• Admin goal adjustments enabled' : ''}
            </div>
          </div>

          <button 
            onClick={fetchScorers} 
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {scorers.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 20px' }}>
            No players or match scores registered yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px', width: '50px' }}>#</th>
                  <th style={{ padding: '10px 12px' }}>Player</th>
                  <th style={{ padding: '10px 12px', width: '90px' }}>Group</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Matches</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '110px' }}>Total Goals</th>
                  {isAdmin && <th style={{ padding: '10px 12px', textAlign: 'right', width: '150px' }}>Admin Action</th>}
                </tr>
              </thead>
              <tbody>
                {scorers.map((p, idx) => {
                  const isLeader = idx === 0 && p.total_goals > 0;
                  const isEditing = editingId === p.id;

                  return (
                    <tr 
                      key={p.id}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isLeader ? 'rgba(255, 190, 11, 0.06)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: '800' }}>
                        {idx === 0 && p.total_goals > 0 ? '🥇' : idx === 1 && p.total_goals > 0 ? '🥈' : idx === 2 && p.total_goals > 0 ? '🥉' : idx + 1}
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '700', color: isLeader ? 'var(--accent-gold)' : 'var(--text-main)' }}>
                          {p.name}
                          {isLeader && (
                            <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: 'rgba(255, 190, 11, 0.2)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px' }}>
                              Leader
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {p.efootball_id} • {p.team_name || 'Dream Team'}
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        {p.group_assigned ? (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                            Group {p.group_assigned}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pending</span>
                        )}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {p.matches_played}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '1.15rem', 
                          fontWeight: '900', 
                          color: isLeader ? 'var(--accent-gold)' : p.total_goals > 0 ? 'var(--accent-green)' : 'var(--text-dim)' 
                        }}>
                          {p.total_goals}
                        </span>
                        {p.goals_scored > 0 && p.match_goals > 0 && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                            ({p.match_goals} match + {p.goals_scored} adj)
                          </div>
                        )}
                      </td>

                      {isAdmin && (
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <input 
                                type="number" 
                                min="0" 
                                max="99"
                                value={editGoalValue}
                                onChange={e => setEditGoalValue(e.target.value)}
                                style={{ width: '56px', padding: '4px', borderRadius: '4px', background: '#0a0e17', border: '1px solid var(--accent-cyan)', color: '#fff', textAlign: 'center', fontSize: '0.85rem' }}
                              />
                              <button 
                                onClick={() => handleSaveGoals(p.id)}
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                title="Save Goals"
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingId(p.id);
                                setEditGoalValue(p.goals_scored || p.total_goals);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
                              title="Edit Goals"
                            >
                              <Edit2 size={12} />
                              <span>Note Goals</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
