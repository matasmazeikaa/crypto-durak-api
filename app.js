import cors from 'cors'
import bodyParser from 'body-parser'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { v4 as generateId } from 'uuid';
import Deck from './game/Deck.js'
import Game from './game/Game.js'


// require('dotenv').config();

// new Game({players: [{name: 'd', id: '12'}, {name: 'd2', id: '1d2'}]})

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } })

// App middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
// app.use('/user', userController);

let rooms = {}

io.on('connection', (socket) => {

    io.emit('updateRoomsState', rooms)

    socket.emit('connected', () => {
        io.emit('updateRoomsState', rooms)
    })


    socket.on('createRoom', ({username, userId, cryptoAmount}) => {
        const roomId = generateId()

        const players = [{ name: username, id: userId }]

        const room = {
            id: roomId,
            name: username,
            gameState: new Game({ players, cryptoAmount })
        };

        rooms = {
            ...rooms,
            [roomId]: room
        }

        socket.join(roomId)

        io.emit('updateRoomsState', rooms)
        io.to(socket.id).emit('joinedRoom', room)
    })

    socket.on("joinRoom", ({ roomId, userName, userId }) => {
        socket.join(roomId)

        const room = rooms[roomId]
        const player = { name: userName, id: userId }

        room.gameState.addPlayer(player)

        rooms = {
            ...rooms,
            [roomId]: room
        }

        io.emit('joinedRoom', room)
        io.emit('updateRoomsState', rooms)
    })

    socket.on("readyRoom", ({ roomId, userName, userId }) => {
        const room = rooms[roomId]

        console.log('roooom',room)
        const player = room.gameState.players.find((player) => player.id === userId)
        player.toggleReady()

        const isAllPlayersReady = room.gameState.players.every((player) => player.isReady)

        if (isAllPlayersReady && room.gameState.players.length > 1) {
            room.gameState.startGame();
        }

        io.emit('updateRoomState', room)
    })

    socket.on("createUser", () => {
        const userId = generateId()

        io.to(socket.id).emit('userCreated', userId)
    })

    socket.on('leaveRoom', ({ roomId, userId }) => {
        const room = rooms[roomId]

        if (room.gameState.players.length === 1) {
            delete rooms[roomId]

            socket.leave(roomId)

            io.emit('updateRoomsState', rooms)

            return
        }

        const removedPlayer = room.gameState.players.filter(({ id }) => id != userId)
        const newRoom = { ...room, players: removedPlayer }

        rooms = {
            ...rooms,
            [roomId]: newRoom
        }

        socket.leave(roomId)

        io.emit('updateRoomsState', rooms)
        io.to(roomId).emit("updateRoomState", newRoom)
    })

    socket.on("startGame", (roomId) => {
        const room = rooms[roomId]

        room.gameState.startGame()

        io.emit('updateRoomState', room)
    })
    
    socket.on("gameCommand", ({ roomId, player, card, command }) => {
        const room = rooms[roomId]
        
        room.gameState.runCommand(card, player, command)
        
        io.emit('updateRoomState', room)
    })
})


server.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`);
});