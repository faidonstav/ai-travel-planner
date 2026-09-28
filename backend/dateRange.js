function getDateRange(startDate, endDate) {
    const isoPattern  = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoPattern.test(startDate) || !isoPattern.test(endDate)) return [];

    const dates = [];
    const current = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    while (current <= end){
        dates.push(current.toISOString().split('T')[0]);
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
}

module.exports = { getDateRange };