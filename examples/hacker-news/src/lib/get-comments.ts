import fetchData from './fetch-data';

// hydrate comments based on an array of item ids
export default function fetch(ids: number[]): Promise<any[]> {
  return Promise.all(
    ids.map(async (id) => {
      const val = await fetchData<any>(`item/${id}`);
      return {
        id: val.id,
        user: val.by,
        text: val.text,
        date: new Date(val.time * 1000).getTime() || 0,
        comments: await fetch(val.kids || []),
        commentsCount: val.descendants || 0
      };
    })
  );
}
