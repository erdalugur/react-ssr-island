import ms from 'ms';

const map: any = {
  s: 'seconds',
  ms: 'milliseconds',
  m: 'minutes',
  h: 'hours',
  d: 'days'
};

export default function timeAgo(date?: any) {
  return date ? ms((new Date() as any) - date).replace(/[a-z]+/, (str) => ' ' + map[str]) : '';
}
