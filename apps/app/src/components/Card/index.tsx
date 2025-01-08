import React from 'react';
import withHydrator from '@octopus/hydrator';
import AddToCard, { AddToCartProps } from '../AddToCart';
import classes from './Card.module.scss';

const LazyAddToCart = withHydrator<AddToCartProps>(AddToCard, 'addToCart');

interface Props {
  title: string;
  description: string;
  price: number;
  id: number;
  img: string;
}
export default function ProductCard(props: Props) {
  return (
    <div className={classes.card}>
      <img className={classes.img} src={props.img} alt="Denim Jeans" />
      <h1>{props.price}</h1>
      <p className={classes.price}>${props.title}</p>
      <p>{props.description}</p>
      <LazyAddToCart price={props.price} id={props.id} />
    </div>
  );
}
