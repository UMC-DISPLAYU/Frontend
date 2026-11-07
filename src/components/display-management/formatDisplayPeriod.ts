const toMonthDay = (date: string) => {
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

export const formatDisplayPeriod = (startDate: string, endDate: string) =>
  `${toMonthDay(startDate)} - ${toMonthDay(endDate)}`;
