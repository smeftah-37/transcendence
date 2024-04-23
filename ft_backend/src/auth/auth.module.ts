import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { FortyTwoStrategy } from './utils/42Strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User';
import { SessionSerializer } from './utils/Serializer';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PassportSerializer } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Conversation } from 'src/conversation/entities/conversation';
import { Message } from 'src/message/entities/message';
import { MessageService } from 'src/message/message.service';
import { TokenService } from './token.service';
import { AuthMiddleware } from './auth.middleware';
import { GameService } from 'src/game/game.service';
import { Game } from 'src/game/entities/game';
import { DashbordService } from 'src/dashbord/dashbord.service';
import { TwoFactorAuthService } from './A2f/A2f.service';

@Module({
  imports:[TypeOrmModule.forFeature([User,Conversation,Message,Game]),UsersModule],
  controllers: [AuthController,],
  providers: [FortyTwoStrategy,{provide: 'AUTH_SERVICE',useClass:AuthService}, SessionSerializer,UsersService,AuthService,JwtService,MessageService,TokenService,GameService,DashbordService,TwoFactorAuthService]
})
export class AuthModule {

}
