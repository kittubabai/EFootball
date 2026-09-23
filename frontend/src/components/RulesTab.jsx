import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, Smartphone, Wifi, Clock, Trophy } from 'lucide-react';

export default function RulesTab() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <BookOpen className="glow-text-green" size={26} />
          Tournament Rules & Match Room Guide
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          Official regulations for the eFootball Mobile 32-Player Knockout Cup
        </p>
      </div>

      {/* Match Configuration Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <Clock size={24} color="#00ff87" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Match Duration</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>7 Minutes</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <Trophy size={24} color="#00e5ff" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Game Mode</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Dream Team</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <Smartphone size={24} color="#ffbe0b" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Mobile (iOS/Android)</div>
        </div>

        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <CheckCircle size={24} color="#9d4edd" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decider Rules</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Extra Time & PK ON</div>
        </div>
      </div>

      {/* Step by step room creation */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone className="glow-text-cyan" size={20} />
          How to Create the Match Room in eFootball Mobile
        </h3>

        <div className="rules-step-card">
          <div className="step-badge">1</div>
          <div>
            <strong>Navigate to Friend Match:</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              From the eFootball home screen, tap <code>Match</code> &gt; <code>Friend Match</code> &gt; <code>Create Match Room</code>.
            </p>
          </div>
        </div>

        <div className="rules-step-card">
          <div className="step-badge">2</div>
          <div>
            <strong>Set Match Settings (Mandatory):</strong>
            <ul style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '18px' }}>
              <li><strong>Match Time:</strong> Exactly <strong>7 Minutes</strong></li>
              <li><strong>Injuries:</strong> OFF</li>
              <li><strong>Extra Time:</strong> ON</li>
              <li><strong>Penalty Shootout (PK):</strong> ON</li>
              <li><strong>Condition:</strong> Normal / Excellent</li>
              <li><strong>Substitutions:</strong> 5 Players (in 3 stoppages)</li>
            </ul>
          </div>
        </div>

        <div className="rules-step-card">
          <div className="step-badge">3</div>
          <div>
            <strong>Invite Your Opponent:</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Set a simple password (e.g. <code>1234</code>). Copy the <strong>8-digit Match Room Number</strong> and send it to your opponent along with the password via WhatsApp.
            </p>
          </div>
        </div>

        <div className="rules-step-card">
          <div className="step-badge">4</div>
          <div>
            <strong>Save Screenshot Proof:</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Both players must take a clear screenshot of the final whistle score screen showing the player names and match statistics. Send this to the Admin team for score verification.
            </p>
          </div>
        </div>
      </div>

      {/* Disconnection & Fair Play Policy */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
          <ShieldAlert size={20} />
          Disconnections & Fair Play Policy
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: '#fff' }}>1. Network Disconnection:</strong>
            <p style={{ marginTop: '2px' }}>
              If a player disconnects before the 15th in-game minute with a 0-0 score, the match must be rematched with the remaining time played. If a disconnection happens after 15 minutes, the player who disconnected forfeits the match unless both players mutually agree to replay.
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>2. Network Latency & Wi-Fi:</strong>
            <p style={{ marginTop: '2px' }}>
              Ensure you are connected to a high-speed stable 4G/5G or Wi-Fi connection. Deliberately lagging or switching networks will lead to immediate disqualification.
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>3. Punctuality:</strong>
            <p style={{ marginTop: '2px' }}>
              Players have a 15-minute grace window from the scheduled fixture time to join the room. Failure to show up results in a walkover (BYE) for the opponent.
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>4. Admin Final Decision:</strong>
            <p style={{ marginTop: '2px' }}>
              In the event of any disputes or ambiguities, the tournament organizer/admin team holds the final and binding decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
