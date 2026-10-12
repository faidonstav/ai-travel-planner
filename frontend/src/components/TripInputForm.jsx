import { useState, useRef, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { planTrip } from '../api';
import { formatDate } from '../utils/formatDate';


function toISODate(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function TripInputForm({ onPlanReady }) {
  const [destination, setDestination] = useState('');
  const [range, setRange] = useState(undefined);
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dateFieldRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown ', handleClickOutside);
  }, []);


  async function handleSubmit(e) {
    e.preventDefault(); 
    
    if (!range?.from) {
      setError('Please choose your travel dates.');
      return;
    }

    setLoading(true);
    setError(null);


    try {
      const result = await planTrip({
        destination: destination.trim(),
        startDate: toISODate(range.from),
        endDate: toISODate(range.to || range.from), 
        budget: Number(budget),
        travelers: Number(travelers),
      });
      onPlanReady(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  let dateLabel = 'Add dates';
  if (range?.from) {
    const from = formatDate(toISODate(range.from));
    dateLabel = range.to ? `${from} → ${formatDate(toISODate(range.to))}` : `${from} → …`;
  }

  return (
    <div className="search-wrapper">
      <form className="search-bar glass-panel" onSubmit={handleSubmit}>
        
        <div className="search-field">
          <div className="search-field-label" >
            <img src="src/assets/location.png" alt="location icon" className="search-field-icon-img" />
            <label className="field-label" htmlFor="destination">Destination</label>
          </div>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to"
            autoComplete="off"
            required
          />
        </div>

        <div className="search-field">
          <div className="search-field-label" >
            <img src="src/assets/user.png" alt="location icon" className="search-field-icon-img" />
            <label className='field-label' htmlFor='travelers'>Travelers</label>
          </div>
           <input
            id="travelers"
            type="number"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            placeholder="Number of people"
            required
            />
        </div>

        <div className="search-field date-field" ref={dateFieldRef}>
          <div className="search-field-label" >
            <img src="src/assets/dates.png" alt="location icon" className="search-field-icon-img" />
            <span className="field-label">Dates</span>
          </div>
          <button
            type="button"
            className={`date-trigger ${range?.from ? '' : 'empty'}`}
            onClick={() => setShowCalendar(prev => !prev)}
          >
            {dateLabel}
          </button>

          {showCalendar && (
            <div className="date-popover">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={{ before: today }}
                startMonth={today}
                defaultMonth={range?.from || today}
                numberOfMonths={1}
              />
              <button
                type="button"
                className="date-popover-done"
                onClick={() => setShowCalendar(false)}
                disabled={!range?.from}
              >
                Done
              </button>
            </div>
          )}
        </div>

        <div className="search-field">
          <div className="search-field-label" >
            <img src="src/assets/wallet.png" alt="location icon" className="search-field-icon-img" />
            <label className="field-label" htmlFor="budget">Budget</label>
          </div>
          <input
            id="budget"
            type="number"
            min="1"
            step="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="€"
            required
          />
        </div>

        <button type="submit" className="search-submit" disabled={loading}>
          {loading ? 'Planning…' : 'Plan trip'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default TripInputForm;