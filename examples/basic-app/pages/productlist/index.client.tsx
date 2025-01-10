import lazyHydrate from 'octopus/hydrator/client';
import AddToCart from '../../src/components/AddToCart';
import ShoppingCart from '../../src/components/ShoppingCart';
lazyHydrate({
  addToCart: AddToCart,
  shoppingCart: ShoppingCart
});
