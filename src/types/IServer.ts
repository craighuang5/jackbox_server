// these event interfaces are emitted by the server to the Client

// export interface IPlayer {
//   username: string;
//   score: number;
//   nouns: string[];
//   verbs: string[];
//   prompt: string;
//   caption: string;
//   drawing: string;
// }

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