import { useState } from 'react';
import { updateTrip } from '../api';

function ChatPanel({ tripId, onDayUpdated, onItineraryUpdated }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await updateTrip(tripId, message);
      if (result.updatedItinerary) {
        onItineraryUpdated(result.updatedItinerary);
      } else if (result.updatedDay) {
        onDayUpdated(result.updatedDay);
      }
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-panel-wrapper glass-panel">
      <div className="chat-panel">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g. I love seafood — update my suggestions"
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '···' : 'Send'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default ChatPanel;