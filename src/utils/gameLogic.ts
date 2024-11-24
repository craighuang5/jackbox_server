import { Server } from "socket.io";
import { serverEvents } from '../types/events';
import * as IServer from '../types/IServer';
import { GAME_DURATIONS } from './gameConstants';


class GameLogic {
  private io: Server;
  private gameid: string;
  private currentPhase: string;

  constructor(io: Server, gameid: string) {
    this.io = io;
    this.gameid = gameid;
    this.currentPhase = '';
  }

  startWordSelection() {
    this.currentPhase = 'wordSelection';
    this.io.in(this.gameid).emit(serverEvents.wordSelectStart);
    this.startTimer(GAME_DURATIONS.wordSelect);
  }

  private startTimer(duration: number) {
    let timeLeft = duration;

    const interval = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(interval);
        this.handleTimerEnd();
        return;
      }
      this.io.in(this.gameid).emit(serverEvents.timerUpdate, { gameid: this.gameid, time: timeLeft } as IServer.ITimerUpdate);
      timeLeft -= 1;
    }, 1000);
  }

  private handleTimerEnd() {
    if (this.currentPhase === 'wordSelection') {
      // Handle end of word selection phase
      console.log('Word selection phase ended');
      // Transition to the next phase or handle accordingly
    }
  }
}

export default GameLogic;