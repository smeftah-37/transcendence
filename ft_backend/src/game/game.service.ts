import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/User';
import { Repository } from 'typeorm/repository/Repository';
import { Game } from './entities/game';
import { InjectRepository } from '@nestjs/typeorm';
import Point from './entities/point';
import { DashbordService } from 'src/dashbord/dashbord.service';

@Injectable()
export class GameService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,@InjectRepository(Game) private readonly gameRepository: Repository<Game>,@InjectRepository(User) private readonly pointRepository: Repository<Point>,private readonly dashbordService: DashbordService){}
    async addGame(body: any): Promise<Game> {
        try {
          const game = new Game();
          const user1 =  await this.userRepository.findOne({where: {id: Number(body.players[0])}});
          const user2 = await this.userRepository.findOne({where: {id: Number(body.players[1])}});

          game.Players = [user1,user2];
          game.status = 1;
          await this.gameRepository.save(game);

          if(!user1.games)
             user1.games = [];
        if(!user2.games)
            user2.games = [];

            user1.games.push(game.id);
            user2.games.push(game.id);

            await this.userRepository.save(user1);
            await this.userRepository.save(user2);

            return game;
         
  
        }
        catch
        {
            
        }
        return null;
    }
    async savePoint(id:number ,body:any): Promise<void>
    {
        const game = await this.gameRepository.findOne({where: {id: Number(id)}, relations: ['DataPlayers','Players']});
        if(game)
        {
        
            const point = new Point();
            point.Playerid= body.Playerid;
            point.Start= body.Start;
            point.End= body.End;
            point.C1=body.C1;
            point.C2=body.C2;
            if(game.Players[0].id == body.Playerid && game.Playerscore1 < 11 )
                game.Playerscore1 += 1;
            else if( game.Players[1].id == body.Playerid &&  game.Playerscore2 < 11)
                game.Playerscore2 += 1;
            await this.pointRepository.save(point);

            if(!game.DataPlayers)
                game.DataPlayers = [];
            game.DataPlayers.push(point);
            await this.gameRepository.save(game);

        }
    }
    async saveGame(id:number , body: any,status: boolean): Promise<void>
    {
        const game = await this.gameRepository.findOne({where: {id: Number(id)}, relations: ['DataPlayers','Players']});
        if(game)
        {
            if(status)
            {
                game.status = 2;
                game.Winner = [body.userId,11];
                game.Loser = [body.looserId,0];
                if(game.Players[0] === body.userId)
                {
                    game.Playerscore1 = 11;
                    game.Playerscore2 = 0;
                }
                else
                {
                    game.Playerscore1 = 0;
                    game.Playerscore2 = 11;
                }
                await this.gameRepository.save(game);
            }
            else
            {
                game.Duration = body.duration;
                game.status = 0;
                game.Winner = [body.winnerId,body.winnerScore];
                game.Loser = [body.looserId,body.looserScore];
                await this.gameRepository.save(game);
                await this.dashbordService.plotGame(game.id);
        }
        const loser = await this.userRepository.findOne({where: {id: Number(game.Loser[0])}});
        const winner = await this.userRepository.findOne({where: {id: Number(game.Winner[0])}});
            if(winner && loser)
            {
                let gainxp1 = 0;
                let gainxp2 = 0;
                loser.lost += 1;
                loser.played += 1;
                winner.won += 1;
                if(game.Loser[1] > 5)
                    gainxp1 += game.Loser[1] * 5;
                else if(game.Loser[1] <= 5)
                    gainxp1 += game.Loser[1] * 2;
                else if (!game.Loser[1])
                    gainxp1 = 0;
                winner.played += 1;
                gainxp2 += (game.Winner[1] - game.Loser[1]) * 10;

                let futurxp1 = loser.xp + gainxp1;
                if(futurxp1 >= 110)
                {
                    loser.xp =futurxp1 - 110  ;
                    loser.lvl+=1;
                }
                else
                    loser.xp += futurxp1;
                let futurxp2 = winner.xp + gainxp2;
                if(futurxp2 >= 110)
                {
                    winner.xp = futurxp2 - 110 ;
                    winner.lvl+=1;
                }
                else
                    winner.xp += futurxp2;
                await this.userRepository.save(loser);
                await this.userRepository.save(winner);

            }
        
        }
        
       

    }
    async getGame(id : number): Promise<Game>
    {
        return await this.gameRepository.findOne({where: {id: Number(id)}, relations: ['Players','DataPlayers']});
    }
}