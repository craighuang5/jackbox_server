// these event interfaces are emitted by the client to the server

export interface ICreateGame {
  username: string
  gameType: string
  rounds: number
}

export interface IJoinGame {
  username: string;
  gameid: string;
}

export interface IStartTutorial {
  gameid: string;
}

export interface ILeaveGame {
  username: string;
  gameid: string;
}

export interface IStartRound {
  gameid: string;
  currentRound: number
}

export interface ISubmitWordSelection {
  gameid: string;
  username: string;
  selectedNouns: string[];
  selectedVerbs: string[];
}

export interface ISubmitChampion {
  prompt: string;
  gameid: string;
  username: string;
  drawing: string;
  caption: string;
}

export interface ISubmitChallenger {
  gameid: string;
  username: string;
  drawing: string;
  caption: string;
}

export interface ISubmitVote {
  gameid: string;
  championUsername: string;
  championPoints: number;
  challengerUsername: string;
  challengerPoints: number;
}
