import React, { JSX } from 'react';
export declare function withCache<T extends object>(Component: React.ComponentType<T>): (props: T & {
    ttl?: number;
}) => JSX.Element;
export default withCache;
