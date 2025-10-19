import '../../../src/styles/reset.scss';
import React from 'react';
import Header from '../../../src/components/Header';
import ProductList from '../../../src/components/ProductList';
import * as api from '../../../src/api';
import { GetServerSideProps } from 'octopus/types';

export default function Page({ product }: { product: any }) {
  return (
    <>
      <Header />
      <ProductList products={[product]} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const product = await api.getProductById(req.params.slug);
  return {
    props: {
      product,
      slug: req.params.slug
    },
    notFound: Boolean(!product)
  };
};

export function Meta(props: any) {
  const title = `Product Detail For ${props.slug}`
  return <title>{title}</title>;
}
