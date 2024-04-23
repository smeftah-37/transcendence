import {
  WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody,
  ConnectedSocket
} from '@nestjs/websockets'
import { doesNotMatch } from 'assert';
import { disconnect } from 'process';
import { Server, Socket } from 'socket.io';
import { TwoFactorAuthController } from 'src/auth/A2f/A2f.controller';
import { TwoFactorAuthService } from 'src/auth/A2f/A2f.service';
import { TokenService } from 'src/auth/token.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { Message } from 'src/message/entities/message';
import { Room } from 'src/room/entities/Room';
import { RoomService } from 'src/room/room.service';
import { User } from 'src/users/entities/User';
import { UsersService } from 'src/users/users.service';
import { measureMemory } from 'vm';


@WebSocketGateway({
  path: '/websocket',
  cors: {
    origin: ['http://10.13.1.10:3000', 'http://10.13.1.10:3000', 'http://10.13.1.10:3000'],

    methods: ['GET', 'POST'],
    credentials: true, // Allow sending cookies with WebSocket requests
  },
})



// export class MyGateway{
//     @SubscribeMessage('message')
//     onNewMessage(@MessageBody() body: any){
//         console.log(body);
//     }
// }
export class MyGateway {
  constructor(private roomService: RoomService, private tokenService: TokenService, private userService: UsersService, private conversationService: ConversationService, private twoFactorAuthService: TwoFactorAuthService) { }
  @WebSocketServer() server: Server;

  @SubscribeMessage('private-message')
  async synchandleMessage(
    @MessageBody() message: {
      convId: number,
      senderId: number,
      receiverId: number,
      sender: string,
      receiver: string,
      message: Message,
    },
  ) {

    try {
      const test = await this.userService.findById(message.receiverId);
      const test1 = await this.userService.findById(message.senderId);

      if (await this.userService.addMessagetoConversation(message.senderId, message.message, message.receiverId)) {
        await this.server.to((await test).socketId).emit('creation-of-conv', { convId: message.convId });
        await this.server.to((await test1).socketId).emit('creation-of-conv', { convId: message.convId, userId: message.senderId });
      }
      await this.server.to((await test).socketId).emit('private-message', { message: message.message, friendId: message.senderId });
      await this.server.to((await test1).socketId).emit('private-message', { message: message.message, friendId: message.receiverId });
      await this.server.to((await test).socketId).emit('newMessage', { message: message.message, friendId: message.senderId });
      await this.server.to((await test1).socketId).emit('newMessage', { message: message.message, friendId: message.receiverId });

    } catch (error) {
      console.error('Error emitting private message:', error);
    }
  }
  @SubscribeMessage('room-message')
  async handleRoomMessages(
    @MessageBody()
    message: {
      room: Room
      messageU: Message

    }
  ) {
    await this.roomService.addMessagetoRoom(message.room.id, message.messageU);
    await this.server.to(message.room.id.toString()).emit('room-message', { message: message.messageU, roomId: message.room.id });
    await this.server.to(message.room.id.toString()).emit('newMessage', { message: message.messageU, roomId: message.room.id });

  }
  @SubscribeMessage('change-room')
  async handleRoomChange(
    @MessageBody()
    message: {
      roomId: number,
      newName: string,

    }
  ) {
    if (message.newName) {
      await this.roomService.changeName(message.newName, message.roomId);
    }
    await this.server.to(message.roomId.toString()).emit('change1-room');
    await this.server.to(message.roomId.toString()).emit('change-room');


  }
  @SubscribeMessage('change-password')
  async handleRoomChange1(
    @MessageBody()
    message: {
      roomId: number,
      password: string,

    }
  ) {
    if (!message.password || !/^[a-zA-Z0-9_]*$/.test(message.password))
      await this.server.to(message.roomId.toString()).emit('invalid-password');
    else
    {

    await this.roomService.addOrUpdatePassword(message.roomId, message.password);
    await this.server.to(message.roomId.toString()).emit('change1-room');
    }

  }

