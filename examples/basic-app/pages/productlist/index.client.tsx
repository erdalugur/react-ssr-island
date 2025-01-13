import lazyHydrate from 'octopus/hydrator/client';
import AddToCart from '../../src/components/AddToCart';
import ShoppingCart from '../../src/components/ShoppingCart';
import CartModal from '../../src/components/CartModal';

lazyHydrate({
  addToCart: AddToCart,
  shoppingCart: ShoppingCart,
  cartModal: CartModal
});
