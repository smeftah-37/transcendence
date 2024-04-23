import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {

    constructor (private conversationService: ConversationService){}
    @Get(':id')
    async getConversaion(@Param('id') converId: number)
    {
        return this.conversationService.getConversationId(converId);
    }
}
