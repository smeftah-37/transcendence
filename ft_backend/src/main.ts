import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis'
import * as cors from 'cors';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const client = redis.createClient({ url: 'redis://10.13.1.10' });

  // const RedisStore = connectRedis(session);
  client.on('connect', () => console.log("connected to redis"));

  app.setGlobalPrefix('SchoolOfAthensApi/');
  app.use(session({
    secret: 'Hellokikiakikiminisafaeminikamal',
    saveUninitialized: false,
    resave: false,
    // store : new RedisStore({client}),
    cookie: {
      maxAge: 604800000,
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({

    origin: ['http://10.13.1.10:3000', 'http://10.13.1.10:3004', 'http://10.13.1.10:3004'], // Allow requests from this origin

    credentials: true, // Allow sending cookies with the request
  });
  // app.use('*', (_req, res) => {
  //   res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
  // });
  await app.listen(3004, '0.0.0.0');



}
bootstrap();
