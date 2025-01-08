import React from 'react';
import classes from './Header.module.scss';
import ShoppingCart from '../ShoppingCart';
import withHydrator from '@octopus/hydrator';

const HydratedShoppingCart = withHydrator(ShoppingCart, {
  name: 'shoppingCart',
  hydrationType: 'domcontentloaded'
});
export default function Header() {
  return (
    <div className={classes.container}>
      <a href="/">Ana Sayfa</a>
      <HydratedShoppingCart />
    </div>
  );
}
