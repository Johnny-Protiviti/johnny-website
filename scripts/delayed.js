// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { instagramDelay } from '../blocks/embed/embed.js';
// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
instagramDelay();