import { useEffect, useState } from 'react';
import { cart, CartItem } from '../../lib';

export default function CartModal(props: any) {
  const [open, setOpen] = useState(props.show);
  const [classes, setClasses] = useState<any>({});
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    document.addEventListener('cart-open', (e: any) => {
      import('./CartModal.module.scss').then((m) => {
        setClasses(m.default);
        setOpen(e.detail.open);
      });
      cart.subscribe((items) => setItems(items));
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    open && (
      <>
        <div className={classes.backdrop} onClick={handleClose} />
        <div className={classes.content}>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <div>{item.name}</div>
                <div className={classes.actions}>
                  <span>{item.price}</span>
                  <button onClick={() => cart.removeItem(item.id)}>X</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  );
}
