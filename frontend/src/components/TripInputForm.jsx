import { useState } from 'react';
import { planTrip } from '../api';

function TripInputForm({ onPlanReady }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await planTrip(text);

      if (result.needsClarification){
        setNotice(result.message);
        setText('');
        return;
      }
      onPlanReady(result);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="trip-input glass-panel">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Describe your trip... "
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : '↑'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {notice && <p className = "notice-text">{notice}</p>}
    </div>
  );
}

export default TripInputForm;