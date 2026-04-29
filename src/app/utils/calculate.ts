export const calculateChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const change = ((current - previous) / previous) * 100;
  const formatted = Number(change.toFixed(1));

  return `${formatted > 0 ? '+' : ''}${formatted}%`;
};
