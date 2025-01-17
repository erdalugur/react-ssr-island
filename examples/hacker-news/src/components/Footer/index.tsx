import classes from './footer.module.scss';
export default function Footer() {
  return (
    <div>
      <footer className={classes.footer}>
        Guidelines | FAQ | Lists | API | Security | Legal | Apply to YC | Contact
      </footer>
      <div className={classes.serverInfo}>
        Rendered at 08:24:43 GMT+0000 (Coordinated Universal Time) with Octopus.
      </div>
    </div>
  );
}
