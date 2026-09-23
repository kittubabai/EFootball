import React, { useEffect } from 'react';
import { X, Trophy, Medal, Award, Flame, Users, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PrizesModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content glass-card" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '680px', padding: '26px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              background: 'rgba(255, 190, 11, 0.15)', 
              color: 'var(--accent-gold)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(255, 190, 11, 0.25)'
            }}>
              <Trophy size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Tournament Prize Pool
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                32 Players × ₹100 Entry Fee = <strong style={{ color: 'var(--accent-gold)' }}>₹3,200 Total Collection</strong>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close"><X size={22} /></button>
        </div>

        {/* Prize Pool Summary Badges */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.12), rgba(0, 255, 135, 0.08))', 
          border: '1px solid rgba(255, 190, 11, 0.35)', 
          padding: '12px 16px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Prize Money</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-gold)' }}>₹2,400 Cash Prizes</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Special Bonus</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-green)' }}>+ ₹200 Golden Boot</div>
          </div>
        </div>

        {/* Prize Breakdown Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {/* Room Champions */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(0, 229, 255, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: '800' }}>
              <Users size={14} />
              <span>ROOM WINNERS (4 GROUPS)</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: '4px 0' }}>₹300 Each</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Instant ₹300 reward for winning Group A, B, C, or D (4 × ₹300 = <strong>₹1,200</strong>).
            </div>
          </div>

          {/* 1st Place */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 190, 11, 0.45)', boxShadow: '0 0 15px rgba(255, 190, 11, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: '800' }}>
              <Medal size={14} />
              <span>🥇 GRAND CHAMPION (1ST)</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-gold)', margin: '4px 0' }}>₹500 (+₹300) = ₹800</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Finals Championship Winner bonus + Group Winner prize.
            </div>
          </div>

          {/* 2nd Place */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(160, 179, 207, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#a0b3cf', fontWeight: '800' }}>
              <Award size={14} />
              <span>🥈 RUNNER-UP (2ND)</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: '4px 0' }}>₹300 (+₹300) = ₹600</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Finals Runner-up bonus + Group Winner prize.
            </div>
          </div>

          {/* 3rd Place */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 138, 0, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#ff8a00', fontWeight: '800' }}>
              <Award size={14} />
              <span>🥉 3RD POSITION</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: '4px 0' }}>₹200 (+₹300) = ₹500</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              3rd Place Match bonus + Group Winner prize.
            </div>
          </div>

          {/* Golden Boot */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(0, 255, 135, 0.45)', boxShadow: '0 0 15px rgba(0, 255, 135, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--accent-green)', fontWeight: '800' }}>
              <Flame size={14} />
              <span>⚽ GOLDEN BOOT</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-green)', margin: '4px 0' }}>₹200 Cash Award</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Awarded to the tournament's highest individual goal scorer!
            </div>
          </div>

          {/* Organizer Fund */}
          <div style={{ background: 'rgba(4, 8, 16, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '800' }}>
              <Shield size={14} />
              <span>🛡️ ORGANIZER FUND</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-muted)', margin: '4px 0' }}>₹800</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              Covers match hosting, custom room coordination, and administration.
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={16} color="#00ff87" />
            <span>Instant payouts sent directly via UPI / WhatsApp upon match completion.</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-primary" 
            style={{ padding: '6px 16px', fontSize: '0.82rem' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
