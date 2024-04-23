import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/Room';
import { User } from 'src/users/entities/User';
import { UsersModule } from 'src/users/users.module';
import { Conversation } from 'src/conversation/entities/conversation';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MessageService } from 'src/message/message.service';
import { Message } from 'src/message/entities/message';
import { ConversationService } from 'src/conversation/conversation.service';
import { MutedUser } from './entities/MutedUser';
import { StorageService } from './storage.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({
    dest: './upload',
  }) , 
    TypeOrmModule.forFeature([Room, User, Conversation, Message, MutedUser])
 ],
  controllers: [RoomController],
  providers: [RoomService, MessageService, ConversationService,StorageService]
})
export class RoomModule { }