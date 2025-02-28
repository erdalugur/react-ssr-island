import classes from './AddToCart.module.scss';
import { cart } from '../../lib';
import Button from 'ui/Button';
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
    <Button className={classes.button} onClick={addToCardEvent}>
      Add to Cart
    </Button>
  );
}

export default AddToCart;