  @SubscribeMessage('add-password')
  async handleRoomChange2(
    @MessageBody()
    message: {
      roomId: number,
      password: string,

    }
  ) {
    if (!message.password || !/^[a-zA-Z0-9_]*$/.test(message.password))
    {
      await this.server.to(message.roomId.toString()).emit('invalid-password');
    }
    else
    {
    await this.roomService.addOrUpdatePassword(message.roomId, message.password);
    
    await this.server.to(message.roomId.toString()).emit('change1-room');
    }

  }
  @SubscribeMessage('remove-password')
  async handleRoomChange3(
    @MessageBody()
    message: {
      roomId: number,

    }
  ) {
    if (message) {
      await this.roomService.removePassword(message.roomId);
    }
    await this.server.to(message.roomId.toString()).emit('change-room');

  }
  @SubscribeMessage('kick-user-out')
  async handleuserOut(
    @MessageBody()
    message: {
      roomId: number,
      userId: number,
      ban: boolean,

    }
  ) {
    const socketId = await this.roomService.kickoutUser(message.roomId, message.userId, message.ban);

    await this.server.to(message.roomId.toString()).emit('change-room');
    await this.server.to(message.roomId.toString()).emit('delete-room', message);
    await this.server.in(socketId).socketsLeave(message.roomId.toString());


  }
  @SubscribeMessage('remove-conv')
  async handleuRemoveConv(
    @MessageBody()
    message: {
      convId: number,
      userId: number,

    }
  ) {
    const user = await this.userService.findById(message.userId);
    await this.server.to((await user).socketId).emit('remove-conv');


  }
  
  @SubscribeMessage('change-global')
  async handleChange(
    @MessageBody()
    message: {
      userId: number,

    }
  ) {
    const user = await this.userService.findById(message.userId);
    await this.server.to(user.socketId).emit('change-globalP',{user: user});
    this.server.emit('change-global');


  }
  
  @SubscribeMessage('block-friend')
  async handleuBlock(
    @MessageBody()
    message: {
      userId: number,
      friendId: number,

    }
  ) {


    const result = await this.userService.blockUser(message.userId, message.friendId);
    await this.server.to(result[0].socketId).emit('block-friend', { blocked: result[0].blocked, blockedBy: result[0].blockedBy });
    await this.server.to(result[1].socketId).emit('block-friend', { blocked: result[1].blocked, blockedBy: result[1].blockedBy });

  }
  // @SubscribeMessage('set-socket-id')
  // async setSocketToUser(@MessageBody()
  // message: {
  //   id: number
  //   socketId: string,
  // })
  // {
  //   console.log('im in the set socket', message.socketId, message.id);
  //   if(message.socketId && message.id)
  //   {
  //     await this.userService.setSocketId(message.socketId, message.id);
  //   }
  // }
  @SubscribeMessage('set-socket-id')
  async handleSocket(client: Socket, payload: { userId: number, socketId: string }) {
    await this.userService.setSocketId(payload.socketId, payload.userId);
    await this.userService.UpdateGameStatus(Number(payload.userId), 1);
    await this.userService.UpdateStatus(Number(payload.userId), 1);
    this.server.emit('status', { status: 1, userId: payload.userId });
    client.emit('gameStatus');
    const user = await this.userService.findById(Number(payload.userId));
    if (user && user.rooms) {

      user.rooms.forEach(room => {
        client.join(room.id.toString());
      });
    }

  }
  @SubscribeMessage('search-users')
  async handleSeachInput(@MessageBody()
  message: {
    term: string
    userId: number,
  }) {

    const user = await this.userService.findById(message.userId);

    const users = await this.userService.searchUsersByUsername(message.term, message.userId);
    await this.server.to(user.socketId).emit("search-users", users);


  }

