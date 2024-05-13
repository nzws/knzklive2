import crypto from 'crypto';

export const generateToken = () => crypto.randomBytes(32).toString('hex');
