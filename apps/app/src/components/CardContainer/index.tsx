import React from 'react';

import classes from './CardContainer.module.scss';

export default function CardContainer(props: any) {
  return <div className={classes.container}>{props.children}</div>;
}
