import timeAgo from '../../lib/time-ago';
import { Story } from '../../lib/types';
import Vote from '../Vote';
import classes from './Stories.module.scss';
import withHydrate from 'octopus/hoc/hydrator';

const HydratedVote = withHydrate(Vote, 'vote', 'span');
export default function Stories({ stories, page }: { stories: Story[]; page: number }) {
  return (
    <div>
      {stories.map(({ score, date, id, commentsCount, title, url, user }, i) => (
        <div className={classes.storyItem} key={id}>
          <span className={classes.count}>{i + 1}</span>
          <div className={classes.story}>
            <div className={classes.storyTitle}>
              <HydratedVote />
              <a href={url} target="_blank" rel="noopener noreferrer nofollow">
                {title}
              </a>
              <span
                className={classes.storySource}
                dangerouslySetInnerHTML={{
                  __html: `
                (<a href="${url}" rel="noopener noreferrer nofollow">johnaustin.io</a>)`
                }}
              ></span>
            </div>
            <div className={classes.meta}>
              {score} {plural(score, 'point')} by <span>{user}</span>{' '}
              <a href={`/item/${id}`}>
                <span suppressHydrationWarning>{timeAgo(new Date(date))} ago</span>
              </a>{' '}
              |{' '}
              <a href={`/item/${id}`}>
                {commentsCount} {plural(commentsCount, 'comment')}
              </a>
            </div>
          </div>
        </div>
      ))}
      <div className={classes.footer}>
        <a href={`/news/${page + 1}`}>More</a>
      </div>
    </div>
  );
}
const plural = (n: any, s: any) => s + (n === 0 || n > 1 ? 's' : '');
