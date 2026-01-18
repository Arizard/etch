export function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function timeAgoExact(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const days = totalDays;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) parts.push(`${days} days`);
  if (days == 0 && hours > 0) parts.push(`${hours} hours`);
  if (days == 0 && hours == 0 && minutes > 0) parts.push(`${minutes} minutes`);

  return parts.length > 0 ? parts.join(' ') + ' ago' : 'just now';
}

export function getTripColorClass(signature) {
  if (signature === '') {
    return 'tripcode-color-anon';
  }

  let hash = 0;
  let power = 1;
  for (let i = 0; i < signature.length; i++) {
    hash += signature.charCodeAt(i) * power;
    power *= 37;
  }
  return `tripcode-color-${(hash % 24).toString()}`;
}