  @SubscribeMessage('typing')
  async handleTyping(@MessageBody()
  message: {
    senderId: number,
    username: string
    roomId: number
    typename: string
    sender: string,
    receiver: string,
    receiverId: number,
  }) {
    if (message.typename === 'room')
      await this.server.to(message.roomId.toString()).emit('typing', message);
    else {

      const test = this.userService.findById(message.receiverId);
      const test1 = this.userService.findById(message.senderId);
      await Promise.all([
        this.server.to((await test).socketId).emit('typing', message),
        this.server.to((await test1).socketId).emit('typing', message)
      ]);
    }
  }
  @SubscribeMessage('stop-typing')
  async handleStopTyping(@MessageBody()
  message: {
    senderId: number,
    username: string
    roomId: number
    typename: string
    sender: string,
    receiver: string,
    receiverId: number,
  }) {
    if (message.typename === 'room')
      await this.server.to(message.roomId.toString()).emit('stop-typing', message);
    else {

      const test = this.userService.findById(message.receiverId);
      const test1 = this.userService.findById(message.senderId);
      await Promise.all([
        this.server.to((await test).socketId).emit('stop-typing', message),
        this.server.to((await test1).socketId).emit('stop-typing', message)
      ]);
    }
  }
  @SubscribeMessage('join-room')
  async handleSetClientDataEvent(
    @MessageBody()
    message: {
      roomId: number,
      userId: number,
      status: number,
      password: string,
    }
  ) {
    let check = 1;
    const user = await this.userService.findById(message.userId);
    if (user && message.status)
      check = await this.roomService.checkPassword(message.roomId, message.password);
    if (user && check) {
      await this.server.in(user.socketId).socketsJoin(message.roomId.toString())
      await this.roomService.addUserToRoom(message.roomId, message.userId, user.socketId);
      await this.server.to(user.socketId).emit('join-event', message);
      await this.server.to(message.roomId.toString()).emit('change-room');


    }
    else {
      await this.server.to(user.socketId).emit('password-failed', message);

    }
  }
  @SubscribeMessage('create-room')
  async handleSetClientDataEventCreateRoom(
    @MessageBody()
    message: {
      socketId: string
    }
  ) {
    if (message.socketId) {
      // await this.roomService.addRoom(message.room);
      await this.server.emit('create-room', message);

    }
  }


  @SubscribeMessage('change-userName')
  async handleSetUserName(
    @MessageBody()
    message: {
      userId: number,
      userName: string,
    }) {
    const user = await this.userService.findByName(message.userName);
    if (!user) {
      const NewUser = await this.userService.findById(message.userId);
      if (NewUser) {
        await this.userService.UpdateUserName(message.userId, message.userName);

        await this.server.to(NewUser.socketId).emit("change-userName", NewUser);

      }

    }


  }


  @SubscribeMessage('change-A2f')
  async handleSetA2f(
    @MessageBody()
    message: {
      userId: number,
      userA2f: boolean,
      userKey: any,
    }
  ) {
    if (message) {
      // await this.roomService.addRoom(message.room);
      const NewUser = await this.userService.findById(message.userId);
     
      if (NewUser) {
        if(!message.userA2f)
          this.userService.deleteSecretKey(message.userId)
        else
        {
        const secret = await this.userService.saveSecretKey(message.userId,message.userKey,message.userA2f)
        await this.server.to(NewUser.socketId).emit("secret-generated", {secret:secret });
          
        }

      }

    }
  }
  @SubscribeMessage('check-secret')
  async handleCheck2fa(
    @MessageBody()
    message: {
      userId: number,
      secret: any,
    }
  ) {
    const NewUser = await this.userService.findById(message.userId);

    if (message && NewUser) {

        let status = 1;
        if(await this.twoFactorAuthService.verifyToken( message.secret,NewUser.secretKey))
        {
          this.userService.change2fa(message.userId, NewUser.secretKey,true);
          await this.server.to(NewUser.socketId).emit("validKey",{user: NewUser});
        }
        else
        {
          this.userService.change2fa(message.userId, null,false);
          await this.server.to(NewUser.socketId).emit("notValid", NewUser);
        }

          

      

    }
  }

  @SubscribeMessage('check-secretAuth')
  async handleCheck2faAuth(
    @MessageBody()
    message: {
      userId: number,
      secret: any,
    }
  ) {
    const NewUser = await this.userService.findById(message.userId);

    if (message && NewUser) {

        if(await this.twoFactorAuthService.verifyToken( message.secret,NewUser.secretKey))
        {
          //this.userService.change2fa(message.userId, NewUser.secretKey,true);
          await this.server.to(NewUser.socketId).emit("validKeyAuth",{user: NewUser});
        }
        else
        {
         // this.userService.change2fa(message.userId, null,true);
          await this.server.to(NewUser.socketId).emit("notValidAuth", NewUser);
        }

          

      

    }
  }


