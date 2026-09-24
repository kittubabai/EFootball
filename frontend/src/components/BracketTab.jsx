import React, { useState } from 'react';
import { Trophy, Award, Edit3, HelpCircle, Users, Medal, ChevronDown, ChevronUp, ChevronsUpDown, Sparkles } from 'lucide-react';

export default function BracketTab({ bracketData, isAdmin, onOpenScoreModal }) {
  // Accordion state: only one section open at a time (A, B, C, D, FINALS, or null)
  const [openSection, setOpenSection] = useState(() => {
    if (bracketData?.finals?.podium?.first) return 'FINALS';
    return 'A';
  });

  const toggleSection = (key) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

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

  // Render individual 8-player group section (A, B, C, D)
  const renderGroupSection = (groupKey) => {
    const group = groups[groupKey];
    if (!group) return null;
    const isCollapsed = openSection !== groupKey;
    const winner = group.winner;
    const qfMatches = group.matches?.filter(m => m.round_index === 1) || [];
    const sfMatches = group.matches?.filter(m => m.round_index === 2) || [];
    const gfMatches = group.matches?.filter(m => m.round_index === 3) || [];

    return (
      <div 
        key={groupKey} 
        className="glass-card"
        style={{ 
          marginBottom: '20px', 
          padding: 0, 
          overflow: 'hidden',
          borderColor: isCollapsed ? 'var(--border-color)' : 'rgba(0, 229, 255, 0.4)',
          boxShadow: isCollapsed ? 'none' : '0 8px 30px rgba(0, 229, 255, 0.08)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Collapsible Accordion Header */}
        <div 
          onClick={() => toggleSection(groupKey)}
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            background: isCollapsed ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 255, 135, 0.05))',
            borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isCollapsed ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(0, 255, 135, 0.2))',
              border: isCollapsed ? '1px solid var(--border-color)' : '1px solid var(--accent-cyan)',
              color: isCollapsed ? 'var(--text-muted)' : 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.15rem'
            }}>
              {groupKey}
            </div>
            <div>
              <div style={{ fontSize: '1.12rem', fontWeight: '800', color: isCollapsed ? 'var(--text-main)' : '#fff' }}>
                Group {groupKey} (8-Player Room)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                4 Quarter-Finals → 2 Semi-Finals → 1 Group Final (Winner advances to Final 4)
              </div>
            </div>
            {winner && (
              <span className="badge badge-live" style={{ marginLeft: '4px' }}>
                🏆 Winner: {winner.name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: isCollapsed ? 'var(--text-muted)' : 'var(--accent-cyan)', fontWeight: '600' }}>
              {isCollapsed ? 'Open Room' : 'Collapse'}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: isCollapsed ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isCollapsed ? 'var(--text-muted)' : 'var(--accent-cyan)'
            }}>
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
        </div>

        {/* Collapsible Content Body */}
        {!isCollapsed && (
          <div style={{ padding: '20px' }}>
            <div className="bracket-wrapper">
              <div className="bracket-container">
                {/* Round 1: Quarter-Finals (4 matches) */}
                <div className="bracket-round">
                  <div className="round-header">Quarter-Finals (4 Matches)</div>
                  <div className="round-matches">
                    {qfMatches.map(m => renderMatchCard(m))}
                  </div>
                </div>

                {/* Round 2: Semi-Finals (2 matches) */}
                <div className="bracket-round">
                  <div className="round-header">Semi-Finals (2 Matches)</div>
                  <div className="round-matches">
                    {sfMatches.map(m => renderMatchCard(m))}
                  </div>
                </div>

                {/* Round 3: Group Final (1 match) */}
                <div className="bracket-round">
                  <div className="round-header" style={{ borderColor: 'rgba(0, 255, 135, 0.4)' }}>
                    Group Final (To Final 4)
                  </div>
                  <div className="round-matches">
                    {gfMatches.map(m => renderMatchCard(m))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Grand Finals & Podium Section
  const renderFinalsSection = () => {
    const isCollapsed = openSection !== 'FINALS';
    const grandFinal = finals.grand_final;
    const thirdPlace = finals.third_place;
    const semiFinals = finals.semi_finals || [];

    return (
      <div 
        key="FINALS" 
        className="glass-card"
        style={{ 
          marginBottom: '24px', 
          padding: 0, 
          overflow: 'hidden',
          borderColor: isCollapsed ? 'rgba(255, 190, 11, 0.3)' : 'rgba(255, 190, 11, 0.7)',
          boxShadow: isCollapsed ? 'none' : '0 8px 32px rgba(255, 190, 11, 0.12)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Accordion Header */}
        <div 
          onClick={() => toggleSection('FINALS')}
          style={{
            padding: '18px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            background: isCollapsed ? 'rgba(255, 190, 11, 0.05)' : 'linear-gradient(135deg, rgba(255, 190, 11, 0.22), rgba(0, 255, 135, 0.12))',
            borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 190, 11, 0.25)',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.35), rgba(255, 158, 0, 0.25))',
              border: '1px solid #ffbe0b',
              color: '#ffbe0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffbe0b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Final 4 Championship Room</span>
                <span style={{ fontSize: '0.74rem', background: 'rgba(255, 190, 11, 0.2)', border: '1px solid #ffbe0b', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontWeight: '700' }}>
                  Decides 1st, 2nd, 3rd Podium
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Winners of Group A, B, C, & D clash for the Championship & Cash Prizes
              </div>
            </div>
            {podium.first && (
              <span className="badge badge-gold" style={{ marginLeft: '4px' }}>
                🥇 Champion: {podium.first.name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#ffbe0b', fontWeight: '600' }}>
              {isCollapsed ? 'Open Finals' : 'Collapse'}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255, 190, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffbe0b'
            }}>
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
        </div>

        {/* Accordion Body */}
        {!isCollapsed && (
          <div style={{ padding: '20px' }}>
            {/* Podium Banner if decided */}
            {(podium.first || podium.second || podium.third) && (
              <div style={{ 
                marginBottom: '20px', 
                background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.08), rgba(0, 255, 135, 0.08))',
                border: '1px solid rgba(255, 190, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: '900', color: '#ffbe0b', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Trophy size={20} /> TOURNAMENT PODIUM POSITIONS
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {/* 1st Place */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255, 190, 11, 0.4)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '2px' }}>🥇</div>
                    <div style={{ color: '#ffbe0b', fontWeight: '800', fontSize: '0.76rem', textTransform: 'uppercase' }}>1st Place (Champion)</div>
                    <div style={{ display: 'inline-block', background: 'rgba(255, 190, 11, 0.15)', color: '#ffbe0b', fontWeight: '800', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', margin: '3px 0' }}>
                      ₹500 Cash (+₹300 Group = ₹800)
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '3px' }}>{podium.first ? podium.first.name : 'TBD'}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{podium.first?.team_name || ''}</div>
                  </div>

                  {/* 2nd Place */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192, 192, 192, 0.4)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '2px' }}>🥈</div>
                    <div style={{ color: '#c0c0c0', fontWeight: '800', fontSize: '0.76rem', textTransform: 'uppercase' }}>2nd Place (Runner-up)</div>
                    <div style={{ display: 'inline-block', background: 'rgba(192, 192, 192, 0.15)', color: '#c0c0c0', fontWeight: '800', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', margin: '3px 0' }}>
                      ₹300 Cash (+₹300 Group = ₹600)
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '3px' }}>{podium.second ? podium.second.name : 'TBD'}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{podium.second?.team_name || ''}</div>
                  </div>

                  {/* 3rd Place */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(205, 127, 50, 0.4)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '2px' }}>🥉</div>
                    <div style={{ color: '#cd7f32', fontWeight: '800', fontSize: '0.76rem', textTransform: 'uppercase' }}>3rd Place Winner</div>
                    <div style={{ display: 'inline-block', background: 'rgba(205, 127, 50, 0.15)', color: '#cd7f32', fontWeight: '800', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', margin: '3px 0' }}>
                      ₹200 Cash (+₹300 Group = ₹500)
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '3px' }}>{podium.third ? podium.third.name : 'TBD'}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{podium.third?.team_name || ''}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Final 4 Brackets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Semi-Finals Column */}
              <div>
                <div className="round-header" style={{ borderColor: 'rgba(0, 229, 255, 0.4)', color: 'var(--accent-cyan)' }}>
                  Final 4 Semi-Finals (2 Matches)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {semiFinals.map(m => renderMatchCard(m))}
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
                    {renderMatchCard(grandFinal)}
                  </div>

                  {/* 3rd Place Match */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#cd7f32', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Medal size={16} /> 🥉 3rd Place Playoff (Decides 3rd Position)
                    </div>
                    {renderMatchCard(thirdPlace)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Top Header & Quick Section Jump Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={22} color="var(--accent-gold)" />
            Tournament Knockout Brackets
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            Opening one room automatically collapses the others for a cleaner view
          </p>
        </div>

        {/* Quick Room Jump Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['A', 'B', 'C', 'D'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleSection(g)}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                borderColor: openSection === g ? 'var(--accent-cyan)' : 'var(--border-color)',
                color: openSection === g ? 'var(--accent-cyan)' : 'var(--text-muted)',
                background: openSection === g ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                fontWeight: openSection === g ? '800' : '600'
              }}
            >
              Room {g}
            </button>
          ))}
          <button
            type="button"
            onClick={() => toggleSection('FINALS')}
            className="btn btn-outline"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderColor: openSection === 'FINALS' ? 'var(--accent-gold)' : 'var(--border-color)',
              color: openSection === 'FINALS' ? 'var(--accent-gold)' : 'var(--text-muted)',
              background: openSection === 'FINALS' ? 'rgba(255, 190, 11, 0.15)' : 'transparent',
              fontWeight: openSection === 'FINALS' ? '800' : '600'
            }}
          >
            Final 4
          </button>
          {openSection !== null && (
            <button
              type="button"
              onClick={() => setOpenSection(null)}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '0.76rem', color: 'var(--text-dim)' }}
              title="Collapse all rooms"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Top-to-Bottom Collapsible Rooms & Finals */}
      {renderGroupSection('A')}
      {renderGroupSection('B')}
      {renderGroupSection('C')}
      {renderGroupSection('D')}
      {renderFinalsSection()}
    </div>
  );
}
