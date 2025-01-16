import 'octopus/client/polyfill';

import hydrate from 'octopus/client';
import AddToCart from '../../src/components/AddToCart';
import ShoppingCart from '../../src/components/ShoppingCart';
import CartModal from '../../src/components/CartModal';

console.log('proccess', process.env)
hydrate({
  addToCart: AddToCart,
  shoppingCart: ShoppingCart,
  cartModal: CartModal
});
