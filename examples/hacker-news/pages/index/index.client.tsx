import 'octopus/client/polyfill';
import hydrate from "octopus/client";
import { lazy } from 'react'

hydrate({
  vote: lazy(() => import('../../src/components/Vote'))
})