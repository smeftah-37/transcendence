import { InjectRepository } from '@nestjs/typeorm';
import { GameController } from 'src/game/game.controller';
import { spawn } from 'child_process';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { DashbordService } from './dashbord.service';

@Controller('dashbord')
export class DashbordController {
  constructor(private readonly dashbordService: DashbordService){}
    @Get('/generate-plot/:id')
    async generatePlot(@Param('id') id: number): Promise<string> 
    {
      return this.dashbordService.plotGame(id)
    }
    @Get('/report')
    async generateReport(@Res() res: Response) {
       await this.dashbordService.plotDash(res);
  
     
    }
    @Get('image/:gameid/1')
    async getImageOne(@Param('gameid') gameid: string, @Res() res: Response) {
      const imagePath = await `${gameid}_1.png`; 
      try {
        const img = await fs.readFileSync(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img, 'binary');
      } catch (err) {
        res.status(404).send('Image not found');
      }
    }
    @Get('image/:gameid/2')
    async getImageTwo(@Param('gameid') gameid: string, @Res() res: Response) {
      const imagePath = await `${gameid}_2.png`;  // Change the path accordingly
      try {
        const img = await fs.readFileSync(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img, 'binary');
      } catch (err) {
        res.status(404).send('Image not found');
      }
    }
    @Get('image/:gameid/3')
    async getImageThree(@Param('gameid') gameid: string, @Res() res: Response) {
      const imagePath = await `${gameid}_3.png`;  // Change the path accordingly
      try {
        const img = await fs.readFileSync(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img, 'binary');
      } catch (err) {
        res.status(404).send('Image not found');
      }
    }
    @Get('image/:gameid/4')
    async getImageFour(@Param('gameid') gameid: string, @Res() res: Response) {
      const imagePath = await `${gameid}_4.png`;  // Change the path accordingly
      try {
        const img = await fs.readFileSync(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img, 'binary');
      } catch (err) {
        res.status(404).send('Image not found');
      }
    }
  }