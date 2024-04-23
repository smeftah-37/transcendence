import { Body, Controller, Get, HttpException, HttpStatus, Param, Post,Delete, Patch, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, BadRequestException } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { RoomService } from './room.service';
import { Room } from './entities/Room';
import { retry } from 'rxjs';
import { response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = path.basename(file.originalname, extension);
        callback(null, `${filename}-${uniqueSuffix}${extension}`);
      },
    }),
  }))
@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService){}

    @Post(':id/avatar')
      async changeAvatar(@Param('id') id: number,@UploadedFile(
      ) avatar: Express.Multer.File) {
        const MAX_AVATAR_SIZE = 4 * 1024 * 1024;
        if (!avatar) {
          console.log("hihaha")
          throw new BadRequestException('Avatar file is required');
        }
    
        if (avatar.size > MAX_AVATAR_SIZE) {
          console.log("hohaha")
          throw new BadRequestException('Avatar file is too large');
        }
    
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
        if (!allowedMimeTypes.includes(avatar.mimetype)) {
          throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF are allowed');
        }
    
        // Now you can use avatar to access the file data
        console.log('heeeeeeeeereee');
        this.roomService.changeAvatar(avatar,id);
      }
    @Get(':id')
    async GetRoomByid(@Param('id') id: number)
    {
        return await this.roomService.getRoom(id);
    }
    @Get('avatar/:id')
    async getAvatarImage(@Param('id') id: number, @Res() res: Response) {
      // Assuming your server is running on port 3000
        const imagePath = await  this.roomService.getAvatar(id);
        try {
          const img = await fs.readFileSync(imagePath);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(img, 'binary');
        } catch (err) {
          res.status(404).send('Image not found');
        }
    }
    @Post()
    async CreateRoom(@Body() body:Room)
    {
      await  this.roomService.addRoom(body)
        return 201;
    }
// Assuming 'avatar' is a field in the request body containing the file data
 
    
    @Patch('kickUser/:id')
    async kickUserOut(@Param('id') id: number, @Body() body:any)
    {
       return  await this.roomService.kickoutUser(id,body.userId,body.ban);

        
    }
    @Patch('MakeAdmin/:id')
    async MakeUserAdmin(@Param('id') id: number, @Body() body:any)
    {
       return  await this.roomService.makeuserAdmin(id,body.userId);

        
    }  @Patch('MuteUser/:id')
    async MuteUser(@Param('id') id: number, @Body() body:any)
    {
       return  await this.roomService.muteUser(id,body.userId,body.timeS,body.timeE);

        
    }
    @Patch('changeName/:id')
    async changeName(@Param('id') id: number, @Body() body:any)
    {
       return  await this.roomService.changeName(body.name, id);

        
    }
    @Get()
    GetAllRooms()
    {
        return this.roomService.findAll();
    }
    @Delete('removeAllRooms')
    async RemoveRooms(): Promise<void>
    {
        await this.roomService.removeAllRooms();
        
    }
    @Get('otherRooms/:id')
    async GetAllOtherPublicRooms(@Param('id') id:number)
    {
        try {
            const otherRooms = await this.roomService.getRoomsThatUserNotJoin(id);
            return otherRooms;
        } catch (error) {
            console.error('Error fetching other rooms:', error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }   
    @Delete('removekamal/:id')
    async RemoveKamal(@Param('id') id:number)
    {
        await this.roomService.removeRoom(id);
    }
    @Delete('removeMuted/:id')
    async RemoveMuted(@Param('id') id:number)
    {
        await this.roomService.deleteMutedUser(id);
    }
    @Post('AddUser')
    async AddUserToRoom(@Body() body: any):Promise<void>
    {
        await this.roomService.addUserToRoom(body.roomId, body.userId,body.socketId);
    }
}