  @SubscribeMessage('change-Avatar')
  async handleSetAvatar(
    @MessageBody()
    message: {
      userId: number,
      userAvatar: string,
    }
  ) {
    if (message.userAvatar) {
      // await this.roomService.addRoom(message.room);
      const NewUser = await this.userService.findById(message.userId);
      if (NewUser) {
        await this.userService.UpdateAvatar(message.userId, message.userAvatar);
        await this.server.to(NewUser.socketId).emit("change-userAvatar", NewUser);

      }

    }
  }

  @SubscribeMessage('mute-user')
  async handleMute(
    @MessageBody()
    message: {
      roomId: number,
      userId: number,
      timeS: Date,
      timeE: Date,



    }
  ) {

    await this.roomService.muteUser(message.roomId, message.userId, message.timeS, message.timeE);
    const user = await this.userService.findById(message.userId);
    await this.server.to(user.socketId).emit('mute-user', message);


  }
  @SubscribeMessage('delete-mute')
  async handleNonMute(
    @MessageBody()
    message: {
      roomId: number,
      userId: number,



    }
  ) {

    const user = await this.userService.findById(message.userId);
    await this.roomService.deleteOneMutedUser(message.roomId, message.userId);
    await this.server.to(user.socketId).emit('change-room');



  }

  @SubscribeMessage('status-inv')
  async handleSupInv(
    @MessageBody()
    message: {
      userId: number,
      friendId: number,
      status: boolean,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      const NewUser1 = await this.userService.findById(Number(message.friendId));
      if (NewUser && NewUser1) {
        await this.userService.acceptOrDeclineInvFrien(message.userId, message.friendId, message.status);
        await this.server.to(NewUser.socketId).emit("change-Inv", NewUser);
        await this.server.to(NewUser1.socketId).emit("change-Inv", NewUser1);
        if (message.status) {
          await this.server.to(NewUser.socketId).emit("new-friend", NewUser);
          await this.server.to(NewUser1.socketId).emit("new-friend", NewUser1);
        }


      }
      // await this.roomService.addRoom(message.room);


    }
  }
  @SubscribeMessage('status-Game')
  async handleGame(
    @MessageBody()
    message: {
      userId: number,
      friendId: number,
      status: boolean,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      const NewUser1 = await this.userService.findById(Number(message.friendId));
      if (NewUser && NewUser1) {
        
        if (await this.userService.acceptOrDeclineGameFrien(message.userId, message.friendId, message.status)) {
          
          await this.server.to(NewUser.socketId).emit("go-toPlay", { userId: NewUser.id, friendId: NewUser1.id });
          await this.server.to(NewUser1.socketId).emit("go-toPlay", { userId: NewUser1.id, friendId: NewUser.id });
        }
       
          await this.server.to(NewUser.socketId).emit("change-Game", NewUser);
          await this.server.to(NewUser1.socketId).emit("change-Game", NewUser1);
        



      }
      // await this.roomService.addRoom(message.room);


    }
  }
  @SubscribeMessage('Debloque')
  async handleDebloque(
    @MessageBody()
    message: {
      userId: number,
      friendId: number,
    }
  ) {
    if (message) {

      const users = await this.userService.deblockUser(message.userId, message.friendId);
      if (users) {
        await this.server.to(users[0].socketId).emit("Debloque", users[0]);
        await this.server.to(users[1].socketId).emit("Debloque", users[1]);
      }



      // await this.roomService.addRoom(message.room);


    }
  }

  @SubscribeMessage('invitation')
  async handleInvitation(
    @MessageBody()
    message: {
      userId: number,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      if (NewUser) {

        await this.server.to(NewUser.socketId).emit("invitation");


      }
      // await this.roomService.addRoom(message.room);


    }
  }
  @SubscribeMessage('save-game')
  async handleSave() {
    this.server.emit('save-game');
  }
  @SubscribeMessage('save-point')
  async handleSaveP() {
    this.server.emit('save-point');
  }

  @SubscribeMessage('invitation-game')
  async handleInvitationGame(
    @MessageBody()
    message: {
      userId: number,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      if (NewUser) {

        await this.server.to(NewUser.socketId).emit("invitation-game", NewUser);


      }
      // await this.roomService.addRoom(message.room);


    }
  }

