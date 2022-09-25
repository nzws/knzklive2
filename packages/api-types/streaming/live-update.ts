import { CommentPublic, LivePublic } from '../common/types';

export const streamingUrl = (liveId: number | string) =>
  `/websocket/v1/live/${liveId}`;

export interface LiveUpdateMessageBase {
  type: string;
  data: unknown;
}

export interface LiveUpdateCommentCreated extends LiveUpdateMessageBase {
  type: 'comment:created';
  data: CommentPublic;
}

export interface LiveUpdateCommentDeleted extends LiveUpdateMessageBase {
  type: 'comment:deleted';
  data: {
    id: number;
  };
}

export interface LiveUpdateUpdate extends LiveUpdateMessageBase {
  type: 'live:update';
  data: LivePublic;
}

export type LiveUpdateMessage =
  | LiveUpdateCommentCreated
  | LiveUpdateCommentDeleted
  | LiveUpdateUpdate;
