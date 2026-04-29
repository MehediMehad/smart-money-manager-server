const currentDate = new Date();

export const getDayRange = (date: Date = currentDate) => {
    const startDay = new Date(date);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(date);
    endDay.setHours(23, 59, 59, 999);

    return {
        startDay,
        endDay,
    };
};


export const getMonthRange = (year: number, month: number) => {
    return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59, 999),
    };
};

export const getYearRange = (year: number) => {
    return {
        yearStart: new Date(year, 0, 1),
        yearEnd: new Date(year, 11, 31, 23, 59, 59, 999),
    };
};


export const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};
