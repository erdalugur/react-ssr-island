import React, { useState } from 'react';
import styles from './Counter.module.scss';

export interface CounterProps {
  count: number;
}

export default function Counter(props: CounterProps) {
  const [counter, setCounter] = useState(props.count);

  const increment = () => {
    setCounter((c) => c + 1);
  };
  const decrement = () => {
    setCounter((c) => c - 1);
  };
  return (
    <div className={styles.container}>
      <button onClick={decrement}>-</button>
      <span>{counter}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
