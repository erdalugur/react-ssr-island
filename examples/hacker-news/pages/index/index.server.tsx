import '../../src/styles/reset.scss';
import Header from '../../src/components/Header';
import fetchData from '../../src/lib/fetch-data';
import { transform } from '../../src/lib/get-item';
import { Story } from '../../src/lib/types';
import Stories from '../../src/components/Stories';
import Footer from '../../src/components/Footer';
import Main from '../../src/components/Main';

export default function Page({ stories, page }: { stories: Story[]; page: number }) {
  return (
    <>
      <Header />
      <Main>
        <Stories stories={stories} page={page} />
        <Footer />
      </Main>
    </>
  );
}

export const getServerSideProps = async ({ req }: any) => {
  const page = Number(req.params.page || '1');
  const limit = 30;
  const offset = (page - 1) * limit;
  const storyIds = await fetchData<number[]>('topstories');
  const storiesPromises = storyIds.slice(offset, offset + limit).map(async (id) => {
    const data = await fetchData(`/item/${id}`);
    return transform(data);
  });
  const stories = (await Promise.all(storiesPromises)).filter((x) => x !== null);

  return {
    props: {
      stories: stories,
      page: page
    }
  };
};

export const Meta = () => {
  return (
    <>
      <title>Octopusjs Demo</title>
      <meta name="description" content="Hacker News clone built with the octopus.js islands"></meta>
    </>
  );
};
