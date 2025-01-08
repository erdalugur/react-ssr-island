import React, { useState } from 'react';
import styles from './Counter.module.scss';
import Button from '@octopus/ui/Button';
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
      <Button onClick={decrement}>-</Button>
      <span>{counter}</span>
      <Button onClick={increment}>+</Button>
    </div>
  );
}
