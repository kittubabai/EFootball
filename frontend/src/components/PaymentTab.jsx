import React, { useState } from 'react';
import { QrCode, Copy, Check, IndianRupee, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function PaymentTab({ tournamentStatus, players, onPaymentSubmitted, onSwitchToRegister }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotData, setScreenshotData] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiId = tournamentStatus?.upi_id || 'sayantanbabu2000-1@oksbi';
  const upiName = tournamentStatus?.upi_name || 'Sayantan Chakraborty';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(reader.result);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedPlayerId) {
      setErrorMsg('Please select your registered player name.');
      return;
    }

    if (!utrNumber.trim() && !screenshotData) {
      setErrorMsg('Please provide either the 12-digit UTR/Transaction ID or upload your payment screenshot.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/players/${selectedPlayerId}/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          utr_number: utrNumber.trim(),
          payment_screenshot: screenshotData
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit payment details.');

      setSuccessMsg('Payment confirmation submitted! The admin team will verify your ₹100 payment and confirm your slot in the tournament rooms.');
      setUtrNumber('');
      setScreenshotData('');
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifiedCount = tournamentStatus?.verified_count || 0;
  const maxPlayers = tournamentStatus?.max_players || 32;
  const isPaymentClosed = verifiedCount >= maxPlayers || tournamentStatus?.status !== 'registration';

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <QrCode className="glow-text-green" size={26} />
          Scan & Pay Entry Fee (₹100)
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          First-Come, First-Served: Anyone can register (even &gt;32 players), but tournament slots are locked for the first 32 verified payments. <strong>({verifiedCount} / {maxPlayers} Slots Confirmed)</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left: Clean Cropped QR Code & UPI Details */}
        <div className="glass-card" style={{ textAlign: 'center', padding: '28px 24px', borderColor: 'rgba(0, 229, 255, 0.35)' }}>
          <div style={{ 
            background: '#ffffff', 
            padding: '16px', 
            borderRadius: '16px', 
            display: 'inline-block',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            marginBottom: '16px'
          }}>
            <img 
              src="/payment_qr.png" 
              alt="Scan & Pay UPI QR Code" 
              style={{ width: '220px', height: '220px', display: 'block', borderRadius: '8px', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 135, 0.12)', color: 'var(--accent-green)', padding: '6px 16px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '800', marginBottom: '14px' }}>
            <IndianRupee size={15} /> ₹100 ENTRY FEE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Payee Name: </span>
              <strong>{upiName}</strong>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)', fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>UPI ID: </span>
                <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{upiId}</strong>
              </div>
              <button 
                onClick={handleCopyUpi} 
                className="copy-id-btn"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                title="Copy UPI ID"
                type="button"
              >
                {copiedUpi ? <Check size={14} color="#00ff87" /> : <Copy size={14} />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Submit Transaction / UTR / Screenshot Verification Form */}
        <div className="glass-card" style={{ padding: '28px 24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#00ff87" />
            Submit Payment Confirmation
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '18px' }}>
            After paying ₹100, select your registered player name and provide your 12-digit UTR or upload a screenshot so admin can confirm your slot.
          </p>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {isPaymentClosed ? (
            <div className="alert alert-info" style={{ marginTop: '10px' }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>All 32 Slots Confirmed & Paid!</strong><br />
                All 32 tournament slots are now filled with verified payments. Payment submissions and registrations are officially closed.
              </div>
            </div>
          ) : players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-dim)', marginBottom: '14px' }}>
                You have not registered yet. Please register first, then pay and confirm your slot.
              </p>
              <button 
                onClick={onSwitchToRegister}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                <span>Go to Registration Form</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label className="form-label">Select Your Registered Name *</label>
                <select
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                  required
                >
                  <option value="">-- Choose your registered player --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.efootball_id}) {p.payment_status === 'verified' ? '✓ [Already Verified]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">12-Digit UPI Transaction / UTR Number</label>
                <input 
                  type="text"
                  placeholder="e.g. 427189028193"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value)}
                  className="form-input"
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Found on your GPay / PhonePe / Paytm payment screen.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Payment Screenshot</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      border: '2px dashed rgba(0, 229, 255, 0.3)', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'var(--text-muted)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <UploadCloud size={18} color="#00e5ff" />
                    <span>Choose receipt screenshot image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {screenshotData && (
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '140px', marginTop: '4px' }}>
                      <img 
                        src={screenshotData} 
                        alt="Receipt preview" 
                        style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--accent-green)' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setScreenshotData('')}
                        style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          right: '4px', 
                          background: 'rgba(0,0,0,0.7)', 
                          color: '#ff3366', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: '24px', 
                          height: '24px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
                disabled={loading}
              >
                <span>{loading ? 'Submitting Details...' : 'Confirm ₹100 Payment'}</span>
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Organizer Contact:</strong> You can also send your payment receipt directly to Sayantan on WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}
