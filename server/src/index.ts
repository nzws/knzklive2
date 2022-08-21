import dotenv from 'dotenv';
dotenv.config();
import '@server/utils/check-env';
import { app } from './app';

void app();
