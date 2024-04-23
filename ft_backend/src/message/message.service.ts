import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {

    constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>,){}
    async CreateMessage(body: Message): Promise<Message>
    {
        const message = new Message();
        message.message = body.message;
        message.sender = body.sender;
        if(body.receiver)
            message.receiver = body.receiver;
        message.timeSent = body.timeSent;
        const createdMessage = await this.messageRepository.save(message);
        return createdMessage;
    }
}
