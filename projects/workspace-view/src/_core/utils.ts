export function getShortestDateFormatWithHours(date: Date): string {
  const now = new Date(Date.now());
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return 'h:mm a';
  }
  if (date.getFullYear() !== now.getFullYear()) {
    return 'MMM dd, yyyy h:mm a';
  } else {
    return 'MMM dd h:mm a';
  }
}
