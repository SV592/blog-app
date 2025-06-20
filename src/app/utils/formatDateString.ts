/**
 * Formats a date string in 'YYYY-MM-DD' format to 'Month Day, Year'.
 * Example: '2024-06-20' => 'June 20, 2024'
 */
export const formatDateString = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = Number(month) - 1;
  return `${monthNames[monthIndex]} ${Number(day)}, ${year}`;
};