import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ScoreModal({ match, adminPin, onClose, onScoreUpdated }) {
  const [p1Score, setP1Score] = useState(match?.player1_score ?? 0);
  const [p2Score, setP2Score] = useState(match?.player2_score ?? 0);
  const [isExtraTime, setIsExtraTime] = useState(match?.is_extra_time ?? false);
  const [p1Pk, setP1Pk] = useState(match?.player1_pk ?? '');
  const [p2Pk, setP2Pk] = useState(match?.player2_pk ?? '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (match) {
      setP1Score(match.player1_score ?? 0);
      setP2Score(match.player2_score ?? 0);
      setIsExtraTime(match.is_extra_time ?? false);
      setP1Pk(match.player1_pk ?? '');
      setP2Pk(match.player2_pk ?? '');
    }
  }, [match]);

  if (!match) return null;

  const isTied = Number(p1Score) === Number(p2Score);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isTied && (p1Pk === '' || p2Pk === '' || Number(p1Pk) === Number(p2Pk))) {
      setErrorMsg('Matches cannot end in a draw! Please enter a decisive Penalty Shootout (PK) score.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        player1_score: Number(p1Score),
        player2_score: Number(p2Score),
        is_extra_time: Boolean(isExtraTime),
        player1_pk: p1Pk !== '' ? Number(p1Pk) : null,
        player2_pk: p2Pk !== '' ? Number(p2Pk) : null
      };

      const res = await fetch(`/api/admin/matches/${match.id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': adminPin
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update score.');
      }

      if (onScoreUpdated) onScoreUpdated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Record Match Result</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {match.round_name} • Match #{match.match_number}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Match Score Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', margin: '20px 0' }}>
            {/* Player 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>
                {match.player1?.name || 'Player 1'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {match.player1?.team_name || 'Team 1'}
              </div>
              <input 
                type="number"
                min="0"
                max="99"
                value={p1Score}
                onChange={e => setP1Score(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: '800', width: '90px', margin: '0 auto' }}
                required
              />
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dim)' }}>
              VS
            </div>

            {/* Player 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>
                {match.player2?.name || 'Player 2'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {match.player2?.team_name || 'Team 2'}
              </div>
              <input 
                type="number"
                min="0"
                max="99"
                value={p2Score}
                onChange={e => setP2Score(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: '800', width: '90px', margin: '0 auto' }}
                required
              />
            </div>
          </div>

          {/* Extra time checkbox */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox"
              id="extraTimeCheck"
              checked={isExtraTime}
              onChange={e => setIsExtraTime(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-green)' }}
            />
            <label htmlFor="extraTimeCheck" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Match went into Extra Time (AET)
            </label>
          </div>

          {/* Penalties section if tied */}
          {isTied && (
            <div style={{ background: 'rgba(255, 190, 11, 0.08)', border: '1px solid rgba(255, 190, 11, 0.25)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '10px' }}>
                Penalty Shootout (PK) Decider Required:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', marginBottom: '4px' }}>{match.player1?.name} PKs:</div>
                  <input 
                    type="number"
                    min="0"
                    max="30"
                    placeholder="e.g. 5"
                    value={p1Pk}
                    onChange={e => setP1Pk(e.target.value)}
                    className="form-input"
                    style={{ width: '70px', textAlign: 'center', fontWeight: '700' }}
                  />
                </div>
                <div style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>PKs</div>
                <div>
                  <div style={{ fontSize: '0.78rem', marginBottom: '4px' }}>{match.player2?.name} PKs:</div>
                  <input 
                    type="number"
                    min="0"
                    max="30"
                    placeholder="e.g. 4"
                    value={p2Pk}
                    onChange={e => setP2Pk(e.target.value)}
                    className="form-input"
                    style={{ width: '70px', textAlign: 'center', fontWeight: '700' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              <CheckCircle2 size={18} />
              <span>{loading ? 'Saving Result...' : 'Confirm & Advance Winner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
