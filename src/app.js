import cookieParser from 'cookie-parser';

import { config as envConfig } from 'dotenv';
import express from 'express';

import logger from 'morgan';
import path from 'path';

import indexRouter from './routes';

envConfig();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);

export default app;
