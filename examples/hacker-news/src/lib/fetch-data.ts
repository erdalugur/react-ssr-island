const fetchData = async <T>(type: string): Promise<T> => {
  const res = await fetch(`${process.env.API_URL}/v0/${type}.json`);
  if (res.status !== 200) {
    throw new Error(`Status ${res.status}`);
  }
  return res.json();
};

export default fetchData;
