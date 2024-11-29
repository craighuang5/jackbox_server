// these event interfaces are emitted by the server to the Client

export interface IRoomUpdate {
  gameid: string;
  gameType: string;
  // players: IPlayer[];
  players: string[];
  totalRounds: number;
  currentRound: number;
}

export interface ITimerUpdate {
  gameid: string;
  time: number;
}

export interface ISendPrompt {
  username: string;
  prompt: string;
}

export interface ISendMatchup {
  championCaption: string;
  championDrawing: string;
}