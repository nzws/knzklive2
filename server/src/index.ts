import dotenv from 'dotenv';
dotenv.config();
import '~/utils/check-env';
import { app } from './app';

void app();
