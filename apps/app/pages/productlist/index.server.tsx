import '../../src/styles/reset.scss';
import React from 'react';
import withCache from '@octopus/hydrator/cache';
import Header from '../../src/components/Header';
import ProductCard from '../../src/components/Card';
import CardContainer from '../../src/components/CardContainer';

const ProductList = (props: { products: any[] }) => {
  return (
    <CardContainer>
      {props.products.map((p, i) => (
        <ProductCard key={i} {...p} />
      ))}
    </CardContainer>
  );
};

const CachedHeader = withCache(Header);

const CachedProductList = withCache(ProductList);
export default function Page(props: { products: any[] }) {
  return (
    <>
      <CachedHeader />
      <CachedProductList products={props.products} />
    </>
  );
}

function getRandomTitle(index: number) {
  return `Denim Jeans`;
}

function getRandomDescription() {
  return 'Some text about the jeans. Super slim and comfy lorem ipsum lorem jeansum. Lorem jeamsun denim lorem jeansum.';
}

function generateArrayOfObjects(count = 1000) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      title: getRandomTitle(i),
      description: getRandomDescription(),
      img: 'https://www.w3schools.com/w3images/jeans3.jpg',
      price: 5500
    });
  }
  return items;
}

export const getServerSideProps = () => {
  return {
    props: {
      products: generateArrayOfObjects()
    }
  };
};
export function Meta(props: any) {
  return <title>Listeleme Sayfası</title>;
}
