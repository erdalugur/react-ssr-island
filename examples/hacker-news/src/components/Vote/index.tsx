import { useState } from 'react';
import classes from './Vote.module.scss';

export default function Vote() {
  const [voted, setVoted] = useState(false);
  return (
    <span
      className={[classes.vote, voted ? classes.voted : classes.normal].join(' ')}
      onClick={() => setVoted((v) => !v)}
    >
      &#9650;
    </span>
  );
}
