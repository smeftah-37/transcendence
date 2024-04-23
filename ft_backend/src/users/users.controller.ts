import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { REQUEST } from '@nestjs/core';
import { Response } from 'express';

import { Conversation } from 'src/conversation/entities/conversation';
import { User } from './entities/User';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';



@UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
        destination: './uploadAvatar',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = path.basename(file.originalname, extension);
            callback(null, `${filename}-${uniqueSuffix}${extension}`);
        },
    }),
}))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post(':id')
    async changeAvatar(@Param('id') id: number, @UploadedFile(
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
            console.log("hahaha")
            throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF are allowed');
          }
          console.log('hhhhhhhhhhhheeeeeeeeeeeeee');
      // Now you can use avatar to access the file data
      this.usersService.changeAvatar(avatar,id);
    }

    @Get('avatar/:id')
    async getAvatarImage(@Param('id') id: number, @Res() res: Response) {
        // Assuming your server is running on port 3000
        const imagePath = await this.usersService.getAvatar(id);
        console.log(imagePath);
        try {
            const img = await fs.readFileSync(imagePath);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(img, 'binary');
        } catch (err) {
            res.status(404).send('Image not found');
        }
    }

    @Get('avatar/C/:charact')
    async getAvatarCharact(@Param('charact') name: string, @Res() res: Response) {
        const imagePath = './uploadAvatar/assets/' + name + '.png';
        try {
            const img = await fs.readFileSync(imagePath);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(img, 'binary');
        } catch (err) {
            res.status(404).send('Image not found');
        }
    }


    @Get(':id/conversation')
    async getConversation(@Param('id') id: number) {
        return this.usersService.getAllConversationThanUser(id);
    }
    @Get()
    findAllUsers() {
        return this.usersService.findAll();
    }
    @Get(':id/friendConversation/:idf')
    async getConversationByfriendId(@Param('id') id: number, @Param('idf') idf: number,) {
        return this.usersService.getConversationThanFriend(id, idf);
    }
    @Patch('createConversation')
    async CreateConversation(@Body() body: any): Promise<Conversation> {
        return await this.usersService.createConversation(body.message, body.friendId, body.userId);

    }
    @Get(':id/DeleteConversation')
    async deleteOneConversation(@Param('id') id: number, @Body() body: any) {
        await this.usersService.deleteOneUserConversation(id, body.convId);
    }
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.usersService.findOne(id);
    }
    @Get(':id/rooms/')
    async getAllRooms(@Param('id') id: number) {
        return await this.usersService.getRoomsThanUser(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.usersService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body) {
        return this.usersService.update(id, body);
    }

    @Get(':id/remove')
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
    @Get(':id/removeFriends')
    removeFriend(@Param('id') id: number) {
        return this.usersService.removeAllFriend(id);
    }
    @Delete(':id/deleteConversation')
    async removeConversation(@Param('id') id: number) {
        return await this.usersService.deleteUserConversation(id);
    }

    @Patch(':id/Deblock/:idf')
    async deblockFriend(@Param('id') id: number, @Param('idf') idf: number) {
        await this.usersService.deblockUser(id, idf);
    }

    @Patch(':id/Invitation')
    async getInvitaion(@Param('id') id: number, @Body() body: any) {
        await this.usersService.getInvitationFriend(id, body.to);
    }

    @Get(':id/getInvitationThanUser')
    async getAllInvitaion(@Param('id') id: number): Promise<User[]> {
        return await this.usersService.getAllInvitation(id);
    }
    @Patch(':id/chooseChar')
    async updateAvatar(@Param('id') id: number, @Body() userInfo: any): Promise<User> {
        return await this.usersService.chooseChar(id, userInfo);
    }
    @Get('getblocked/:id')
    async GetBlocked(@Param('id') id: number) {
        return await this.usersService.getBlockedusers(id);
    }
    @Get(':id/getInvitationPlay')
    async getGameInvitaion(@Param('id') id: number): Promise<User[]> {
        return await this.usersService.getAllGameInvitation(id);
    }
    @Get(':id/games')
    async GetUsersGame(@Param('id') id: number) {
        return await this.usersService.getusersGames(id);
    }
    @Get(':id/friends')
    async GetUsersFriends(@Param('id') id: number) {
        return await this.usersService.getusersFriends(id);
    }
    @Patch(':id/InvitationToPlay')
    async getInvitaionToPlay(@Param('id') id: number, @Body() body: any) {
        await this.usersService.getInvitationToPlay(id, body.friendId);
    }
}

