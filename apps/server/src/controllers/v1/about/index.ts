import { Methods } from 'api-types/api/v1/about';
import type { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1About: APIRoute<never, never, never, Response> = ctx => {
  ctx.body = {
    contact: process.env.CONTACT_INFORMATION || 'Contact information not set'
  };
};
