import React, { useState } from 'react';
import { Calendar, Copy, Check, Swords, Edit3, MessageCircle } from 'lucide-react';

export default function FixturesTab({ matches, isAdmin, onOpenScoreModal }) {
  const [filter, setFilter] = useState('all'); // all, upcoming, completed
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (idText) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'completed') return m.status === 'completed' || m.status === 'bye';
    if (filter === 'upcoming') return m.status === 'scheduled';
    return true;
  });

  if (matches.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Calendar size={36} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Fixtures Generated Yet</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Fixtures will be published once registration closes and the tournament bracket is generated.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords className="glow-text-cyan" size={22} />
            Tournament Fixtures & Results
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Copy opponent's eFootball ID to send in-game Match Room invitations
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px' }}>
          {['all', 'upcoming', 'completed'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: filter === type ? 'var(--accent-cyan)' : 'transparent',
                color: filter === type ? '#040910' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="fixtures-grid">
        {filteredMatches.map(match => {
          const isDone = match.status === 'completed' || match.status === 'bye';
          const p1 = match.player1;
          const p2 = match.player2;
          const p1Won = match.winner_id && p1 && match.winner_id === p1.id;
          const p2Won = match.winner_id && p2 && match.winner_id === p2.id;
          const canEdit = isAdmin && p1 && p2 && match.status !== 'bye';

          return (
            <div key={match.id} className="fixture-card">
              <div className="fixture-meta">
                <span style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>{match.round_name}</span>
                <span>
                  {match.status === 'bye' ? (
                    <span style={{ color: 'var(--accent-cyan)' }}>BYE</span>
                  ) : isDone ? (
                    <span style={{ color: 'var(--accent-green)' }}>Finished</span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>Scheduled</span>
                  )}
                </span>
              </div>

              <div className="fixture-teams">
                {/* Team 1 */}
                <div className="fixture-team">
                  <span style={{ fontWeight: p1Won ? '800' : '600', color: p1Won ? 'var(--accent-green)' : '#fff', fontSize: '1rem' }}>
                    {p1 ? p1.name : (match.status === 'bye' ? '—' : 'TBD')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {p1?.team_name || 'Dream Team'}
                  </span>
                  {p1 && (
                    <button 
                      className="copy-id-btn" 
                      onClick={() => handleCopy(p1.efootball_id)}
                      title="Copy eFootball ID"
                    >
                      {copiedId === p1.efootball_id ? <Check size={12} color="#00ff87" /> : <Copy size={12} />}
                      <span>ID: {p1.efootball_id}</span>
                    </button>
                  )}
                </div>

                {/* Score / VS Center */}
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  {isDone ? (
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                        {match.player1_score} - {match.player2_score}
                      </div>
                      {match.is_extra_time && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>AET</div>
                      )}
                      {match.player1_pk !== null && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>
                          PK ({match.player1_pk} - {match.player2_pk})
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="fixture-vs">VS</span>
                  )}
                </div>

                {/* Team 2 */}
                <div className="fixture-team right">
                  <span style={{ fontWeight: p2Won ? '800' : '600', color: p2Won ? 'var(--accent-green)' : '#fff', fontSize: '1rem' }}>
                    {p2 ? p2.name : (match.status === 'bye' ? 'BYE' : 'TBD')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {p2?.team_name || 'Dream Team'}
                  </span>
                  {p2 && (
                    <button 
                      className="copy-id-btn" 
                      onClick={() => handleCopy(p2.efootball_id)}
                      title="Copy eFootball ID"
                    >
                      {copiedId === p2.efootball_id ? <Check size={12} color="#00ff87" /> : <Copy size={12} />}
                      <span>ID: {p2.efootball_id}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action row */}
              {canEdit && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', borderColor: 'rgba(0,255,135,0.3)' }}
                    onClick={() => onOpenScoreModal(match)}
                  >
                    <Edit3 size={14} color="#00ff87" />
                    <span>{isDone ? 'Update Score' : 'Record Score'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
