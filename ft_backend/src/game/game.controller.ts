import { Get, Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {

    constructor(private readonly gameService: GameService){}

    @Post('create')
    async createGame(@Body() body:any)
    {
      return  await this.gameService.addGame(body);
    }

    @Get(':id')
    async GetGameId(@Param('id') id:number)
    {
        return await this.gameService.getGame(id);
    }

    @Patch('editPoint/:id')
    async SavePointId(@Param('id') id:number, @Body() body:any)
    {
      await this.gameService.savePoint(id,body);
    }

    @Patch('saveGame/:id')
    async SaveGameId(@Param('id') id:number, @Body() body:any)
    {
      await this.gameService.saveGame(id,body,false);
    }
}


