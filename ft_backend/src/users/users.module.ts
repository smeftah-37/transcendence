import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Room } from 'src/room/entities/Room';
import { Conversation } from 'src/conversation/entities/conversation';
import { Message } from 'src/message/entities/message';
import { MessageService } from 'src/message/message.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { GameService } from 'src/game/game.service';
import { Game } from 'src/game/entities/game';
import { DashbordService } from 'src/dashbord/dashbord.service';
import { TwoFactorAuthService } from 'src/auth/A2f/A2f.service';
import { MulterModule } from '@nestjs/platform-express';


@Module({
    imports:[TypeOrmModule.forFeature([User, Conversation,Message,Game]),
    MulterModule.register({
        dest: './uploadAvatar',
      }) ,],
    controllers:[UsersController],
    providers:[UsersService,MessageService,GameService,DashbordService,TwoFactorAuthService],
    exports: [UsersService],
})

export class UsersModule {
}