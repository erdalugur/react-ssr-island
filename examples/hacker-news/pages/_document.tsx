export default function Document(props: any) {
  const { main: Main, styles: Styles, meta: Meta, scripts: Scripts, pageProps } = props;
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Styles />
      </head>
      <body>
        <Main />
        <Scripts />
      </body>
    </html>
  );
}
