import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { config } from 'dotenv';
import { User } from './users/entities/User';
import { PassportModule } from '@nestjs/passport';
import { DashbordModule } from './dashbord/dashbord.module';
import { MessageController } from './message/message.controller';
import { MessageService } from './message/message.service';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { ConversationModule } from './conversation/conversation.module';
import { Room } from './room/entities/Room';
import { Message } from './message/entities/message';
import { Conversation } from './conversation/entities/conversation';
import { GatewayModule } from './gateway/gateway.module';
import { Game } from './game/entities/game';
import { Rank } from './users/entities/Rank';
import Point from './game/entities/point';
import { GameModule } from './game/game.module';
import { MutedUser } from './room/entities/MutedUser';
import { AuthMiddleware } from './auth/auth.middleware';
import { TokenService } from './auth/token.service';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: '10.13.1.10',

    port: 5432,
    username: 'kremidi',
    password: '080623',
    database: 'ft_transcendence',
    entities: [User, Conversation, Room, Message, Game, Rank, Point, MutedUser],
    synchronize: true,

  }), PassportModule.register({ session: true }),
    AuthModule, UsersModule, DashbordModule, MessageModule, ConversationModule, RoomModule, GatewayModule, GameModule,],
  controllers: [AppController],
  providers: [AppService, TokenService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes except those from AuthModule
    consumer.apply(AuthMiddleware)
      .exclude(
        { path: 'auth', method: RequestMethod.GET },
        { path: 'auth', method: RequestMethod.POST },
        'auth/(.*)',
        { path: 'rooms/avatar/', method: RequestMethod.GET },
        '/rooms/avatar/(.*)',
        { path: 'users/avatar/', method: RequestMethod.GET },
        '/users/avatar/(.*)',
        
        { path: 'dashbord/image/', method: RequestMethod.GET },
        '/dashbord/image/(.*)',


      ).forRoutes('*');
  }
}
