import { useState } from 'react';
import { updateTrip } from '../api';

function ChatPanel({ tripId, onItineraryUpdated }) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await updateTrip(tripId, message);
      if (result.updatedItinerary) onItineraryUpdated(result.updatedItinerary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-popup glass-panel">
          <div className="chat-popup-header">
            <span>Update your trip</span>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-panel">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="update my suggestions"
              autoFocus
            />
            <button onClick={handleSend} disabled={loading}>
              {loading ? '···' : 'Send'}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
      )}

      <button
        type="button"
        className="chat-toggle-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5A8.4 8.4 0 1 1 21 11.5z" />
        </svg>
      </button>
    </div>
  );
}

export default ChatPanel;