import fetchData from './fetch-data';
import { Story } from './types';

export default async function getItem(id: number) {
  const val = await fetchData(`item/${id}`);
  if (val) {
    return transform(val);
  } else {
    return null;
  }
}

export function transform(val: any) {
  if (val) {
    return {
      id: val.id,
      url: val.url || '',
      user: val.by,
      // time is seconds since epoch, not ms
      date: new Date(val.time * 1000).getTime() || 0,
      // sometimes `kids` is `undefined`
      comments: val.kids || [],
      commentsCount: val.descendants || 0,
      score: val.score,
      title: val.title
    } as Story;
  } else {
    return null;
  }
}
