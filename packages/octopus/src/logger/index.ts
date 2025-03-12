class Logger {
  log = (message?: any, ...optionalParams: any[]) => {
    // eslint-disable-next-line no-console
    console.log(message, ...optionalParams);
  };
  time = (label: string) => {
    // eslint-disable-next-line no-console
    console.time(label);
  };
  timeEnd = (label?: string) => {
    // eslint-disable-next-line no-console
    console.timeEnd(label);
  };

  error = (message?: any, ...optionalParams: any[]) => {
    // eslint-disable-next-line no-console
    console.error(message, ...optionalParams);
  };
}
export default new Logger();
