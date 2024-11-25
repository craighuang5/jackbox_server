import { Socket, Server } from "socket.io";
import * as IClient from "../types/IClient";
import * as IServer from "../types/IServer";
import { Rooms, Room, Player } from "../utils/rooms";
import { print } from "../utils/common";
import { serverEvents, clientEvents } from '../types/events';
import * as Errors from '../types/errors';
import 'dotenv/config'
import { server } from "typescript";
import GameLogic from './gameLogic';

let roomid = 1;
const rooms = new Rooms();

export default class EventHandler {

  static createGame(io: Server, socket: Socket, request: IClient.ICreateGame) {
    try {
      // create new room
      if (!request.username) throw Errors.USER_NOT_DEFINED;
      print(`User ${request.username} created new room ${roomid}`)
      socket.join(roomid + '');

      // update rooms object
      const room = rooms.addRoomWithID(roomid + '', request.gameType, request.rounds);
      room?.addPlayer(request.username);
      room?.setGameType(request.gameType);
      room?.setTotalRounds(request.rounds);

      socket.emit(serverEvents.connected) // inform client of successful connection
      if (room) this.emitRoomUpdate(io, room) // send initial room update

      // increment roomid
      roomid += 1;
    } catch (e: any) {
      print(e.message)
      socket.emit(serverEvents.error, e.message)
    }

  }

  static joinGame(io: Server, socket: Socket, request: IClient.IJoinGame) {
    try {
      if (!io.sockets.adapter.rooms.get(request.gameid)) throw Errors.INVALID_GAMEID;
      if (!request.username) throw Errors.USER_NOT_DEFINED;

      let username = request.username;
      const room = rooms.getRoom(request.gameid)

      if (room?.hasUsername(request.username)) {
        print('Username taken')
        username += '2'
        socket.emit(serverEvents.usernameTaken, username)
      } // Username taken, append _1
      print(`User ${username} joined room ${request.gameid}`)
      socket.join(request.gameid) // add user to room
      room?.addPlayer(username); // add user to room object

      socket.emit(serverEvents.connected) // inform client of successful connection
      if (room) this.emitRoomUpdate(io, room) // send room update to all clients in room
    } catch (e: any) {
      print(e.message)
      socket.emit(serverEvents.error, e.message)
    }
  }

  static startTutorial(io: Server, socket: Socket, request: IClient.IStartTutorial) {
    try {
      io.in(request.gameid).emit(serverEvents.tutorialStart)
    } catch (e: any) {
      print(e.message)
      socket.emit(serverEvents.error, e.message)
    }
  }

  static leaveGame(io: Server, socket: Socket, request: IClient.ILeaveGame) {
    try {
      print(`User ${request.username} left room ${request.gameid}`)
      socket.leave(request.gameid);
      const room = rooms.getRoom(request.gameid)
      room?.removePlayer(request.username);
      if (room) this.emitRoomUpdate(io, room)
    } catch (e: any) {
      print(e.message)
      socket.emit(serverEvents.error, e.message)
    }
  }

  private static emitRoomUpdate(io: Server, room: Room) {
    // emit updates
    io.in(room.getID()).emit(serverEvents.roomUpdate, {
      gameid: room.getID() + '',
      players: room?.getPlayers().map(player => player.getUsername()),
      gameType: room?.getGameType(),
      totalRounds: room?.getTotalRounds(),
      currentRound: room?.getCurrentRound(),
    } as IServer.IRoomUpdate)
  }
  static startRound(io: Server, socket: Socket, request: IClient.IStartRound) {
    try {
      // Check if the game has ended (current round > total rounds)
      const room = rooms.getRoom(request.gameid)
      if (!room) throw Errors.INVALID_GAMEID;
      if (room.getCurrentRound() > room.getTotalRounds()) {
        console.log(`Game ${request.gameid} has ended. Emitting winners.`);
        // Game has ended, emit winners to all players in the room
        io.in(request.gameid).emit(serverEvents.winnerStart, {
          gameid: request.gameid,
          players: room.getPlayers().map((player) => ({
            username: player.getUsername(),
            score: player.getScore(),
          })),
        });
        return;
      }
      // Game hasn't ended, start the round
      console.log(`Game ${room.getID()} Round ${room.getCurrentRound()} out of ${room.getTotalRounds()}`);
      const g = new GameLogic(io, request.gameid);
      g.startRound();
      // Round ended, increment current round and emit to clients
      room.setCurrentRound(room.getCurrentRound() + 1);
      this.emitRoomUpdate(io, room);
    } catch (e: any) {
      print(e.message)
      socket.emit(serverEvents.error, e.message)
    }
  }

  static handleSubmitWordSelection(io: Server, socket: Socket, request: IClient.ISubmitWordSelection) {
    try {
      const { gameid, username, selectedNouns, selectedVerbs } = request;
      console.log('**********************************************************************************************')
      console.log(`Received selected words from ${username} for game ${gameid}:`, selectedNouns, selectedVerbs);
      // Store the words for the user
      const room = rooms.getRoom(request.gameid)
      if (!room) throw Errors.INVALID_GAMEID;
      const p = room.getPlayerByUsername(request.username)
      if (!p) throw Errors.USER_NOT_DEFINED;
      p.setNouns(request.selectedNouns)
      p.setVerbs(request.selectedVerbs)
      const n = p.getNouns()
      const v = p.getVerbs()
      console.log(`saved words for player ${p.getUsername()}:\nNouns: ${n.length > 0 ? n.join(", ") : ""}\nVerbs: ${v.length > 0 ? v.join(", ") : ""}`
      )
      console.log('**********************************************************************************************')

    } catch (e: any) {
      print(e.message);
      socket.emit(serverEvents.error, e.message);
    }
  }
}

