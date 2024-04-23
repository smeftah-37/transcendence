import { Module } from '@nestjs/common';
import { DashbordController } from './dashbord.controller';
import { DashbordService } from './dashbord.service';
import { GameModule } from 'src/game/game.module';
import { GameController } from 'src/game/game.controller';
import { GameService } from 'src/game/game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User';
import Point from 'src/game/entities/point';
import { Game } from 'src/game/entities/game';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersService } from 'src/users/users.service';
import { Conversation } from 'src/conversation/entities/conversation';
import { Message } from 'src/message/entities/message';
import { MessageService } from 'src/message/message.service';
import { TwoFactorAuthService } from 'src/auth/A2f/A2f.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Specify the path to your public directory
    }),    TypeOrmModule.forFeature([Game,User,Conversation,Message]),
  ],

  controllers: [GameController,DashbordController],
  providers: [DashbordService,GameService,UsersService,MessageService,TwoFactorAuthService]
})
export class DashbordModule{}
