import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation';
import { Repository } from 'typeorm';
import { Message } from 'src/message/entities/message';
import { measureMemory } from 'vm';

@Injectable()
export class ConversationService {
    constructor(@InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>,@InjectRepository(Message) private readonly messageRepository: Repository<Message>){}

    async createConveration(message: Message)
    {
        const conver = new Conversation();
        conver.chat.push(message);
        return this.conversationRepository.save(conver);

    }

    async getAllConversation(conversationId: number): Promise<Message[]>{
        const    conversations =  await this.conversationRepository.findOne({where :{id: conversationId} ,relations:['chat']});
       
        return conversations.chat;
    }
    async getLastMessage(conversationId: number): Promise<Message>
    {
        const message = await this.conversationRepository.createQueryBuilder()
        .relation(Conversation, "chat")
        .of(conversationId)
        .loadOne();
    
      return message;
    }
    async addMessage(message: Message, conversationId: number)
    {
        const conver = await this.conversationRepository.findOne({where: {id: conversationId}});
        if(conver)
        {
            const messages = new Message();
            messages.message = message.message;
            messages.sender = message.sender;
            if(message.receiver)
                messages.receiver = message.receiver;
            messages.timeSent = message.timeSent;
            this.messageRepository.save(messages);
            if (!conver.chat) {
                conver.chat = [];
            }
            conver.chat.push(messages);
            await this.conversationRepository.save(conver);
        }

    }

    async removeConveration(converId: number):Promise<void>
    {
        const con =   await this.conversationRepository.findOne({where: {id: Number(converId)}, relations: ['chat']});
        for (const message of con.chat) {
            
            await this.messageRepository.remove(message);
        }
        
        

    }
 
    async getConversationId(converId: number): Promise<Conversation>
    {
         const conversation = await this.conversationRepository.findOne({where: {id: converId}, relations: ['friend','chat','chat.sender','chat.receiver']});
    
         if (conversation && conversation.chat) {
            conversation.chat.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
   
        return conversation;
    }
}
