import classes from './AddToCart.module.scss';
import { cart } from '../../lib';

export interface AddToCartProps {
  id: number;
  price: number;
  title: string;
}
function AddToCart(props: AddToCartProps) {
  const addToCardEvent = () => {
    cart.addItem({ ...props, name: props.title });
  };

  return (
    <button className={classes.button} onClick={addToCardEvent}>
      Add to Cart
    </button>
  );
}

export default AddToCart;
