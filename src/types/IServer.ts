// these event interfaces are emitted by the server to the Client

export interface IRoomUpdate {
  gameid: string;
  gameType: string;
  players: string[];
}

export interface ITimerUpdate {
  gameid: string;
  time: number;
}