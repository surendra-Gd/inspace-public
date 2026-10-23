import moment from 'moment';

export function useDates(fromDate) {
    const today = moment().startOf('day'); // Normalize to start of the day
    const start = moment(fromDate, moment.ISO_8601, true).startOf('day'); // Strict parsing and normalization

    if (!start.isValid()) {
        console.error("Invalid fromDate provided:", fromDate);
        return [];
    }

    if (start.isAfter(today)) {
        console.warn("fromDate is in the future.");
        return [];
    }

    const calendarData = [];
    let currentDay = start.clone();

    while (currentDay.isBefore(today) || currentDay.isSame(today, 'day')) {
        const monthNameYear = currentDay.format('MMMM YYYY'); // Format as "Month Year"

        let monthObj = calendarData.find(item => item.month === monthNameYear);
        if (!monthObj) {
            monthObj = { month: monthNameYear, days: [] };
            calendarData.push(monthObj);
        }

        monthObj.days.push({
            day: currentDay.date(),
            date: currentDay.format('YYYY-MM-DD')
        });

        currentDay.add(1, 'days');
    }
    return calendarData.reverse();
}