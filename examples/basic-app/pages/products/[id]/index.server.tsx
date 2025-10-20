import React from 'react';

import { GetStaticProps, GetStaticParams } from 'octopus/types';

export default function Page(props: any) {
  return (
    <>
      <p>Static Page {props.id}</p>
    </>
  );
}

export const getStaticParams: GetStaticParams = async () => {
  return [{ id: '1' }, { id: '2' }];
};
export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {
      id: params.id
    }
  };
};

export function Meta() {
  return <title>Product</title>;
}
