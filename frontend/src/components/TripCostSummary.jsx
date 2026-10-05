import { calculateTripCosts, formatMoney } from '../utils/dayCosts';

const STATUS_LABELS = {
  under: 'Within budget',
  near: 'Close to the limit',
  over: 'Over budget',
};

function TripCostSummary({ itinerary }) {
  const costs = calculateTripCosts(itinerary);
  const currency = itinerary.currency;

  return (
    <div className="cost-summary">
      <div className="cost-summary-breakdown">
        <h3>Estimated trip cost</h3>
        <ul className="expense-list">
          <li><span>Attractions</span><span>{formatMoney(costs.attractions, currency)}</span></li>
          <li><span>Restaurants</span><span>{formatMoney(costs.restaurants, currency)}</span></li>
          <li><span>Transport</span><span>{formatMoney(costs.transport, currency)}</span></li>
          <li>
            <span>Hotels ({costs.nights} night{costs.nights === 1 ? '' : 's'})</span>
            <span>{costs.hotelsUsed > 0 ? formatMoney(costs.hotel, currency) : 'n/a'}</span>
          </li>
        </ul>
        <p className="expense-total">
          <span>Total</span>
          <span>{formatMoney(costs.total, currency)}</span>
        </p>
      </div>

      <div className="cost-summary-budget">
        <h3>Budget</h3>
        <p className="budget-figures">
          {formatMoney(costs.total, currency)} <span>of</span> {formatMoney(costs.budget, currency)}
        </p>

        <div className="budget-bar">
          <div
            className={`budget-bar-fill ${costs.status}`}
            style={{ width: `${Math.min(costs.percentUsed, 100)}%` }}
          />
        </div>

        <p className={`budget-status ${costs.status}`}>
          {STATUS_LABELS[costs.status]}
        </p>
        <p className="budget-remaining">
          {costs.remaining >= 0
            ? `${formatMoney(costs.remaining, currency)} left (${Math.round(costs.percentUsed)}% used)`
            : `${formatMoney(Math.abs(costs.remaining), currency)} over budget`}
        </p>
        <p className="budget-note">Prices are AI estimates, not quotes.</p>
      </div>
    </div>
  );
}

export default TripCostSummary;