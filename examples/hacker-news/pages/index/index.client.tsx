import 'octopus/client/polyfill';
import hydrate from 'octopus/client';
import Vote from '../../src/components/Vote';

hydrate({
  vote: Vote
});