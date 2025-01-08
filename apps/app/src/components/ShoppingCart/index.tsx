import { useEffect, useState } from 'react';
import { cart } from '../../lib';

export default function ShoppingCart() {
  const [items, setItems] = useState<{ price: number; id: number }[]>([]);

  useEffect(() => {
    cart.subscribe((items) => setItems(items));
  }, []);
  return (
    <div>
      <span>Sepetiniz: {items.length}</span>
    </div>
  );
}
