import { Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { getWeatherIcons } from '../utils/WeatherIcons';
import { getOrdinal } from '../utils/ordinal';
import { formatDate } from '../utils/formatDate';
import {calculateDayCosts, formatMoney } from '../utils/dayCosts';
 
function DraggableItem({ id, index, onDelete, children }) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        const item = (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={snapshot.isDragging ? 'dragging' : ''}
          >
            <span className="item-text">{children}</span>
            <button
              type="button"
              className="item-delete-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              ✕
            </button>
          </li>
        );

        // While dragging, render into document.body so glass-panel blur ancestors
        // can't throw off the library's position: fixed calculations
        return snapshot.isDragging ? createPortal(item, document.body) : item;
      }}
    </Draggable>
  );
}

function DayCard({ day, dayNumber, travelers, currency, isLastDay, hotelOptions, onDeleteItem }) {
  const costs = calculateDayCosts(day, travelers, currency, isLastDay, hotelOptions);
  return (
    <div className="day-card">
      <div className="day-header">
        <h2 className="day-title">{getOrdinal(dayNumber)} Day</h2>
        <p className="day-date">{formatDate(day.date)}</p>
      </div>
      <h3 className="section-label">Weather</h3>
      <div className= "weather-section">
        <img src={getWeatherIcons(day.weather.weatherCode)} alt="weather icon" className="weather-icon-img" />
        <div className="weather-details">
          <h4><span className="label"></span> {day.weather.minTemp}°C - {day.weather.maxTemp}°C</h4>
          <p><span className="label"></span> {day.weather.precipitationChance}% rain</p>
        </div>
      </div>

      
      <div className="section">
        <h3 className="section-label">Attractions</h3>
        <Droppable droppableId={`attractions|${day.date}`}>
          {(provided, snapshot) => (
            <ul className="item-list" ref={provided.innerRef} {...provided.droppableProps}>
              {day.attractions.length === 0 && !snapshot.isDraggingOver && (
                <li className="coming-soon">Coming soon</li>
              )}
              {day.attractions.map((a, index) => (
                <DraggableItem 
                key={`attractions|${day.date}|${index}`} 
                id={`attractions|${day.date}|${index}`} 
                index={index}
                onDelete={() => onDeleteItem(day.date, 'attractions', index)}
                >
                  {a.name} {a.pricePerPerson >0 ? `${a.pricePerPerson}` : 'Free'}
                </DraggableItem>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </div>

      <div className="section">
        <h3 className="section-label">Restaurants</h3>
        <Droppable droppableId={`restaurants|${day.date}`}>
          {(provided, snapshot) => (
            <ul className="item-list" ref={provided.innerRef} {...provided.droppableProps}>
              {day.restaurants.length === 0 && !snapshot.isDraggingOver && (
                <li className="coming-soon">Coming soon</li>
              )}
              {day.restaurants.map((r, index) => (
                <DraggableItem 
                key={`restaurants|${day.date}|${index}`} 
                id={`restaurants|${day.date}|${index}`} 
                index={index}
                onDelete={() => onDeleteItem(day.date, 'restaurants', index)}
                >
              {r.name} {r.pricePerPerson}
                </DraggableItem>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </div>

      <div className="section expenses">
        <h3 className="section-label">Estimated expenses</h3>
        <ul className="expense-list">
          <li><span>Attractions</span><span>{formatMoney(costs.attractions, currency)}</span></li>
          <li><span>Restaurants (avg of options)</span><span>{formatMoney(costs.restaurants, currency)}</span></li>
          <li><span>Transport</span><span>{formatMoney(costs.transport, currency)}</span></li>
          <li>
            <span>Hotel (avg. of {costs.hotelsUsed})</span>
            <span>
              {isLastDay ? '—'
                : costs.hotelsUsed > 0 ? formatMoney(costs.hotel, currency)
                : 'n/a'}
            </span>
          </li>
        </ul>
        <p className="expense-total">
          <span>Total</span><span>{formatMoney(costs.total, currency)}</span>
        </p>
      </div>
    </div>
  );
}

export default DayCard;