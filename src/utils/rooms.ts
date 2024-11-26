export class Rooms {
  private rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  addRoomWithID(id: string, gameType: string, rounds: number) {
    this.rooms.push(new Room(id, gameType, rounds));
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
  private totalRounds: number;
  private currentRound: number;

  constructor(id: string, gameType: string, totalRounds: number) {
    this.id = id;
    this.players = [];
    this.gameType = gameType;
    this.totalRounds = totalRounds;
    this.currentRound = 1;
  }

  addPlayer(username: string, socketId: string) {
    const player = new Player(username, socketId)
    this.players.push(player);
  }

  removePlayer(username: string) {
    this.players = this.players.filter((p) => p.getUsername() !== username);
  }

  getPlayers() {
    return this.players;
  }

  getTotalRounds() {
    return this.totalRounds;
  }

  setTotalRounds(rounds: number) {
    this.totalRounds = rounds;
  }

  getCurrentRound() {
    return this.currentRound;
  }

  setCurrentRound(round: number) {
    this.currentRound = round;
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

  getPlayerByUsername(username: string): Player | null {
    const player = this.players.find((p) => p.getUsername() === username);
    return player || null;
  }
}

export class Player {
  private username: string;
  private score: number;
  private nouns: string[];
  private verbs: string[];
  private prompt: string;
  private caption: string;
  private drawing: string;
  private socketId: string;

  // Constructor with default values for all attributes
  constructor(
    username: string,
    socketId: string,
    score: number = 0,
    nouns: string[] = [],
    verbs: string[] = [],
    prompt: string = '',
    caption: string = '',
    drawing: string = ''
  ) {
    this.username = username;
    this.socketId = socketId;
    this.score = score;
    this.nouns = nouns;
    this.verbs = verbs;
    this.prompt = prompt;
    this.caption = caption;
    this.drawing = drawing;
  }

  getUsername() {
    return this.username;
  }

  getSocketId() {
    return this.socketId; // Add getter for socketId
  }

  getScore() {
    return this.score;
  }

  setScore(score: number) {
    this.score = score;
  }

  getNouns() {
    return this.nouns;
  }

  setNouns(nouns: string[]) {
    this.nouns = nouns;
  }

  getVerbs() {
    return this.verbs;
  }

  setVerbs(verbs: string[]) {
    this.verbs = verbs;
  }

  getPrompt() {
    return this.prompt;
  }

  setPrompt(prompt: string) {
    this.prompt = prompt;
  }

  getCaption() {
    return this.caption;
  }

  setCaption(caption: string) {
    this.caption = caption;
  }

  getDrawing() {
    return this.drawing;
  }

  setDrawing(drawing: string) {
    this.drawing = drawing;
  }

  toJSON() {
    return {
      username: this.username,
      score: this.score,
      nouns: this.nouns,
      verbs: this.verbs,
      prompt: this.prompt,
      caption: this.caption,
      drawing: this.drawing,
    };
  }
}
