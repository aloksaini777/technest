import { createRemoteModule } from './createRemoteModule';

export const Chat = createRemoteModule(
  () => import('chat_remote_app/chatSupport'),
  'Chat Support'
);