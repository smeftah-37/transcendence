import { ConsoleLogger } from '@nestjs/common';
import {
    WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { GameService } from 'src/game/game.service';
import { UsersService } from 'src/users/users.service';
import { LessThanOrEqual } from 'typeorm';

@WebSocketGateway({
    path: '/kikigame',
    cors: {

        origin: ['http://10.13.1.10:3000', 'http://10.13.1.10:3000', 'http://10.13.1.10:3000'],

        methods: ['GET', 'POST'],
        credentials: true, // Allow sending cookies with WebSocket requests
    },
})
export class MyGameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private userService: UsersService, private gameService: GameService, private tokenService: TokenService) { }

    @WebSocketServer() server: Server;

    queue: number[] = [];

    userSocketMap: Map<number, Socket> = new Map();

    async handleConnection(client: Socket) {
        try {
            const userId = client.handshake.query.userId;
            const token = client.handshake.query.token;
            if (token && this.tokenService.verifyToken(token.toString())) {
                console.log('game connection socket ==>', client.id);
                await this.userService.UpdateGameStatus(Number(userId), 0);

                client.emit('gameStatus');
            }
            else {
                client.disconnect();
            }
        }
        catch (error) {
            console.error('Error handling connection:', error);
        }
    }


    async handleDisconnect(client: Socket) {
        try {
            let userIdToRemove = null;
            console.log('game disconnect socket ==>', client.id);

            // Iterate through the userSocketMap to find the userId associated with the given socketId
            this.userSocketMap.forEach((socket, userId) => {
                if (socket.id === client.id) {
                    userIdToRemove = userId;
                    return;
                }
            });

            if (userIdToRemove !== null) {
                // Remove user from the queue
                this.queue = this.queue.filter(id => id !== userIdToRemove);

                // Remove user from the map
                this.userSocketMap.delete(userIdToRemove);
            }
            if (userIdToRemove) {
                await this.userService.UpdateGameStatus(Number(userIdToRemove), 1);
                client.emit('gameStatus');
            }
        }
        catch (error) {
            console.error('Error handling connection:', error);
        }
    }
    @SubscribeMessage('wanna-play')
    async handleWannaPlay(
        @MessageBody() message: { userId: number, friendId: number },
        @ConnectedSocket() socket: Socket
    ) {
        try {
            if (message.friendId) {
                this.userSocketMap.set(message.userId, socket);
                console.log('im heeeeeereee', message, socket.id);
                if (this.userSocketMap.has(message.friendId)) {
                    console.log('im heeereeeeeee');
                    const players = [message.userId, message.friendId];
                    this.startGame(players);
                }

            }
            else
                this.addUser(message.userId, socket);

        } catch (error) {
            console.error('Error handling wanna-play message:', error);
        }
    }

    addUser(userId: number, socket: Socket) {
        if (this.queue && this.queue.includes(userId))
            return;
        this.queue.push(userId);
        this.userSocketMap.set(userId, socket);
        this.checkQueue();
    }

    checkQueue() {
        if (this.queue.length >= 2) {
            const players = this.queue.splice(0, 2);
            this.startGame(players);
        }
    }

    async startGame(players: number[]) {

        // Emit event to the first two players only
        const game = await this.gameService.addGame({ players });
        console.log('in create game ==>',game,players);
        players.forEach(async playerId => {
            const socket = this.userSocketMap.get(playerId);
            if (socket) {

                socket.emit('start-game', { players, game: game });
                console.log('emit haappend', socket.id);
                socket.on('disconnect', async() => {
                    console.log(game);
                    if(game)
                    {
                    const gamei = await this.gameService.getGame(game.id)
                    if (gamei.Playerscore1 !== 11 && gamei.Playerscore2 !== 11) {
                        // Remove the disconnected player and emit the disconnect event to other players
                        const disconnectedPlayerId = playerId;
                        players.forEach(playerId => {
                            if (playerId !== disconnectedPlayerId) {
                                const otherSocket = this.userSocketMap.get(playerId);
                                if (otherSocket) {
                                    otherSocket.emit('player-disconnected', { playerId: disconnectedPlayerId });
                                }
                            }
                        });
                    }}
                });

            }
        });
    }
    @SubscribeMessage('game-forfeit')
    async handleForfeitGame(
        @MessageBody() message: {
            gameId: number;
            userId: number;
            looserId: number;

        }
    ) {
        if (message) {
            await this.gameService.saveGame(message.gameId, message, true);
        }

    }

    @SubscribeMessage('ball-move')
    async ballPosition(
        @MessageBody() message: {
            x: number;
            y: number;
            z: number;
            players: number[];
            userId: number;

        }
    ) {

        if (message.players[1] === message.userId) {
            const socket = this.userSocketMap.get(Number(message.players[0]));
            if (socket) {
                await socket.emit('ball-move', message);
            }

        }
        else {
            const socket2 = this.userSocketMap.get(Number(message.players[1]));
            if (socket2) {
                await socket2.emit('ball-move', message);
            }
        }
    }

    @SubscribeMessage('set-paddle-move')
    async paddelMove(
        @MessageBody() message: {
            x: number,
            y: number,
            z: number,
            userId: number,
            players: number[],
            paddlenumber: number,
        }) {

        if (Number(message.userId) === Number(message.players[0])) {
            const socket = this.userSocketMap.get(Number(message.players[1]));
            if (socket) {
                await socket.emit('set-paddle-move', message);
            }
        }
        else {
            const socket2 = this.userSocketMap.get(Number(message.players[0]));
            if (socket2) {

                await socket2.emit('set-paddle-move', message);
            }
        }
    }
    @SubscribeMessage('intersect')
    async kikiHmar(
        @MessageBody() message: {
            userId: number,
            players: number[],
        }) {

        if (Number(message.userId) === Number(message.players[0])) {
            const socket = this.userSocketMap.get(Number(message.players[1]));
            if (socket) {
                await socket.emit('intersect', message);
            }
        }
        else {
            const socket2 = this.userSocketMap.get(Number(message.players[0]));
            if (socket2) {

                await socket2.emit('intersect', message);
            }
        }
    }
    @SubscribeMessage('touch-ball')
    async touchBall(
        @MessageBody() message: {

            players: number[],
            value: boolean,
            userId: number,
        }) {

        const socket = await this.userSocketMap.get(Number(message.players[0]));
        if (socket) {
            await socket.emit('touch-ball', message);
        }
        const socket2 = await this.userSocketMap.get(Number(message.players[1]));
        if (socket2) {

            await socket2.emit('touch-ball', message);
        }


    }
    @SubscribeMessage('start-status')
    async setStartPoint(
        @MessageBody() message: {
            lastWon: number,
            matchStart: boolean,
            userId: number,
            players: number[],
            score: number[],

        }) {

        const socket = this.userSocketMap.get(Number(message.players[0]));
        if (socket) {
            if (message.userId === message.players[1])
                await socket.emit('start-status', message);
            await socket.emit('change-score', { score: message.score });

        }



        const socket2 = this.userSocketMap.get(Number(message.players[1]));
        if (socket2) {
            if (message.userId === message.players[0])
                await socket2.emit('start-status', message);
            await socket2.emit('change-score', { score: message.score });

        }

    }
    @SubscribeMessage('set-end-point')
    async setEndPoint(
        @MessageBody() message: {
            x: number,
            y: number,
            z: number,
            players: number[],
        }) {

        const socket = await this.userSocketMap.get(Number(message.players[0]));
        if (socket) {

            await socket.emit('set-end-point', message);
        }

        const socket2 = await this.userSocketMap.get(Number(message.players[1]));
        if (socket2) {

            await socket2.emit('set-end-point', message);
        }

    }
    @SubscribeMessage('end-match')
    async endMatch(
        @MessageBody() message: {
            end: number,
            players: number[],
            userId: number,
        }) {
        if (Number(message.userId) === Number(message.players[0])) {

            const socket = await this.userSocketMap.get(Number(message.players[1]));
            if (socket) {

                await socket.emit('end', { end: message.end });
            }
        }
        else {
            const socket2 = await this.userSocketMap.get(Number(message.players[0]));
            if (socket2) {

                await socket2.emit('end', { end: message.end });
            }
        }

    }
    @SubscribeMessage('whos')
    async setWhos(
        @MessageBody() message: {
            whos: number,
            players: number[],
            userId: number,
        }) {
        if (Number(message.userId) === Number(message.players[0])) {
            const socket = await this.userSocketMap.get(Number(message.players[1]));
            if (socket) {

                await socket.emit('whos', { whos: message.whos });
            }
        }
        else {
            const socket2 = await this.userSocketMap.get(Number(message.players[0]));
            if (socket2) {

                await socket2.emit('whos', { whos: message.whos });
            }

        }
    }
}