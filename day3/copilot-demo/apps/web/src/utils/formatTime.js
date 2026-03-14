const DIVISIONS = [
  { amount: 60, name: 'second' },
  { amount: 60, name: 'minute' },
  { amount: 24, name: 'hour' },
  { amount: 7, name: 'day' },
  { amount: 4.34524, name: 'week' },
  { amount: 12, name: 'month' },
  { amount: Number.POSITIVE_INFINITY, name: 'year' },
];

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(dateString) {
  let duration = (new Date(dateString) - new Date()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return '';
}
