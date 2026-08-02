import { agreementHandlers } from './handlers/agreement';
import { archiveHandlers } from './handlers/archive';
import { artistHandlers } from './handlers/artist';
import { artworkHandlers } from './handlers/artwork';
import { authHandlers } from './handlers/auth';
import { displayHandlers } from './handlers/display';
import { displayContentHandlers } from './handlers/displayContent';
import { fileHandlers } from './handlers/file';
import { healthHandlers } from './handlers/health';
import { loungeHandlers } from './handlers/lounge';
import { personalArtworkHandlers } from './handlers/personalArtwork';
import { userHandlers } from './handlers/user';
import { passthroughHandlers } from './passthrough';

export const handlers = [
  ...passthroughHandlers,
  ...healthHandlers,
  ...authHandlers,
  ...userHandlers,
  ...displayHandlers,
  ...loungeHandlers,
  ...agreementHandlers,
  ...archiveHandlers,
  ...artistHandlers,
  ...artworkHandlers,
  ...displayContentHandlers,
  ...fileHandlers,
  ...personalArtworkHandlers,
];
