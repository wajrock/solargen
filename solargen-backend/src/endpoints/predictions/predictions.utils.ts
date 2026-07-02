type MonthlyDataEntry = {
    timestamp: string;
    _sum: {solar_generation: number | null};
    _avg: {capacity_factor: number | null};
};

type HourlyMonthlyAvg = {
    solar_generation: number;
    capacity_factor: number;
};

// Date: date in YYYY-MM-DD format
// Return: date in YYYY-MM format
export function getYearAndMonth(date: string) {
    return date.slice(0, 7);
}

// monthlyData: records grouped by hour for the entire month
// timestamp: date in YYYY-MM-DDTHH:MM format
export function getHourlyAverage(
    monthlyData: MonthlyDataEntry[],
    timestamp: string,
): {solar_generation: number; capacity_factor: number} {
    const timestampHour = timestamp.slice(11, 16);
    const monthlyHourMatches = monthlyData.filter((d) => d.timestamp.slice(11, 16) === timestampHour);

    const hourlyAvgSolarGeneration =
        monthlyHourMatches.reduce((sum, hour) => sum + (hour._sum.solar_generation ?? 0), 0) /
        monthlyHourMatches.length;
    const hourlyAvgCapacityFactor =
        monthlyHourMatches.reduce((sum, hour) => sum + (hour._avg.capacity_factor ?? 0), 0) / monthlyHourMatches.length;

    return {
        solar_generation: parseFloat(hourlyAvgSolarGeneration.toFixed(2)),
        capacity_factor: parseFloat(hourlyAvgCapacityFactor.toFixed(3)),
    };
}

export function getMonthlyAvgDaily(hourly: {production: {monthly_avg: HourlyMonthlyAvg}}[]): {
    solar_generation: number;
    capacity_factor: number;
} {
    const solar = parseFloat(hourly.reduce((s, h) => s + h.production.monthly_avg.solar_generation, 0).toFixed(2));
    const cf = parseFloat(
        (hourly.reduce((s, h) => s + h.production.monthly_avg.capacity_factor, 0) / hourly.length).toFixed(3),
    );
    return {solar_generation: solar, capacity_factor: cf};
}
