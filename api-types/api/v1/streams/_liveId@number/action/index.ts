import { AuthorizationHeader } from '../../../../../common/types';

export enum StreamCommand {
  publish = 'publish',
  end = 'end'
}

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: StreamCommand;

    resBody: {
      success: boolean;
    };
  };
};
