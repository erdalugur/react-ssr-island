import React from 'react';
import classes from './Header.module.scss';

export default function Header() {
  return (
    <>
      <header className={classes.container}>
        <div className={classes.headerLeft}>
          <a href="/">
            <span className={classes.logo}>
              <span className={classes.logoText}>N</span>
            </span>
            <span className={classes.siteTitle}>Hacker News</span>
          </a>
          <div className={classes.nav}>
            <ul className={classes.ul}>
              <li>
                <span>new</span>
              </li>
              <li>
                <span>past</span>
              </li>
              <li>
                <span>show</span>
              </li>
              <li>
                <span>ask</span>
              </li>
              <li>
                <span>show</span>
              </li>
              <li>
                <span>jobs</span>
              </li>
              <li>
                <span>submit</span>
              </li>
            </ul>
          </div>
        </div>
        <div className={classes.headerRight}>
          <span>login</span>
        </div>
      </header>
    </>
  );
}
