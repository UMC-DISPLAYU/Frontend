const toMonthDay = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

const toFullDate = (date: string) => date.split('-').join('.');

export const formatDisplayPeriod = (startDate: string, endDate: string) => {
  const isSameYear = startDate.split('-')[0] === endDate.split('-')[0];
  return `${toFullDate(startDate)} - ${isSameYear ? toMonthDay(endDate) : toFullDate(endDate)}`;
};
