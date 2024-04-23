import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/Room';
import { Admin, Repository } from 'typeorm';
import { User } from 'src/users/entities/User';
import { Conversation } from 'src/conversation/entities/conversation';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { Message } from 'src/message/entities/message';
import { MutedUser } from './entities/MutedUser';
import { StorageService } from './storage.service';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';
import { AxiosError } from 'axios';
import * as bcrypt from 'bcryptjs';

import { join } from 'path';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
@Injectable()
export class RoomService {
  constructor(@InjectRepository(MutedUser) private readonly mutedUserRepository: Repository<MutedUser>, @InjectRepository(Message) private readonly messageRepository: Repository<Message>, @InjectRepository(Room) private readonly roomRepository: Repository<Room>, @InjectRepository(User) private readonly userRepository: Repository<User>, @InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>, private messageService: MessageService, private conversationService: ConversationService, private storageService: StorageService) { }
  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({ relations: ['admin', 'users', 'owner', 'conversation', 'last_message', 'last_message.sender', 'conversation.chat', 'conversation.chat.sender'] });
  }
  async addRoom(body: Room): Promise<void> {
    try {
      const room = new Room();

      room.roomName = body.roomName;
      room.description = body.description;
      room.owner = body.admin[0];
      // Assuming this should be assigned from body.users
      room.type = body.type;
      if(body.password && body.password.length > 0)
        room.password = await bcrypt.hash(body.password, 10);
      room.avatar = body.avatar;

      // Initialize conversation and chat
      room.conversation = new Conversation();
      room.conversation.type = body.conversation.type;
      // room.conversation.room = room;

      // Create and assign initial message to the conversation
      const message = await this.messageService.CreateMessage(body.conversation.chat[0]);
      room.conversation.chat = [message];
      room.last_message = message;

      // Save conversation before saving room
      await this.conversationRepository.save(room.conversation);

      // Save room
      await this.roomRepository.save(room);

      // Update user's rooms
      const user = await this.userRepository.findOne({ where: { id: body.admin[0].id }, relations: ['rooms'] });
      if (user) {
        user.rooms.push(room);
        await this.userRepository.save(user);
      }
    } catch (error) {
      // Handle errors appropriately
      console.error('Error adding room:', error);
      throw error; // Rethrow the error or handle as needed
    }
  }
  async getRoomsThatUserNotJoin(userId: number): Promise<Room[]> {
    const roomsWithout = [];
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'user')
      .leftJoinAndSelect('room.owner', 'owner')
      .leftJoinAndSelect('room.admin', 'admin')
      .getMany();

    rooms.forEach(room => {
      let containsUser = false;
      if (room.type === 'protected' || room.type === 'public') {
        // Check if the user is in the room's users, owner, or admins
        for (const user of room.users) {
          if (user.id === Number(userId)) {
            containsUser = true;
            break;
          }
        }
        if (room.owner && room.owner.id === Number(userId)) {
          containsUser = true;
        }
        if (room.admin.some(admin => admin.id === Number(userId))) {
          containsUser = true;

        }
        if (!containsUser && (!room.banUsers || !room.banUsers.includes(Number(userId)))) {
          roomsWithout.push(room);
        }
      }

    });

    return roomsWithout;
  }

  async removeRoom(roomId: number): Promise<void> {
    // Find the room by its name
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) } });

    if (room) {
      // Check if there are any related conversations
      const conversations = await this.conversationRepository.find({ where: { room: room } });

      if (conversations.length > 0) {
        // Handle related conversations (e.g., delete or update references)
        // For simplicity, let's delete the related conversations
        await this.conversationRepository.remove(conversations);
      }

      // Remove the room from the database
      await this.roomRepository.remove(room);
    }
  }



  async changeAvatar(avatar: Express.Multer.File, roomId: number): Promise<any> {
    const room = await this.roomRepository.findOne({where:{ id: roomId}});
    if (room) {

      const oldAvatarPath = room.avatar; // Retrieve the old avatar path
    room.avatar = avatar.path; // Update the room entity with the new avatar path
    await this.roomRepository.save(room);

    // Delete the old avatar file if it exists
    if (oldAvatarPath && fs.existsSync(oldAvatarPath)) {
      try {
        fs.unlinkSync(oldAvatarPath);
      } catch (error) {
        console.error(`Failed to delete old avatar: ${oldAvatarPath}`, error);
      }
    }
  }
}
async getAvatar(roomId: number)
{
  if(roomId)
  {
  const room = await this.roomRepository.findOne({where:{ id: Number(roomId)}});
  if(room)
  {
    return room.avatar;
  }
}

}




