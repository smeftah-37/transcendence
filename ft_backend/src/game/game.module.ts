import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Point from './entities/point';
import { Game } from './entities/game';
import { User } from 'src/users/entities/User';
import { DashbordController } from 'src/dashbord/dashbord.controller';
import { DashbordModule } from 'src/dashbord/dashbord.module';
import { DashbordService } from 'src/dashbord/dashbord.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Point, Game])
  ],  
  providers: [GameService,DashbordService],
  controllers: [GameController]
})
export class GameModule {}
