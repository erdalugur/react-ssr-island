import React from 'react';
import { GetServerSideProps } from '../types';
import { JsonLogger } from '../logger';

interface ErrorProps {
  statusCode: number;
  message: string;
}
export default function Error({ statusCode, message }: ErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100vh'
      }}
    >
      <h1>{statusCode}</h1>
      <p style={{ fontSize: 24 }}>{message}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res, err }) => {
  const statusCode = res.statusCode;
  const logger = new JsonLogger(err?.context);
  const message = `An error ${statusCode} occurred on server`;
  logger.error(err?.message || message, err?.status);
  return {
    props: {
      statusCode,
      message: message
    }
  };
};
