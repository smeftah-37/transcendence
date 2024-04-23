import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { User } from './entities/User';
import { NotFoundError, filter } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from 'src/room/entities/Room';
import { Conversation } from 'src/conversation/entities/conversation';
import { Message } from 'src/message/entities/message';
import { MessageService } from 'src/message/message.service';
import { ftruncate } from 'fs';
import { freemem } from 'os';
import { Game } from 'src/game/entities/game';
import { GameService } from 'src/game/game.service';
import { TwoFactorAuthService } from 'src/auth/A2f/A2f.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import * as fs from 'fs';



@Injectable()
export class UsersService {
    usersService: any;
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, @InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>, @InjectRepository(Message) private readonly messageRepository: Repository<Message>, private messagService: MessageService,@InjectRepository(Game) private readonly gameRepository: Repository<Game>, private gameService: GameService,private twoFactorAuthService: TwoFactorAuthService) { }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find({ relations: ['rooms', 'ConversationHistories'] });
        return users;
    }

    async changeAvatar(avatar: Express.Multer.File, userId: number): Promise<any> {
        const user = await this.userRepository.findOne({where:{ id: userId}});
        if (user) {
    
          const oldAvatarPath = user.avatar; // Retrieve the old avatar path
        user.avatar = avatar.path; // Update the user entity with the new avatar path
        await this.userRepository.save(user);
    
        // Delete the old avatar file if it exists
        if (oldAvatarPath && oldAvatarPath[0] ==='/' && fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (error) {
            console.error(`Failed to delete old avatar: ${oldAvatarPath}`, error);
          }
        }
      }
    }

    async getAvatar(userId: number)
    {
      if(userId)
      {
      const user = await this.userRepository.findOne({where:{ id: Number(userId)}});
      if(user)
      {
        return user.avatar;
      }
    }
    
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: Number(id) } },);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async findByName(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username: id } },);

        if (user) {
         return user;
        }

        
    }
    async findById(userId: Number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } ,relations: ['rooms']},);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async create(createUsersDto: any): Promise<void> {
        const newUser = this.userRepository.create(createUsersDto);
        await this.userRepository.save(newUser);
    }

    async update(id: string, updateUsersDto: any): Promise<void> {
        const updateUser = await this.findOne(id);

        if (updateUser) {
            await this.userRepository.update(id, updateUsersDto);

        }
    }
    

    async remove(id: string): Promise<void> {
        const deleteUser = await this.userRepository.findOne({where: {id: Number(id)},relations:["ConversationHistories","ConversationHistories.chat"]});

        if (deleteUser) {
            if(deleteUser.ConversationHistories)
            {
            await Promise.all(deleteUser.ConversationHistories.map(async (message) => {
                await Promise.all(message.chat.map(async (mes) => {
                    await this.messageRepository.delete(mes.id);
                  }));
                await this.conversationRepository.delete(message.id);

              }));
            }
            await this.userRepository.remove(deleteUser);
        }
    }
    async addRoomtoUser(id: number, room: Room): Promise<void> {

        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });

        if (userf) {
            userf.rooms.push(room);

            // Save the user entity with the updated rooms array
            await this.userRepository.save(userf);
        }
    }

    async UpdateGameStatus(id: number,situation : number): Promise<void> {

        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });

        if (userf) {
            userf.GameStatus = situation;

            // Save the user entity with the updated rooms array
            await this.userRepository.save(userf);
        }
    }
    async UpdateA2f(id: number,situation : boolean): Promise<string> {

        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });
        let secret = "";
        if (userf) {
            
            userf.A2f = situation;
            if(situation == true)
               secret = await this.twoFactorAuthService.generateSecret();
            await this.userRepository.save(userf);
            return (secret);
        }
    }

    async UpdateStatus(id: number,situation : number): Promise<void> {

        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });

        if (userf) {
            userf.Status = situation;

            // Save the user entity with the updated rooms array
            await this.userRepository.save(userf);
        }
    }


    async findByUsername(username: string): Promise<User | undefined> {
        return await this.userRepository.findOne({ where: { username: username } });
    }
    async createConversation(message: Message, friendId: number, userId: number): Promise<Conversation> {

        // Find the user and friend from the database
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ConversationHistories', 'ConversationHistories.chat', 'ConversationHistories.chat.sender', 'ConversationHistories.chat.receiver', 'ConversationHistories.friend', 'ConversationHistories.friend.ConversationHistories', 'ConversationHistories.friend.ConversationHistories.chat']
        });

        const friend = await this.userRepository.findOne({
            where: { id: friendId },
            relations: ['ConversationHistories', 'ConversationHistories.chat', 'ConversationHistories.chat.sender', 'ConversationHistories.chat.receiver', 'ConversationHistories.friend', 'ConversationHistories.friend.ConversationHistories', 'ConversationHistories.friend.ConversationHistories.chat']
        });
        // Create a new conversation for the user
        let userHistory;
        let found = false; // Initialize found to false

        for (const history of user.ConversationHistories) {
            if (history.friend && history.friend.id === Number(friendId)) {
                if (message) {
                    const messages = await this.messagService.CreateMessage(message);
                    if (!history.chat) {
                        history.chat = [];
                    }
                    history.chat.push(messages);
                }
                history.timestamp = new Date();
                await this.conversationRepository.save(history);
                userHistory = history;

                found = true; // Set found to true if a conversation is found
                break; // Exit the loop since we found the conversation
            }
        }
        if (!found) {
            userHistory = await new Conversation();
            if (message && message.message) {
                const mess = await this.messagService.CreateMessage(message);
                userHistory.chat = [mess];
            }
            else
                userHistory.chat = [];
            const friendTo_use = await this.userRepository.findOne({
                where: { id: friendId },
            });
            userHistory.friend = friendTo_use;

            // Add conversation to user's conversation history
            if (!user.ConversationHistories) {
                user.ConversationHistories = [];
            }
            userHistory.timestamp = new Date();
            await this.conversationRepository.save(userHistory);
            await user.ConversationHistories.push(userHistory);
        }


        // Create a new conversation for the friend
        let found1 = false; // Initialize found to false

        for (const history of friend.ConversationHistories) {
            if (history.friend && history.friend.id === Number(userId)) {
                if (message) {
                    const messages = await this.messagService.CreateMessage(message);
                    if (!history.chat) {
                        history.chat = [];
                    }
                    history.chat.push(messages);
                }
                history.timestamp = new Date();

                await this.conversationRepository.save(history);

                found1 = true; // Set found to true if a conversation is found
                break; // Exit the loop since we found the conversation
            }

        }
        if (!found1) {

            const friendConversation = new Conversation();
            if (message && message.message) {

                const mess1 = await this.messagService.CreateMessage(message);

                friendConversation.chat = [mess1];
            }
            else
                friendConversation.chat = [];

            // You might want to have separate messages for each conversation
            friendConversation.friend = user; // Reverse the friend and user for the friend's conversation

            // Add conversation to friend's conversation history
            if (!friend.ConversationHistories) {
                friend.ConversationHistories = [];
            }
            friendConversation.timestamp = new Date();
            
            await this.conversationRepository.save(friendConversation);

            friend.ConversationHistories.push(friendConversation);



            // Save both user and friend
        }


        await this.userRepository.save([user, friend]);
        return userHistory;



    }
    async getRoomsThanUser(userId: number): Promise<Room[]> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['rooms', 'rooms.users', 'rooms.admin', 'rooms.owner', 'rooms.conversation', 'rooms.conversation.chat', 'rooms.conversation.chat.sender','rooms.last_message','rooms.last_message.sender'] });
        return user.rooms;
    }
    async getAllConversationThanUser(userId: number): Promise<Conversation[]> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['ConversationHistories', 'ConversationHistories.chat', 'ConversationHistories.friend', 'ConversationHistories.chat.sender', 'ConversationHistories.chat.receiver'] });
        const conversations = user.ConversationHistories.filter(conversation => { 
            // Assuming "friend" is the property representing the friend in each conversation
           if(!conversation.friend)
                return true;
            const friendId = conversation.friend.id;
            if (conversation && conversation.chat) {
                conversation.chat.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }
            return (true);
        
        });
        
        conversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return conversations;
    }
    async searchUsersByUsername(username: string, userId:number): Promise<User[]> {
        // Use TypeORM query builder to find users by username
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});

        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.username LIKE :username', { username: `%${username}%` })
            .getMany();
            const result = users.filter(userC => {
                // Assuming "friend" is the property representing the friend in each conversation
                return ((!user.blocked || !user.blocked.includes(Number(userC.id))) && (!user.blockedBy || !user.blockedBy.includes(Number(userC.id)))&& user.id !== Number(userC.id))
            });
        return result;
        
    }
    async getConversationThanFriend(userId: number, friendId: number): Promise<Conversation> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['ConversationHistories', 'ConversationHistories.chat', 'ConversationHistories.friend'] });
        if (!user) {
            throw new Error('User not found');
        }

        // Find the conversation with the specific friend
        const conversation = user.ConversationHistories.find(
            conversation => conversation.friend.id == friendId
        )
        return conversation || null;
    }

    async addMessagetoConversation(userId: number, message: Message, friendId: number): Promise<number> {
        const conversation = await this.createConversation(message, friendId, userId);
        if (conversation.chat && conversation.chat.length > 1)
            return 0;
        return 1;
    }
       async removeFriend(userId: number, friendId: number)
    {
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});
        const friend = await this.userRepository.findOne({where: {id: Number(friendId)}});

        if(user && friend)
        {
           
            let index = user.friends.indexOf(Number(friendId));
            if (index !== -1) {
                user.friends.splice(index, 1);
            }
            index = friend.friends.indexOf(Number(userId));
            if (index !== -1) {
                friend.friends.splice(index, 1);
            }
            await this.userRepository.save(user);
            await this.userRepository.save(friend);


        }

    }
    async deleteUserConversation(userId: number): Promise<void> {
        // Retrieve the user's conversation history
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['ConversationHistories', 'ConversationHistories.chat'] });
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }
        // Delete each conversation one by one
        for (const conversation of user.ConversationHistories) {
            for (const message of conversation.chat) {
                await this.messageRepository.remove(message);
            };
            await this.conversationRepository.remove(conversation);
        }
    }
    async deleteOneUserConversation(userId: number, convId: number): Promise<void> {
        // Retrieve the user's conversation history
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['ConversationHistories', 'ConversationHistories.chat'] });
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Delete each conversation one by one
        for (const conversation of user.ConversationHistories) {
            if (conversation.id === Number(convId)) {
                for (const message of conversation.chat) {
                    await this.messageRepository.remove(message);
                };
                await this.conversationRepository.remove(conversation);
                break;
            }
        }
    }
    async setSocketId(socketId: string, userId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
            user.socketId = socketId;
            await this.userRepository.save(user);
        }
    }
    async blockUser(userId: number, friendId: number) {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        const friend = await this.userRepository.findOne({ where: { id: Number(friendId) } });

        if (user && friend) {
            if (!user.blocked)
                user.blocked = [];
            user.blocked.push(friendId);
            if (!friend.blockedBy)
                friend.blockedBy = []
            friend.blockedBy.push(userId);
            await this.userRepository.save(user);
            await this.userRepository.save(friend);

        }
        return [user,friend];
    }
    async  findUserBySocket(socketId: string)
    {
        return await this.userRepository.findOne({where: {socketId: socketId}});
    }
    async deblockUser(userId: number, friendId: number) {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        const friend = await this.userRepository.findOne({ where: { id: Number(friendId) } });

        if (user && friend) {
            if (user.blocked && user.blocked.includes(Number(friendId))) {
                const updatedBlocked = user.blocked.filter(id => id !== Number(friendId));
                user.blocked = updatedBlocked;
            }
            if (friend.blockedBy && friend.blockedBy.includes(Number(userId))) {
                const updatedBlocked = friend.blockedBy.filter(id => id !== Number(userId));

                friend.blockedBy = updatedBlocked;
            }
            await this.userRepository.save(user);
            await this.userRepository.save(friend);
            return [user,friend];

        }
        return null;
    }
    async getInvitationFriend(who: number, to : number)
    {
        const toUser = await this.userRepository.findOne({ where: { id: Number(to) } });
        if(toUser)
        {
            if(!toUser.pendingInvitation)
            toUser.pendingInvitation = [];
            toUser.pendingInvitation.push(Number(who));
            await this.userRepository.save(toUser);
        }

    }
    async getInvitationToPlay(userId: number, friendId : number)
    {
        const toUser = await this.userRepository.findOne({ where: { id: Number(friendId) } });
        if(toUser && toUser.GameStatus === 1)
        {
            if(!toUser.pendingGame)
                toUser.pendingGame = [];
            toUser.pendingGame.push(Number(userId));
            await this.userRepository.save(toUser);
        }

    }
    async DeleteGamesInvitation(userId: number)
    {
        const toUser = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if(toUser)
        {
            toUser.pendingGame = [];
        }
        await this.userRepository.save(toUser);

    }

    async acceptOrDeclineGameFrien(who: number, to: number,response: boolean)
    {   
        const toUser = await this.userRepository.findOne({ where: { id: Number(to) } });
        const whoUser = await this.userRepository.findOne({where: {id: Number(who)}});
        if(toUser && whoUser)
        {

            const index = whoUser.pendingGame.indexOf(Number(to));
            if (index !== -1) {
                whoUser.pendingGame.splice(index, 1);
            }
            await this.userRepository.save(toUser);
            await this.userRepository.save(whoUser);

            if(response && toUser.GameStatus && whoUser.GameStatus)
                return true;
            else
                return false;


    }
}


    async acceptOrDeclineInvFrien(who: number, to: number,response: boolean)
    {   
        const toUser = await this.userRepository.findOne({ where: { id: Number(to) } });
        const whoUser = await this.userRepository.findOne({where: {id: Number(who)}});
        if(toUser && whoUser)
        {
            if(!toUser.friends)
                toUser.friends = [];
            if(!whoUser.friends)
                whoUser.friends = [];
            if(response)
            {
                const whoId = Number(who);
                const toId = Number(to);
                if (!toUser.friends.includes(whoId)) {
                    toUser.friends.push(whoId);
                }
                
                if (!whoUser.friends.includes(toId)) {
                    whoUser.friends.push(toId);
            }
            }
            const index = whoUser.pendingInvitation.indexOf(Number(to));
            if (index !== -1) {
                whoUser.pendingInvitation.splice(index, 1);
            }
            await this.userRepository.save(toUser);
            await this.userRepository.save(whoUser);


        


    }
}
    async removeAllFriend(userId:number)
    {
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});
        if(user)
        {
            user.friends = [];
        }
        await this.userRepository.save(user);
    }
    async getBlockedusers(userId: number): Promise<User[]>
    {
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});
        if (user && user.blocked && user.blocked.length > 0) {
            // Fetch users based on the IDs in the pendingInvitation array
            const blockedUsers = await this.userRepository.find({
              where: { id: In(user.blocked) }
            });
        
            return blockedUsers;
          }
          return [];
    }
    async getAllInvitation(userId: number): Promise<User[]>
    {
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});
        if (user && user.pendingInvitation && user.pendingInvitation.length > 0) {
            // Fetch users based on the IDs in the pendingInvitation array
            const invitationUsers = await this.userRepository.find({
              where: { id: In(user.pendingInvitation) }
            });
        
            return invitationUsers;
          }
          return [];
    }
    async getAllGameInvitation(userId: number): Promise<User[]>
    {
        const user = await this.userRepository.findOne({where: {id: Number(userId)}});
        if (user && user.pendingGame && user.pendingGame.length > 0) {
            // Fetch users based on the IDs in the pendingInvitation array
            const invitationGameUsers = await this.userRepository.find({
              where: { id: In(user.pendingGame) }
            });
        
            return invitationGameUsers;
          }
          return [];
    }


    async chooseChar(id: number,userInfo : any)
    {
        const user = await this.userRepository.findOne({where:{id : id}});
        if(user)
        {

            
            const check = await this.userRepository.findOne({ where: { username: userInfo.userName} })
            try{
                     
                if (!userInfo.userName || !/^[a-zA-Z0-9_]*$/.test(userInfo.userName)) 
                    throw new Error('Failed to update user');
                if(!check)
                {
                    user.avatar = './uploadAvatar/assets/' + userInfo.displayName + '.png';
                    user.username = userInfo.userName;
                }
                else
                    return(null);
            }
            catch
            {
                return(null);
            }
                
            
            await this.userRepository.save(user);
    
            return user;
        }
        return null;
    }


    async UpdateAvatar(id: number,photo: string): Promise<void> {

        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });

        if (userf) {
            userf.avatar = photo;

            // Save the user entity with the updated rooms array
            await this.userRepository.save(userf);
        }
    }
    async UpdateUserName(id: number,name: string): Promise<void> {

        if (!name || !/^[a-zA-Z0-9_]*$/.test(name))
            return null; 
        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });
        
        
        if (userf) {
            userf.username = name;

            // Save the user entity with the updated rooms array
            await this.userRepository.save(userf);
        }
    }
    async getusersGames(id: number)
    {
        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });
        let gaminho = [];
        if(userf && userf.games)
        {
            for ( let i = 0; i < userf.games.length; i++)
            {
                const game = await this.gameRepository.findOne({where: {id: Number(userf.games[i])}, relations: ['Players','DataPlayers']});
                if(game)
                    gaminho.push(game);
            }
        }
        return (gaminho);
    }

    async getusersFriends(id: number)
    {
        const userf = await this.userRepository.findOne({ where: { id: Number(id) } });
        let friends = [];
        if(userf && userf.friends)
        {
            for ( let i = 0; i < userf.friends.length; i++)
            {
                const friend = await this.userRepository.findOne({where: {id: Number(userf.friends[i])}});
                if(friend)
                friends.push(friend);
            }
        }
        return (friends);
    }

    async change2fa(userId: number, secretKey: string,status: boolean)
    {
        if (!secretKey || secretKey.length !== 6 || !/^\d{6}$/.test(secretKey))
            return null;
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if(user)
        {
            if(status)
                user.A2f = true;
            else
                 await   this.deleteSecretKey(userId);

            await this.userRepository.save(user);
        }
    }
    async saveSecretKey(userId: number, secretKey: string,status: boolean): Promise<string> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (user) {
       
                user.secretKey = await this.twoFactorAuthService.generateSecret();
            


          await this.userRepository.save(user);
          return user.secretKey;
        } else {
          return null;
        }
      }
    
      async getSecretKey(userId: number): Promise<string> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (user) {
          return user.secretKey;
        } else {
            return null;
        }
      }
    
      async deleteSecretKey(userId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (user) {
          user.secretKey = null;
          user.A2f = false;
          await this.userRepository.save(user);
        } else {
          throw new Error('User not found');
        }
      }
    }

