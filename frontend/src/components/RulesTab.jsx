import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, Smartphone, Calendar, Clock, Trophy, IndianRupee, Users, Sparkles, Zap } from 'lucide-react';

export default function RulesTab() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <BookOpen className="glow-text-green" size={26} />
          Pantihal Cup Tournament Regulations
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          Official rules for the 32-player 4-Group Championship on 18th October 2026
        </p>
      </div>

      {/* Quick Specs Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
          <Calendar size={22} color="#00ff87" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Match Date</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>18th Oct 2026</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(0, 229, 255, 0.3)' }}>
          <Clock size={22} color="#00e5ff" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Match Duration</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>14 Mins (7m/half)</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(0, 255, 135, 0.4)' }}>
          <Sparkles size={22} color="#00ff87" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Player Condition</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#00ff87' }}>🟢 Excellent Only</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(255, 190, 11, 0.3)' }}>
          <IndianRupee size={22} color="#ffbe0b" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Entry Fee</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>₹100 Per Player</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(157, 78, 221, 0.3)' }}>
          <Users size={22} color="#9d4edd" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Room Format</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>4 × 8-Player Rooms</div>
        </div>
      </div>

      {/* Special Feature: Player Condition Excellent Rule */}
      <div className="glass-card" style={{ 
        marginBottom: '24px', 
        borderColor: 'rgba(0, 255, 135, 0.45)', 
        background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.08), rgba(0, 229, 255, 0.06))',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 255, 135, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={24} color="#00ff87" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-green)', marginBottom: '6px' }}>
              🟢 Fair Play Rule: Player Condition Must Be "Excellent" Only
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              To ensure 100% competitive fairness, room hosts <strong>must select "Condition: Excellent"</strong> when hosting the match room. No participant will suffer from random off-form penalties (down/red arrows). Every single player in your Dream Team squad will have the <strong>upward green arrow (🟢 peak form)</strong> so games are decided entirely by skill and tactics!
            </p>
          </div>
        </div>
      </div>

      {/* 8-Player Room System Explained */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} color="#ffbe0b" />
          Tournament Format: 4 Custom Rooms (8 + 8 + 8 + 8) & Final 4
        </h3>

        <div className="rules-step-card">
          <div className="step-badge">1</div>
          <div>
            <strong>Phase 1: Four 8-Player Custom Rooms (11:00 AM)</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Because eFootball Mobile custom friend match rooms support up to 8 players, all 32 players will be split into <strong>4 distinct custom rooms (Group A, Group B, Group C, and Group D)</strong> with 8 players each.
            </p>
          </div>
        </div>

        <div className="rules-step-card">
          <div className="step-badge">2</div>
          <div>
            <strong>Phase 2: 4 Group Winners Emerge</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              In each 8-player room, players compete through Quarter-Finals, Semi-Finals, and Group Finals. Exactly <strong>1 champion emerges from each group</strong> (4 group winners in total).
            </p>
          </div>
        </div>

        <div className="rules-step-card">
          <div className="step-badge">3</div>
          <div>
            <strong>Phase 3: Final 4 Championship Room (Decides 1st, 2nd, and 3rd Position)</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              The 4 group champions meet in the grand Final 4 custom room:
            </p>
            <ul style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', paddingLeft: '20px' }}>
              <li><strong>Semi-Final 1:</strong> Winner Group A vs Winner Group B</li>
              <li><strong>Semi-Final 2:</strong> Winner Group C vs Winner Group D</li>
              <li><strong>Grand Final:</strong> Winners of SF1 and SF2 battle to crown <strong>🥇 1st Place (Champion)</strong> and <strong>🥈 2nd Place (Runner-up)</strong>!</li>
              <li><strong>3rd Place Playoff:</strong> Runners-up of SF1 and SF2 clash to decide <strong>🥉 3rd Place</strong>!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Match Room Settings Checklist */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone className="glow-text-cyan" size={20} />
          In-Game Room Settings Checklist
        </h3>

        <ul style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.9' }}>
          <li><strong>Match Duration:</strong> Exactly <strong>14 Minutes Total (7-Min 1st Half + 7-Min 2nd Half)</strong>.</li>
          <li><strong>Condition (Form):</strong> <strong>EXCELLENT ONLY (🟢 Up Green Arrow)</strong> — Mandatory for all matches.</li>
          <li><strong>Mode:</strong> Dream Team.</li>
          <li><strong>Extra Time:</strong> ON (Mandatory in knockout ties).</li>
          <li><strong>Penalty Shootout (PK):</strong> ON (Mandatory if still tied after extra time).</li>
          <li><strong>Injuries:</strong> OFF.</li>
          <li><strong>Substitutions:</strong> 5 Players (in 3 stoppage intervals).</li>
        </ul>
      </div>

      {/* Disconnection & Entry Fee Policies */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
          <ShieldAlert size={20} />
          Entry Fee & Fair Play Policies
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: '#fff' }}>1. Entry Fee Verification:</strong>
            <p>Every player pays ₹100 via UPI QR code and submits their 12-digit UTR or screenshot. Only verified players are admitted into the tournament match rooms.</p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>2. Punctuality on 18th October:</strong>
            <p>Matches begin promptly at 11:00 AM. Players must be inside their respective 8-player custom room within 10 minutes of room code announcement. Failure to attend results in a walkover.</p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>3. Network Disconnection:</strong>
            <p>If a disconnect occurs before the 15th in-game minute at 0-0, the match will be restarted. Otherwise, the disconnecting player forfeits the match.</p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>4. Screenshot Reporting:</strong>
            <p>Both players must capture a screenshot of the full-time score screen and share it in the group or with the admin team for official bracket progression.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
