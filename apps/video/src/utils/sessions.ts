import { Encoder } from '../services/encoder';

export const sessions = new Map<
  number,
  {
    encoder: Encoder;
    // watchToken: string;
  }
>();
