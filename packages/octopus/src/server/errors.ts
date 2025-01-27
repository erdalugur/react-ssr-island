export class StaticPagesCantUseGetServerSideProps extends Error {
  constructor(pageName: string) {
    const message = `Static pages cannot use getServerSideProps. Error occurred on page: ${pageName}`;
    super(message);
    this.name = 'StaticPagesCantUseGetServerSideProps';
  }
}
