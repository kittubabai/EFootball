import React from 'react';
import { Trophy, Award, Edit3, HelpCircle, ArrowRight } from 'lucide-react';

export default function BracketTab({ bracketData, isAdmin, onOpenScoreModal }) {
  const rounds = bracketData?.rounds || [];
  const status = bracketData?.tournament_status;

  if (rounds.length === 0 || status === 'registration') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'rgba(0, 229, 255, 0.1)', 
          color: 'var(--accent-cyan)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Trophy size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Bracket Not Generated Yet</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px' }}>
          Player registration is currently active. Once the organizer locks registration, the single-elimination knockout bracket will appear here live!
        </p>
        {isAdmin && (
          <div style={{ marginTop: '16px', color: 'var(--accent-green)', fontSize: '0.9rem' }}>
            💡 <strong>Admin Tip:</strong> Open the Admin Panel to shuffle seeds and generate the bracket.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy className="glow-text-green" size={22} />
            Knockout Tournament Tree
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Single Elimination Cup • Winners advance automatically to the next round
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={14} />
          <span>Swipe or scroll horizontally to inspect all rounds</span>
        </div>
      </div>

      <div className="bracket-wrapper">
        <div className="bracket-container">
          {rounds.map((round) => (
            <div key={round.round_index} className="bracket-round">
              <div className="round-header">
                {round.round_name}
              </div>

              <div className="round-matches">
                {round.matches.map((match) => {
                  const isCompleted = match.status === 'completed' || match.status === 'bye';
                  const p1Won = match.winner_id && match.player1 && match.winner_id === match.player1.id;
                  const p2Won = match.winner_id && match.player2 && match.winner_id === match.player2.id;
                  const canEdit = isAdmin && match.player1 && match.player2 && match.status !== 'bye';

                  return (
                    <div 
                      key={match.id} 
                      className={`match-card ${isCompleted ? 'completed' : ''}`}
                      onClick={() => canEdit && onOpenScoreModal(match)}
                      style={{ cursor: canEdit ? 'pointer' : 'default' }}
                      title={canEdit ? "Admin: Click to enter or update score" : undefined}
                    >
                      <div className="match-header-tag">
                        <span>Match #{match.match_number}</span>
                        {match.is_extra_time && <span style={{ color: 'var(--accent-gold)' }}>AET</span>}
                        {match.status === 'bye' && <span style={{ color: 'var(--accent-cyan)' }}>BYE</span>}
                        {canEdit && (
                          <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Edit3 size={11} /> Edit
                          </span>
                        )}
                      </div>

                      {/* Player 1 */}
                      <div className={`match-participant ${p1Won ? 'winner' : ''}`}>
                        <div className="participant-details">
                          <div className="participant-name">
                            {match.player1 ? match.player1.name : (match.status === 'bye' ? '—' : 'TBD')}
                          </div>
                          <div className="participant-sub">
                            {match.player1?.team_name || match.player1?.efootball_id || ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="participant-score">
                            {match.player1_score !== null ? match.player1_score : '-'}
                          </span>
                          {match.player1_pk !== null && (
                            <span className="pk-pill">({match.player1_pk})</span>
                          )}
                          {p1Won && <Award size={16} style={{ color: 'var(--accent-green)', marginLeft: '6px' }} />}
                        </div>
                      </div>

                      {/* Player 2 */}
                      <div className={`match-participant ${p2Won ? 'winner' : ''}`}>
                        <div className="participant-details">
                          <div className="participant-name">
                            {match.player2 ? match.player2.name : (match.status === 'bye' ? 'BYE' : 'TBD')}
                          </div>
                          <div className="participant-sub">
                            {match.player2?.team_name || match.player2?.efootball_id || ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="participant-score">
                            {match.player2_score !== null ? match.player2_score : '-'}
                          </span>
                          {match.player2_pk !== null && (
                            <span className="pk-pill">({match.player2_pk})</span>
                          )}
                          {p2Won && <Award size={16} style={{ color: 'var(--accent-green)', marginLeft: '6px' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
