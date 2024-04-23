import { Injectable, Res } from '@nestjs/common';
import { GameController } from 'src/game/game.controller';
import { spawn } from 'child_process';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/game/entities/game';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/User';

import { Controller, Get, Param } from '@nestjs/common';
import { Response } from 'express';
import { writeFile } from 'fs/promises';
@Injectable()
export class DashbordService {
    [x: string]: any;
    constructor(@InjectRepository(Game)private readonly gameRepository: Repository<Game>,@InjectRepository(User) private readonly userRepository: Repository<User>) {
    
    }


    async plotGame(id: number) {
            // Fetch the data needed for plotting from your GameController
            const dataForPlot  = await this.gameRepository.findOne({where: {id: Number(id)}, relations: ['DataPlayers','Players']});

            
            const scriptPath = 'src/dashbord/scripts/test.py';
            
            const dataArgs = [JSON.stringify(dataForPlot)];
            
            const pythonProcess = spawn('python3', [scriptPath, ...dataArgs]);
            
            // Handle stdout data
            pythonProcess.stdout.on('data', (data) => {
                console.log(`Python script stdout: ${data}`);
            });
            
            // Handle stderr data
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python script stderr: ${data}`);
            });
            
            // Handle process exit
            pythonProcess.on('close', (code) => {
                console.log(`Python script process exited with code ${code}`);
            });
            
            return 'Plot generation initiated';
        }

  async plotDash(@Res() res: Response) {
    const dataForPlot = await this.userRepository.find();

    // Write data to a temporary JSON file
    const scriptPath = 'src/dashbord/scripts/test1.py';
            
    const dataArgs = [JSON.stringify(dataForPlot)];
    

    // Spawn Python process with file path as argument
    const pythonProcess = spawn('python3', [scriptPath, ...dataArgs]);
    

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script process exited with code ${code}`);
      
      // Once the PDF is generated, send it as a downloadable response
      
    });
  }
}
    