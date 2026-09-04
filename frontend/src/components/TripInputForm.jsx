import { useState } from 'react';
import { planTrip } from '../api';

function TripInputForm({ onPlanReady }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await planTrip(text);
      onPlanReady(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your trip... e.g. 5 days in Kyoto in September, budget $1500, love food and temples"
        rows={4}
        style={{ width: '100%' }}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Planning...' : 'Plan my trip'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default TripInputForm;