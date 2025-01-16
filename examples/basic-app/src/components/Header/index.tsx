import React from 'react';
import classes from './Header.module.scss';
import ShoppingCart from '../ShoppingCart';
import withHydrator from 'octopus/hoc/hydrator';
import CartModal from '../CartModal';

const HydratedShoppingCart = withHydrator(ShoppingCart, {
  name: 'shoppingCart',
  hydrationType: 'domcontentloaded'
});

const HydratedCartModal = withHydrator(CartModal, {
  hydrationType: 'domcontentloaded',
  name: 'cartModal'
});

export default function Header() {
  return (
    <>
      <HydratedCartModal />
      <div className={classes.container}>
        <a href="/">Ana Sayfa</a>
        <HydratedShoppingCart />
      </div>
    </>
  );
}
