import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ShieldCheck } from 'lucide-react';
import { OPEN_SUPPORT_CHAT_EVENT } from './supportChatEvents';

export function LandingSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'agent' | 'user'; text: string }>
  >([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Welcome to Yekis Addis Ababa Support Desk. Ask us anything about Telebirr/CBE Birr milestone escrow, Fayda KYC, or ERCA withholding tax.',
    },
  ]);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpen);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
      {
        id: `a-${Date.now() + 1}`,
        sender: 'agent',
        text: 'Thank you. An Addis Ababa escrow specialist has logged your inquiry and will follow up shortly.',
      },
    ]);
    setInput('');
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            right: '22px',
            bottom: '22px',
            zIndex: 60,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 18px',
            borderRadius: '999px',
            background: '#22c55e',
            color: '#05150b',
            fontWeight: 700,
            fontSize: '13.5px',
            border: 'none',
            boxShadow: '0 12px 30px rgba(34, 197, 94, 0.32)',
            cursor: 'pointer',
          }}
          aria-label="Need help? Open support chat"
        >
          <MessageCircle size={17} />
          <span>Need help?</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Yekis Support Chat"
          style={{
            position: 'fixed',
            right: '22px',
            bottom: '22px',
            zIndex: 80,
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#0b1410',
            color: '#f0fdf4',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'rgba(34, 197, 94, 0.12)',
              borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={17} style={{ color: '#22c55e' }} />
              <strong style={{ fontSize: '13.5px' }}>Yekis Escrow Support</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a99e',
                cursor: 'pointer',
              }}
              aria-label="Close support chat"
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              padding: '14px',
              maxHeight: '240px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background:
                    m.sender === 'user'
                      ? '#22c55e'
                      : 'rgba(255, 255, 255, 0.06)',
                  color: m.sender === 'user' ? '#04130a' : '#e2f1e8',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  maxWidth: '85%',
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '10px 12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about escrow, fees, or KYC..."
              aria-label="Support message"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#fff',
                fontSize: '12.5px',
              }}
            />
            <button
              type="submit"
              aria-label="Send message"
              style={{
                background: '#22c55e',
                color: '#04130a',
                border: 'none',
                borderRadius: '8px',
                padding: '0 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
