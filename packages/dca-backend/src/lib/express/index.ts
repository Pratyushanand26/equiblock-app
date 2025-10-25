import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { Express, NextFunction, Response } from 'express';
import helmet from 'helmet';

import { createVincentUserMiddleware } from '@lit-protocol/vincent-app-sdk/expressMiddleware';
import { getAppInfo, getPKPInfo, isAppUser } from '@lit-protocol/vincent-app-sdk/jwt';

import { handleListPurchasesRoute } from './purchases';
// import {
//   handleListSchedulesRoute,
//   handleEnableScheduleRoute,
//   handleDisableScheduleRoute,
//   handleCreateScheduleRoute,
//   handleDeleteScheduleRoute,
//   handleEditScheduleRoute,
// } from './schedules';

import {
  handleListJobsRoute,
  handleCreateJobRoute,
  handleDeleteJobRoute,
  handleListPriceLogsRoute,
  handleCreateSetPriceJobRoute,
  handleListSetPriceJobsRoute,
  handleDeleteSetPriceJobRoute,
} from './schedules';
import { userKey, VincentAuthenticatedRequest } from './types';
import { env } from '../env';
import { serviceLogger } from '../logger';

const { ALLOWED_AUDIENCE, CORS_ALLOWED_DOMAIN, IS_DEVELOPMENT, VINCENT_APP_ID } = env;

const { handler, middleware } = createVincentUserMiddleware({
  userKey,
  allowedAudience: ALLOWED_AUDIENCE,
  requiredAppId: VINCENT_APP_ID,
});

const corsConfig = {
  optionsSuccessStatus: 204,
  origin: IS_DEVELOPMENT ? true : [CORS_ALLOWED_DOMAIN],
};

const setSentryUserMiddleware = handler(
  (req: VincentAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!isAppUser(req.user.decodedJWT)) {
      throw new Error('Vincent JWT is not an app user');
    }

    Sentry.setUser({
      app: getAppInfo(req.user.decodedJWT),
      ethAddress: getPKPInfo(req.user.decodedJWT).ethAddress,
    });
    next();
  }
);

export const registerRoutes = (app: Express) => {
  app.use(helmet());
  app.use(express.json());

  if (IS_DEVELOPMENT) {
    serviceLogger.info(`CORS is disabled for development`);
  } else {
    serviceLogger.info(`Configuring CORS with allowed domain: ${CORS_ALLOWED_DOMAIN}`);
  }
  app.use(cors(corsConfig));

  // app.get('/purchases', middleware, setSentryUserMiddleware, handler(handleListPurchasesRoute));
  // app.get('/schedules', middleware, setSentryUserMiddleware, handler(handleListSchedulesRoute));
  // app.post('/schedule', middleware, setSentryUserMiddleware, handler(handleCreateScheduleRoute));
  // app.put(
  //   '/schedules/:scheduleId',
  //   middleware,
  //   setSentryUserMiddleware,
  //   handler(handleEditScheduleRoute)
  // );
  // app.put(
  //   '/schedules/:scheduleId/enable',
  //   middleware,
  //   setSentryUserMiddleware,
  //   handler(handleEnableScheduleRoute)
  // );
  // app.put(
  //   '/schedules/:scheduleId/disable',
  //   middleware,
  //   setSentryUserMiddleware,
  //   handler(handleDisableScheduleRoute)
  // );
  // app.delete(
  //   '/schedules/:scheduleId',
  //   middleware,
  //   setSentryUserMiddleware,
  //   handler(handleDeleteScheduleRoute)
  // );


  app.get('/jobs', middleware, setSentryUserMiddleware, handler(handleListJobsRoute));
app.post('/job', middleware, setSentryUserMiddleware, handler(handleCreateJobRoute));
app.delete('/jobs/:jobId', middleware, setSentryUserMiddleware, handler(handleDeleteJobRoute));
app.get('/price-logs', middleware, setSentryUserMiddleware, handler(handleListPriceLogsRoute));
app.post('/set-price-job', middleware, setSentryUserMiddleware, handler(handleCreateSetPriceJobRoute));
app.get('/set-price-jobs', middleware, setSentryUserMiddleware, handler(handleListSetPriceJobsRoute));
app.delete('/set-price-jobs/:jobId', middleware, setSentryUserMiddleware, handler(handleDeleteSetPriceJobRoute));

  serviceLogger.info(`Routes registered`);
};
