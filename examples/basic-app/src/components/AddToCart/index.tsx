import classes from './AddToCart.module.scss';
import { cart } from '../../lib';

export interface AddToCartProps {
  id: number;
  price: number;
}
function AddToCart(props: AddToCartProps) {
  const addToCardEvent = () => {
    cart.addItem({ ...props, name: '' });
  };

  return (
    <button className={classes.button} onClick={addToCardEvent}>
      Add to Cart
    </button>
  );
}

export default AddToCart;
