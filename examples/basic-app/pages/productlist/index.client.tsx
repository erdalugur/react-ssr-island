import lazyHydrate from 'octopus/hydrator/client';
import AddToCart from '../../src/components/AddToCart';
import ShoppingCart from '../../src/components/ShoppingCart';

import getConfig from 'octopus/config';
console.log('getConfig', getConfig())
lazyHydrate({
  addToCart: AddToCart,
  shoppingCart: ShoppingCart
});
