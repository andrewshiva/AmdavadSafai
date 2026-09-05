import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { lang, setLanguage } = useTranslation();
  const [role, setRole] = useState('citizen'); // 'citizen' or 'officer'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [_otpSent, setOtpSent] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setOtpSent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    // Auto focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            role,
            phone: phone || '+91 98765 43210',
            name: role === 'officer' ? 'Insp. Ramesh Shah (AMC SWM)' : 'Amdavadi Citizen'
          });
        }
        onClose();
      }, 1000);
    }, 600);
  };

  const fillDemoCredentials = () => {
    setPhone('9876543210');
    setOtp(['1', '2', '3', '4', '5', '6']);
    setOtpSent(true);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay login-overlay" onClick={onClose}>
      <div
        className="variant-slab-card variant-login-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Close Button */}
        <button
          type="button"
          className="variant-login-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Top Dark Logo Container */}
        <div className="variant-login-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>

        {/* Header Title */}
        <h2 className="variant-login-title">
          {lang === 'gu' ? 'સ્વાગત છે' : lang === 'hi' ? 'वापस स्वागत है' : 'WELCOME BACK'}
        </h2>
        <p className="variant-login-sub">
          {lang === 'gu'
            ? 'અમદાવાદ સફાઈ અભિયાનમાં તમારું સ્વાગત છે'
            : lang === 'hi'
            ? 'अहमदाबाद सफाई अभियान में आपका स्वागत है'
            : 'Welcome to the Ahmedabad Safai Civic Movement'}
        </p>

        {/* Role Toggle */}
        <div className="variant-login-role-toggle">
          <button
            type="button"
            className={`role-toggle-btn ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => setRole('citizen')}
          >
            {lang === 'gu' ? 'નાગરિક (CITIZEN)' : lang === 'hi' ? 'नागरिक (CITIZEN)' : 'CITIZEN'}
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${role === 'officer' ? 'active' : ''}`}
            onClick={() => setRole('officer')}
          >
            {lang === 'gu' ? 'AMC અધિકારી (OFFICER)' : lang === 'hi' ? 'AMC अधिकारी (OFFICER)' : 'MUNICIPAL OFFICER'}
          </button>
        </div>

        {/* Language Selection */}
        <div className="variant-login-lang-row">
          <span className="login-lang-label">
            {lang === 'gu' ? 'ભાષા પસંદ કરો' : lang === 'hi' ? 'भाषा चुनें' : 'LANGUAGE / ભાષા / भाषा'}
          </span>
          <div className="login-lang-pills">
            <button
              type="button"
              className={`login-lang-btn ${lang === 'gu' ? 'active' : ''}`}
              onClick={() => setLanguage('gu')}
            >
              ગુજરાતી
            </button>
            <button
              type="button"
              className={`login-lang-btn ${lang === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`login-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              ENGLISH
            </button>
          </div>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="variant-login-success-box">
            <CheckCircle2 size={36} className="text-emerald animate-bounce" />
            <h3>
              {lang === 'gu' ? 'સફળતાપૂર્વક લૉગિન થયું!' : lang === 'hi' ? 'सफलतापूर्वक लॉगिन हुआ!' : 'LOGGED IN SUCCESSFULLY'}
            </h3>
            <p>
              {lang === 'gu'
                ? `સ્વાગત છે, ${role === 'officer' ? 'AMC સેનિટેશન ઇન્સ્પેક્ટર' : 'જાગૃત નાગરિક'}!`
                : lang === 'hi'
                ? `स्वागत है, ${role === 'officer' ? 'AMC स्वच्छता निरीक्षक' : 'सचेत नागरिक'}!`
                : `Welcome, ${role === 'officer' ? 'AMC Sanitation Inspector' : 'Active Citizen'}!`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="variant-login-form">
            {/* Phone Input */}
            <div className="variant-login-input-wrap">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                placeholder={lang === 'gu' ? 'મોબાઇલ નંબર દાખલ કરો' : lang === 'hi' ? 'मोबाइल नंबर दर्ज करें' : 'Enter Mobile Number'}
                className="login-phone-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (e.target.value.length >= 10) setOtpSent(true);
                }}
                maxLength={10}
              />
            </div>

            {/* OTP Verification Boxes */}
            <div className="variant-login-otp-section">
              <div className="otp-header-row">
                <span className="otp-label">
                  {lang === 'gu' ? 'ચકાસણી કોડ (OTP)' : lang === 'hi' ? 'सत्यापन कोड (OTP)' : 'VERIFICATION CODE'}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="resend-otp-btn"
                    onClick={fillDemoCredentials}
                    title="Fill test credentials"
                    style={{ color: '#EA580C', fontWeight: 700 }}
                  >
                    ⚡ DEMO OTP
                  </button>
                  <button
                    type="button"
                    className="resend-otp-btn"
                    onClick={() => setOtpSent(true)}
                  >
                    {lang === 'gu' ? 'ફરીથી મોકલો' : lang === 'hi' ? 'पुनः भेजें' : 'RESEND OTP'}
                  </button>
                </div>
              </div>

              <div className="otp-boxes-grid">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-digit-box"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="variant-login-submit-btn"
              disabled={submitting}
            >
              <span>
                {submitting
                  ? (lang === 'gu' ? 'ચકાસી રહ્યું છે...' : lang === 'hi' ? 'सत्यापित कर रहा है...' : 'VERIFYING...')
                  : (lang === 'gu' ? 'પુષ્ટિ કરો અને આગળ વધો' : lang === 'hi' ? 'पुष्टि करें और आगे बढ़ें' : 'CONFIRM & PROCEED')}
              </span>
              <ArrowRight size={16} />
            </button>

            {/* Privacy Disclaimer */}
            <p className="variant-login-disclaimer">
              {lang === 'gu' ? (
                <>સાઇન ઇન કરીને, તમે અમારી <a href="#terms" onClick={(e) => e.preventDefault()}>સેવાની શરતો</a> અને <a href="#privacy" onClick={(e) => e.preventDefault()}>ગોપનીયતા નીતિ</a> સાથે સંમત થાઓ છો</>
              ) : lang === 'hi' ? (
                <>साइन इन करके, आप हमारी <a href="#terms" onClick={(e) => e.preventDefault()}>सेवा की शर्तों</a> और <a href="#privacy" onClick={(e) => e.preventDefault()}>गोपनीयता नीति</a> से सहमत होते हैं</>
              ) : (
                <>BY SIGNING IN, YOU AGREE TO OUR <a href="#terms" onClick={(e) => e.preventDefault()}>TERMS OF SERVICE</a> AND <a href="#privacy" onClick={(e) => e.preventDefault()}>PRIVACY POLICY</a></>
              )}
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
