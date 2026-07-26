import { archiveHandlers } from './archive/archive.handler';
import { artworkHandlers } from './artwork/artwork.handler';
import { authHandlers } from './auth/auth.handler';
import { displayHandlers } from './display/display.handler';
import { fileHandlers } from './file/file.handler';
import { loungeHandlers } from './lounge/lounge.handler';
import { personalArtworkHandlers } from './personal-artwork/personalArtwork.handler';
import { userHandlers } from './user/user.handler';

export const handlers = [
  ...authHandlers,
  ...displayHandlers,
  ...artworkHandlers,
  ...loungeHandlers,
  ...userHandlers,
  ...archiveHandlers,
  ...fileHandlers,
  ...personalArtworkHandlers,
];
