export function calculateDayCosts(day, travelers = 1, itineraryCurrency, isLastDay = false, hotelOptions = []) {
    const perPersonSum = items =>
        (items || []).reduce((total, item) => total + (Number(item.pricePerPerson) || 0), 0);

    const perPersonAverage = items => {
        if (!items || items.length === 0) return 0;
        return perPersonSum(items) / items.length;
    }

    const attractions = perPersonSum(day.attractions) * travelers;
    const restaurants = perPersonAverage(day.restaurants) * travelers;
    const transport = (Number(day.localTransportPerPerson) || 0) * travelers;

    const pricedHotels = (hotelOptions || []).filter(
       h => Number(h.pricePerNight) > 0 && h.currency === itineraryCurrency
    );
    const averageHotelPrice = pricedHotels.length > 0
        ? pricedHotels.reduce((sum, h) => sum + Number(h.pricePerNight), 0) / pricedHotels.length
        : 0;

    const hotel = isLastDay ? 0 : averageHotelPrice;

    return {
        attractions,
        restaurants,
        transport,
        hotel,
        hotelsUsed: pricedHotels.length,
        total: attractions + restaurants + transport + hotel,
    };
}

export function formatMoney(amount, currency) {
    return `${Math.round(amount)} ${currency}`;
}

export function calculateTripCosts(itinerary) {
  const days = itinerary.days || [];
  const totals = { attractions: 0, restaurants: 0, transport: 0, hotel: 0 };
  let hotelsUsed = 0;

  days.forEach((day, index) => {
    const costs = calculateDayCosts(
      day,
      itinerary.travelers,
      itinerary.currency,
      index === days.length - 1,
      itinerary.hotelOptions
    );
    totals.attractions += costs.attractions;
    totals.restaurants += costs.restaurants;
    totals.transport += costs.transport;
    totals.hotel += costs.hotel;
    hotelsUsed = costs.hotelsUsed;
  });

  const total = totals.attractions + totals.restaurants + totals.transport + totals.hotel;
  const budget = Number(itinerary.budget) || 0;
  const percentUsed = budget > 0 ? (total / budget) * 100 : 0;

  // Adjust the 90 threshold to taste
  let status = 'under';
  if (percentUsed > 100) status = 'over';
  else if (percentUsed >= 90) status = 'near';

  return {
    ...totals,
    total,
    budget,
    remaining: budget - total,
    percentUsed,
    status,
    hotelsUsed,
    nights: Math.max(days.length - 1, 0),
  };
}