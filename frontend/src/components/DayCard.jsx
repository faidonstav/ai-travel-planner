import { Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { getWeatherIcons } from '../utils/WeatherIcons';
import { getOrdinal } from '../utils/ordinal';
import { formatDate } from '../utils/formatDate';

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

function DayCard({ day, dayNumber, onDeleteItem }) {
  return (
    <div className="day-card">
      <p className="day-number">{getOrdinal(dayNumber)} day</p>
      <div className= "weather-icons">
        <h3>{formatDate(day.date)}</h3>
        <img src={getWeatherIcons(day.weather.weatherCode)} alt="weather icon" className="weather-icon-img" />
      </div>
      <p><span className="label">Min Temperature:</span> {day.weather.minTemp}°C</p>
      <p><span className="label">Max Temperature:</span> {day.weather.maxTemp}°C</p>
      <p><span className="label">Rain propability:</span> {day.weather.precipitationChance}% rain</p>
      
      <div className="section">
        <span className="label">Attractions</span>
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
                  {a.name}
                </DraggableItem>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </div>

      <div className="section">
        <span className="label">Restaurants</span>
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
                  {r}
                </DraggableItem>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </div>
    </div>
  );
}

export default DayCard;