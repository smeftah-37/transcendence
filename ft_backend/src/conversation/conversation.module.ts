import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation';
import { Message } from 'src/message/entities/message';

@Module({
  imports:[TypeOrmModule.forFeature([Conversation,Message])],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],

})
export class ConversationModule {}
