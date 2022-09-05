import dotenv from 'dotenv';
dotenv.config();

import { run } from '@dotplants/cli';
import { Config } from './config';

run(Config);
