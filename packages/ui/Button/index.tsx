import React, { PropsWithChildren } from 'react';
export default function Button({
  children,
  ...props
}: PropsWithChildren<
  /* eslint-disable-next-line no-undef */
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>) {
  return <button {...props}>{children}</button>;
}
