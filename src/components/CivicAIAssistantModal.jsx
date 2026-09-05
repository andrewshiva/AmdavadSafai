import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../i18n/useTranslation';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const SUGGESTIONS = [
  "How to report uncollected garbage?",
  "What is AMC CCRS 311 helpline?",
  "What is the official resolution SLA?",
  "How to join Sunday cleanup drives?",
  "How do I earn Safai Karma points?"
];

// Markdown element styles tuned for the dark bot bubble
const mdComponents = {
  p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.55 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 800, color: '#F8FAFC' }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#E2E8F0' }}>{children}</em>,
  h1: ({ children }) => <div style={{ fontSize: '14.5px', fontWeight: 800, margin: '6px 0 6px', color: '#FDBA74' }}>{children}</div>,
  h2: ({ children }) => <div style={{ fontSize: '14px', fontWeight: 800, margin: '6px 0 6px', color: '#FDBA74' }}>{children}</div>,
  h3: ({ children }) => <div style={{ fontSize: '13.5px', fontWeight: 800, margin: '4px 0 6px', color: '#FDBA74' }}>{children}</div>,
  h4: ({ children }) => <div style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0 4px', color: '#FED7AA' }}>{children}</div>,
  ul: ({ children }) => <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0 0 8px', paddingLeft: '20px' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: '4px', lineHeight: 1.5 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid #F97316',
      margin: '6px 0 8px',
      padding: '4px 10px',
      background: 'rgba(249, 115, 22, 0.08)',
      borderRadius: '0 6px 6px 0',
      color: '#E2E8F0',
      fontStyle: 'italic'
    }}>
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '6px 0 8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', textAlign: 'left', fontWeight: 700, color: '#FDBA74' }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '4px 8px' }}>
      {children}
    </td>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '10px 0' }} />,
  pre: ({ children }) => (
    <pre style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '6px',
      padding: '8px 10px',
      overflowX: 'auto',
      margin: '6px 0 8px',
      fontSize: '12px'
    }}>
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: '#FB923C', textDecoration: 'underline' }}>
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '4px', padding: '1px 5px', fontSize: '12px', color: '#FDBA74' }}>
      {children}
    </code>
  )
};

export const CivicAIAssistantModal = ({ isOpen = false, onClose }) => {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: lang === 'gu'
        ? 'નમસ્તે! હું અમદાવાદ સફાઈ AI સહાયક છું. હું ફરિયાદ નોંધણી, વોર્ડ કોર્પોરેટર અને સ્વચ્છતા સંબંધિત પ્રશ્નોમાં તમારી મદદ કરી શકું છું. આપણું શહેર, આપણી જવાબદારી!'
        : lang === 'hi'
        ? 'नमस्ते! मैं अहमदाबाद सफाई AI सहायक हूँ। मैं शिकायत पंजीकरण, वार्ड पार्षद और स्वच्छता नियमों में आपकी मदद कर सकता हूँ।'
        : 'Namaste! I am AmdavadSafai AI Assistant. How can I assist you with garbage reporting, ward corporators, or civic services today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply || 'Thank you for your report. AMC Solid Waste Management team has been notified.',
          model: data.model
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      // Graceful offline answer
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'AMC CCRS 311 is available 24/7. You can lodge complaints directly by calling 155303 or via WhatsApp on +91 75678 55303. Under AMC Citizen Charter, standard waste hotspots are addressed within 48 hours.',
        model: 'AmdavadSafai Civic Engine'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay ai-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content ai-modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          height: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#0F172A',
          color: '#F8FAFC',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                AmdavadSafai AI Assistant
              </h3>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Ahmedabad Civic Intelligence & Grievance Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#0B1120'
        }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%'
              }}
            >
              {m.sender === 'bot' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  <Bot size={15} color="#FFFFFF" />
                </div>
              )}

              <div style={{
                background: m.sender === 'user'
                  ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                  : '#1E293B',
                color: '#FFFFFF',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '11px 14px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  whiteSpace: m.sender === 'bot' ? 'normal' : 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word'
                }}>
                  {m.sender === 'bot' ? (
                    <div className="bot-markdown-content" style={{ '& > *:last-child': { marginBottom: 0 } }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={15} color="#FFFFFF" />
              </div>
              <div style={{
                background: '#1E293B',
                borderRadius: '14px',
                padding: '10px 16px',
                fontSize: '12px',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RefreshCw size={13} className="spin" />
                <span>AI Assistant is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '8px 16px',
          background: '#0F172A',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(s)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          background: '#1E293B',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'gu' ? 'તમારો પ્રશ્ન અહીં લખો...' : lang === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Ask about CCRS 311, corporators, SLAs...'}
            disabled={loading}
            style={{
              flex: 1,
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            style={{
              background: inputText.trim() && !loading
                ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: inputText.trim() && !loading ? 'pointer' : 'default',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CivicAIAssistantModal;
