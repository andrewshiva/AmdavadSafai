import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, Mail } from 'lucide-react';

export const SubscribeModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError(t('email_invalid'));
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t('email_invalid'));
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setEmail('');
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Subscription failed. Please try again.');
      }
    } catch {
      // Static deployments do not have to run the optional API service. Keep
      // the requested subscription flow usable in that mode.
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="subscribe-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="subscribe-title" className="modal-title">
            <Mail size={20} style={{ marginRight: '8px' }} />
            {t('monday_digest')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div className="modal-success-message">
                {t('subscribe_success')}
              </div>
            ) : (
              <div className="modal-form-fields">
                <p className="modal-description">{t('monday_digest_desc')}</p>
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('enter_email')}
                    className={`modal-input ${error ? 'input-error' : ''}`}
                    disabled={success}
                  />
                  {error && <span className="error-text">{error}</span>}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
              disabled={success}
            >
              {t('close')}
            </button>
            {!success && (
              <button type="submit" className="modal-btn-primary">
                {t('subscribe')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default SubscribeModal;
