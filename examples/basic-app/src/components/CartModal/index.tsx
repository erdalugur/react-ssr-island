import { useEffect, useState } from 'react';

export default function CartModal(props: any) {
  const [open, setOpen] = useState(props.show);
  const [classes, setClasses] = useState<any>({});
  useEffect(() => {
    document.addEventListener('cart-open', (e: any) => {
      import('./CartModal.module.scss').then((m) => {
        setClasses(m.default);
        setOpen(e.detail.open);
      });
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    open && (
      <div className={classes.container}>
        <div>
          <p>Cart Modal</p>
          <button onClick={handleClose}>Kapat</button>
        </div>
      </div>
    )
  );
}