// const formData = new FormData();
    // formData.append('image', avatar.buffer.toString('base64'));
    // const { data: imageData } = await firstValueFrom(
    //   this.httpService
    //     .post(
    //       `https://api.imgbb.com/1/upload?expiration=600&key=ab01e1f4b0adad69c127ba7af10eb862`,
    //       formData,
    //     )
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         throw error;
    //       }),
    //     ),
    // );
    // user.avatar = imageData.data.url;
    
    // return imageData;
  



  async changeName(name: string, id: number): Promise<void> {
    const room = await this.roomRepository.findOne({ where: { id: Number(id) } });
    if (room) {
      room.roomName = name;
      await this.roomRepository.save(room);
    }

  }
  async removeAllRooms(): Promise<void> {
    // Fetch all rooms with their conversations and last messages
    const rooms = await this.roomRepository.find({ relations: ["conversation", "mutedUser"] });

    // Delete conversations and messages related to each room
    for (const room of rooms) {
      if (room.mutedUser) {
        for (const muted of room.mutedUser) {
          await this.mutedUserRepository.remove(muted);
        };
        room.mutedUser = [];
      }
      if (room.conversation) {
        // Remove conversation first
        const con = await this.conversationRepository.findOne({ where: { id: Number(room.conversation.id) }, relations: ['chat'] });
        for (const message of con.chat) {
          if (message.id !== room.last_message.id)
            await this.messageRepository.remove(message);
        };

      }

      await this.roomRepository.remove(room);
    }
  }
  async addUserToRoom(roomId: number, userId: number, socketId: string): Promise<boolean> {
    // Find the room by name
    // Find the room by name
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) }, relations: ['users'] });
    if (room.banUsers && room.banUsers.includes(userId))
      return false
    if (room) {
      // Find the user by ID (assuming user has an ID)
      const userEntity = await this.userRepository.findOne({ where: { id: Number(userId) }, relations: ['rooms'] });

      if (userEntity) {
        // Add the user to the room's users array
        room.users.push(userEntity);

        // Save changes to both entities
        await this.roomRepository.save(room);
        if (userEntity.rooms) {
          userEntity.rooms.push(room);

          // Save the user entity with the updated rooms array
          await this.userRepository.save(userEntity);
        }
      } else {
        throw new Error(`User with ID ${userId} not found`);
      }
    } else {
      throw new Error(`Room with name ${roomId} not found`);
    }
    return true;
  }
  async getRoom(roomId: number): Promise<Room> {
    // Fetch the room along with its conversation and chat messages
    const room = await this.roomRepository.findOne({
      where: { id: Number(roomId) },
      relations: ['last_message', 'last_message.sender', 'conversation', 'conversation.chat', 'conversation.chat.sender', 'users', 'admin', 'owner']
    });

    // Sort the chat messages by their timestamps
    if (room && room.conversation && room.conversation.chat) {
      room.conversation.chat.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    return room;
  }
  async makeuserAdmin(roomId: number, userId: number) {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) }, relations: ['users', 'admin'] });
    const userIndex = room.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw 'this user is not in the room';
    }
    else
      room.users.splice(userIndex, 1);
    if (!room.admin)
      room.admin = [];
    const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
    if (user) {
      room.admin.push(user);
    }
    await this.roomRepository.save(room);
  }
  async kickoutUser(roomId: number, userId: number, ban: boolean) {
    const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['users', 'admin', 'owner'] });
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['rooms'] });
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    // Find the index of the user in the room's users array
    const userIndex = room.users.findIndex(user => user.id === userId);
    const roomIndex = user.rooms.findIndex(room => room.id === roomId);

    if (userIndex === -1) {
      const userIndex = room.admin.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        room.admin.splice(userIndex, 1);
      }
      else if (room.owner && room.owner.id === Number(userId)) {
        if (room.admin && room.admin.length > 0) {
          room.owner = room.admin[0];
          room.admin.splice(0, 1);
        }
        else if (room.users && room.users.length > 0) {
          room.owner = room.users[0];
          room.users.splice(0, 1);
        }
        else {
          room.owner = null;
        }

      }
      else
        throw 'this user is not in the room';

    }
    else
      room.users.splice(userIndex, 1);

    // Remove the user from the room's users array

    user.rooms.splice(roomIndex, 1);
    if (ban) {
      if (!room.banUsers)
        room.banUsers = [];
      room.banUsers.push(userId);
    }
    // Save the updated room entity
    await this.roomRepository.save(room);
    if ((!room.admin || room.admin.length === 0) && (!room.users || room.users.length === 0) && (!room.owner))
      await this.roomRepository.remove(room);

    await this.userRepository.save(user);
    return user.socketId

  }
  async muteUser(roomId: number, userId: number, timeS: Date, timeE: Date) {
    const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['users', 'admin', 'mutedUser'] });
    if (room) {
      if (room.mutedUser.some(user => user.userId === Number(userId))) {
        return;

      }
      const mutedUser = new MutedUser();

      mutedUser.userId = userId;
      mutedUser.startTime = timeS;
      mutedUser.endTime = timeE;
      await this.mutedUserRepository.save(mutedUser);

      if (!room.mutedUser)
        room.mutedUser = [];
      room.mutedUser.push(mutedUser);
      await this.roomRepository.save(room);
    }
  }
  async deleteMutedUser(roomId: number) {
    const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['users', 'admin', 'mutedUser'] });
    if (room && room.mutedUser) {
      // const con = await this.mutedUserRepository.findOne({ where: { id: Number(room.conversation.id) }, relations: ['chat'] });
      for (const muted of room.mutedUser) {
        await this.mutedUserRepository.remove(muted);
      };
      room.mutedUser = [];
      await this.roomRepository.save(room);

    }



  }
  async deleteOneMutedUser(roomId: number, userId: number) {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) }, relations: ['mutedUser'] });
    if (room && room.mutedUser) {
      const mutedIndex = room.mutedUser.findIndex(muted => muted.userId === Number(userId));
      if (mutedIndex !== -1) {

        room.mutedUser.splice(mutedIndex, 1);
        await this.roomRepository.save(room); // Save the updated room object
      } else {
        console.log("Muted user not found in the room");
      }
    } else {
      console.log("Room or mutedUser not found");
    }
  }
  async addOrUpdatePassword(roomId: number, newPassword: string) {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) } });
    if (room) {
      room.type = 'protected';
      room.password = await bcrypt.hash(newPassword, 10);;
      await this.roomRepository.save(room);
    }
  }
  async removePassword(roomId: number) {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) } });
    if (room) {
      room.password = null;
      room.type = 'public';
      await this.roomRepository.save(room);
    }
  }
  async addMessagetoRoom(roomId: number, message: Message): Promise<void> {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) }, relations: ['conversation', 'conversation.chat', 'last_message'] });
    if (room && room.conversation) {
      const messages = new Message();
      messages.message = message.message;
      messages.sender = message.sender;
      messages.timeSent = message.timeSent;
      const savedMessage = await this.messageRepository.save(messages);
      if (!room.conversation.chat) {
        room.conversation.chat = [];
      }
      room.conversation.chat.push(savedMessage);

      room.last_message = savedMessage;
      await this.conversationRepository.save(room.conversation);
      await this.roomRepository.save(room);
    }
    // await this.conversationService.addMessage(message, room.conversation.id);
  }
  async checkPassword(roomId: number, password: string)
  {
    const room = await this.roomRepository.findOne({ where: { id: Number(roomId) } });
    if(room)
    {
      return await bcrypt.compare(password, room.password);

    }
    return 0;

  }
}