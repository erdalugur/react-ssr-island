import '../../src/styles/reset.scss';
import React from 'react';
import Header from '../../src/components/Header';
import ProductList from '../../src/components/ProductList';
import * as api from '../../src/api';

export default function Page(props: { products: any[] }) {
  return (
    <>
      <Header />
      <ProductList products={props.products} />
    </>
  );
}



export const getServerSideProps = () => {
  return {
    props: {
      products: api.getProducts()
    }
  };
};


export function Meta(props: any) {
  return <title>Listeleme Sayfası</title>;
}
