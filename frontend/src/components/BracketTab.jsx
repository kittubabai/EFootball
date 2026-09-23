import React, { useState } from 'react';
import { Trophy, Award, Edit3, HelpCircle, Users, Medal } from 'lucide-react';

export default function BracketTab({ bracketData, isAdmin, onOpenScoreModal }) {
  const [selectedView, setSelectedView] = useState('FINALS'); // 'A' | 'B' | 'C' | 'D' | 'FINALS'

  const status = bracketData?.tournament_status;
  const groups = bracketData?.groups || {};
  const finals = bracketData?.finals || { semi_finals: [], third_place: null, grand_final: null, podium: {} };
  const podium = finals.podium || {};

  const hasMatches = (finals.semi_finals?.length > 0) || (groups['A']?.matches?.length > 0);

  if (!hasMatches || status === 'registration') {
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
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Groups & Rooms Not Seeded Yet</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
          Player registrations and ₹100 payments are currently being verified. Once registration closes, the 32 players will be distributed into <strong>4 Custom Rooms of 8 players (A, B, C, D)</strong> and the brackets will appear live here!
        </p>
        {isAdmin && (
          <div style={{ marginTop: '16px', color: 'var(--accent-green)', fontSize: '0.9rem' }}>
            💡 <strong>Admin Tip:</strong> Open the Admin Panel to verify payments and click "Seed 4 Groups & Start Tournament".
          </div>
        )}
      </div>
    );
  }

  // Render a match card
  const renderMatchCard = (match) => {
    if (!match) return null;
    const isCompleted = match.status === 'completed' || match.status === 'bye';
    const p1Won = match.winner_id && match.player1 && match.winner_id === match.player1.id;
    const p2Won = match.winner_id && match.player2 && match.winner_id === match.player2.id;
    const canEdit = isAdmin && match.player1 && match.player2 && match.status !== 'bye';

    return (
      <div 
        key={match.id} 
        className={`match-card ${isCompleted ? 'completed' : ''}`}
        onClick={() => canEdit && onOpenScoreModal(match)}
        style={{ cursor: canEdit ? 'pointer' : 'default', minWidth: '240px' }}
        title={canEdit ? "Admin: Click to enter or update score" : undefined}
      >
        <div className="match-header-tag">
          <span>{match.round_name}</span>
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
  };

  const currentGroup = groups[selectedView];

  return (
    <div>
      {/* Podium Banner if Champions have been decided */}
      {(podium.first || podium.second || podium.third) && (
        <div className="glass-card" style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.12), rgba(0, 255, 135, 0.12))',
          borderColor: 'rgba(255, 190, 11, 0.35)',
          padding: '24px'
        }}>
          <h3 style={{ textAlign: 'center', fontSize: '1.35rem', fontWeight: '900', color: '#ffbe0b', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Trophy size={26} /> TOURNAMENT PODIUM (1ST, 2ND, 3RD PLACE)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* 1st Place */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255, 190, 11, 0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🥇</div>
              <div style={{ color: '#ffbe0b', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>1st Place (Champion)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>{podium.first ? podium.first.name : 'TBD'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{podium.first?.team_name || ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', marginTop: '4px' }}>{podium.first?.efootball_id || ''}</div>
            </div>

            {/* 2nd Place */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192, 192, 192, 0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🥈</div>
              <div style={{ color: '#c0c0c0', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>2nd Place (Runner-up)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>{podium.second ? podium.second.name : 'TBD'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{podium.second?.team_name || ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', marginTop: '4px' }}>{podium.second?.efootball_id || ''}</div>
            </div>

            {/* 3rd Place */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(205, 127, 50, 0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🥉</div>
              <div style={{ color: '#cd7f32', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>3rd Place Winner</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>{podium.third ? podium.third.name : 'TBD'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{podium.third?.team_name || ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', marginTop: '4px' }}>{podium.third?.efootball_id || ''}</div>
            </div>
          </div>
        </div>
      )}

      {/* Group Room Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
        <button
          onClick={() => setSelectedView('FINALS')}
          style={{
            background: selectedView === 'FINALS' ? 'linear-gradient(135deg, rgba(255, 190, 11, 0.25), rgba(0, 255, 135, 0.25))' : 'rgba(255,255,255,0.05)',
            border: selectedView === 'FINALS' ? '1px solid #ffbe0b' : '1px solid var(--border-color)',
            color: selectedView === 'FINALS' ? '#ffbe0b' : 'var(--text-muted)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Trophy size={16} />
          <span>Final 4 Championship Room</span>
        </button>

        {['A', 'B', 'C', 'D'].map(g => (
          <button
            key={g}
            onClick={() => setSelectedView(g)}
            style={{
              background: selectedView === g ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 255, 135, 0.2))' : 'rgba(255,255,255,0.05)',
              border: selectedView === g ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              color: selectedView === g ? '#fff' : 'var(--text-muted)',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={15} />
            <span>Room {g} (8 Players)</span>
            {groups[g]?.winner && (
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: '800', marginLeft: '4px' }}>
                ✓ {groups[g].winner.name}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected View Rendering */}
      {selectedView === 'FINALS' ? (
        /* Final 4 Championship View */
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#ffbe0b" />
              Final 4 Championship Room (Decides 1st, 2nd, and 3rd Position)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Winners of Group A, B, C, and D meet here on 18th October to battle for the championship podium!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Semi-Finals Column */}
            <div>
              <div className="round-header" style={{ borderColor: 'rgba(0, 229, 255, 0.4)', color: 'var(--accent-cyan)' }}>
                Final 4 Semi-Finals
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {finals.semi_finals?.map(m => renderMatchCard(m))}
              </div>
            </div>

            {/* Decider Matches Column */}
            <div>
              <div className="round-header" style={{ borderColor: 'rgba(255, 190, 11, 0.4)', color: '#ffbe0b' }}>
                Podium Decider Matches
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Grand Final */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffbe0b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Medal size={16} /> 🥇 Grand Final (Decides 1st & 2nd Place)
                  </div>
                  {renderMatchCard(finals.grand_final)}
                </div>

                {/* 3rd Place Match */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#cd7f32', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Medal size={16} /> 🥉 3rd Place Playoff (Decides 3rd Position)
                  </div>
                  {renderMatchCard(finals.third_place)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Individual 8-Player Group Room View */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                {currentGroup?.group_name || `Group ${selectedView}`}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                8 Players Room • Winner advances to the Final 4 Championship!
              </p>
            </div>
            {currentGroup?.winner && (
              <div className="badge badge-live">
                🏆 Group Winner: {currentGroup.winner.name} (Qualified for Final 4)
              </div>
            )}
          </div>

          <div className="bracket-wrapper">
            <div className="bracket-container">
              {/* Round 1: Quarter-Finals (4 matches) */}
              <div className="bracket-round">
                <div className="round-header">Quarter-Finals (4 Matches)</div>
                <div className="round-matches">
                  {currentGroup?.matches?.filter(m => m.round_index === 1).map(m => renderMatchCard(m))}
                </div>
              </div>

              {/* Round 2: Semi-Finals (2 matches) */}
              <div className="bracket-round">
                <div className="round-header">Semi-Finals (2 Matches)</div>
                <div className="round-matches">
                  {currentGroup?.matches?.filter(m => m.round_index === 2).map(m => renderMatchCard(m))}
                </div>
              </div>

              {/* Round 3: Group Final (1 match) */}
              <div className="bracket-round">
                <div className="round-header" style={{ borderColor: 'rgba(0, 255, 135, 0.4)' }}>
                  Group Final (To Final 4)
                </div>
                <div className="round-matches">
                  {currentGroup?.matches?.filter(m => m.round_index === 3).map(m => renderMatchCard(m))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
