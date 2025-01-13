import { useEffect, useState } from 'react';
import { cart } from '../../lib';

export default function ShoppingCart() {
  const [items, setItems] = useState<{ price: number; id: number }[]>([]);

  useEffect(() => {
    cart.subscribe((items) => setItems(items));
  }, []);

  const openCart = () => {
    document.dispatchEvent(new CustomEvent('cart-open', { detail: { open: true } }));
  };
  return (
    <div onClick={openCart}>
      <span>Sepetiniz: {items.length}</span>
    </div>
  );
}
