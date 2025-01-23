import React from 'react';
interface ErrorProps {
    statusCode: number;
    message: string;
}
export default function Error({ statusCode, message }: ErrorProps): React.JSX.Element;
export {};
