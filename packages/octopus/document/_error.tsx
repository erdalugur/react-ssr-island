import React from 'react';

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
