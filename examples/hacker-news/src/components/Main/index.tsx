import classes from './Main.module.scss';

export default function Main(props: any) {
  return <div className={classes.main}>{props.children}</div>;
}