  @SubscribeMessage('invitation-bar')
  async handleInvitationBar(
    @MessageBody()
    message: {
      userId: number,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      if (NewUser) {

        await this.server.to(NewUser.socketId).emit("invitation-bar", NewUser);
        await this.server.to(NewUser.socketId).emit("change-Game", NewUser);




      }
      // await this.roomService.addRoom(message.room);


    }
  }

  @SubscribeMessage('remove-friend')
  async handleRemoveFriend(
    @MessageBody()
    message: {
      userId: number,
      friendId: number,
    }
  ) {
    if (message) {
      const NewUser = await this.userService.findById(Number(message.userId));
      const NewUser1 = await this.userService.findById(Number(message.friendId));

      if (NewUser && NewUser1) {
        await this.userService.removeFriend(message.userId, message.friendId);
        await this.server.to(NewUser.socketId).emit("remove-friend", { friends: NewUser.friends });
        await this.server.to(NewUser1.socketId).emit("remove-friend", { friends: NewUser1.friends });



      }
      // await this.roomService.addRoom(message.room);


    }
  }
  async handleConnection(client: Socket) {
    try {



      const userId = client.handshake.query.userId;
      const token = client.handshake.query.token;
      //  console.log('anaaaaaaaaaaaaaaaaaaa hnaaaaaaaaaaaaaaaaaaaaaaaaa',userId);
      if (token && this.tokenService.verifyToken(token.toString())) {
        console.log('connect socket ==>', client.id)
        const user = await this.userService.findById(Number(userId));
        // if(user && user.Status)
        // {
        //   this.server.to(client.id).emit('connected-before');
        //   client.disconnect();
        //   throw '';
        // }
        await this.userService.setSocketId(client.id, Number(userId));
        await this.userService.UpdateGameStatus(Number(userId), 1);
        await this.userService.UpdateStatus(Number(userId), 1);
        this.server.emit('status', { status: 1, userId: Number(userId) });
        client.emit('gameStatus');
        if (user && user.rooms) {

          user.rooms.forEach(room => {
            client.join(room.id.toString());
          });
        }

        //     await this.userService.UpdateGameStatus(Number(userId), 1);
        //     await this.userService.UpdateStatus(Number(userId), 1);
        //     client.emit('status');
        //     client.emit('gameStatus');
        //     const user = await this.userService.findById(Number(userId));


        //     // user.rooms.forEach(room => {
        //     //   client.join(room.id.toString());
        //     // });
        //   }

        // }
        // catch (error) {
        //   console.error('Error handling connection:', error);
      }
      else
        client.disconnect();
    }
    catch {

    }

  }


  async handleDisconnect(client: Socket) {
    const user = await this.userService.findUserBySocket(client.id);
    if (user) {
      await this.userService.UpdateGameStatus(Number(user.id), 0);
      await this.userService.UpdateStatus(Number(user.id), 0);
      this.server.emit('status', { status: 0, userId: user.id });
      client.emit('gameStatus');
    }
    console.log(client.id, "disconnect");

    try {
      const userId = client.handshake.headers['userId'];
      if (userId) {
        await this.userService.UpdateGameStatus(Number(userId), 0);
        await this.userService.UpdateStatus(Number(userId), 0);
        console.log('disconnect socket ==>', client.id)

      }
    }
    catch (error) {
      console.error('Error handling connection:', error);
    }
  }


  @SubscribeMessage('join-room-created-before')
  handleJoinRoom(client: Socket, payload: { roomId: number }) {
    const { roomId } = payload;
    client.join(roomId.toString());
  }
  // } async handleConnection(socket: Socket): Promise<void> {
  // }

  // async handleDisconnect(socket: Socket): Promise<void> {
  //   await this.roomService.removeUserFromAllRooms(socket.id)
  // }
  // emiit message to all clinets -------
  // @SubscribeMessage('message')
  // handleMessage(
  //   @MessageBody() message: Message,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //     this.server.emit('message',message);
  //   console.log('Received message from client:', message);
  //   // You can emit a response back to the client or broadcast to other clients
  // //   client.emit('message', 'Hello from the server!');------
  // }
}