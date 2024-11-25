import Player from './player';

export class Rooms {
  private rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  addRoomWithID(id: string, gameType: string) {
    this.rooms.push(new Room(id, gameType));
    return this.getRoom(id)
  }

  removeRoom(room: Room) {
    this.rooms = this.rooms.filter((r) => r.getID() !== room.getID());
  }

  removeRoomWithID(id: string) {
    this.rooms = this.rooms.filter((r) => r.getID() !== id);
  }

  getRoom(id: string) {
    return this.rooms.find((r) => r.getID() === id);
  }

  getRooms() {
    return this.rooms;
  }
}

export class Room {
  private id: string;
  private players: Player[];
  private gameType: string;

  constructor(id: string, gameType: string) {
    this.id = id;
    this.players = [];
    this.gameType = gameType;
  }

  addPlayer(username: string) {
    const player = new Player(username)
    this.players.push(player);
  }

  removePlayer(username: string) {
    this.players = this.players.filter((p) => p.getUsername() !== username);
  }

  getPlayers() {
    return this.players;
  }

  hasUsername(username: string) {
    return this.players.some((p) => p.getUsername() === username);
  }

  setGameType(gameType: string) {
    this.gameType = gameType;
  }

  getGameType() {
    return this.gameType;
  }

  getID() {
    return this.id;
  }
}