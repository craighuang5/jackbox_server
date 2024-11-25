import { Server } from "socket.io";
import { serverEvents } from '../types/events';
import { Room } from './rooms';
import * as IServer from '../types/IServer';
import { STATE_DURATIONS, STATE_NAMES } from './gameConstants';

class GameLogic {
  private io: Server;
  private gameid: string;
  private currentState: number;
  private stateOrder: string[];

  constructor(io: Server, gameid: string) {
    this.io = io;
    this.gameid = gameid;
    this.currentState = 0;
    this.stateOrder = [
      STATE_NAMES.wordSelect,
      STATE_NAMES.draw,
      STATE_NAMES.caption,
      STATE_NAMES.vote,
      STATE_NAMES.score,
    ];
  }

  startRound() {
    this.handleCurrentState();
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
    const currentStateName = this.stateOrder[this.currentState];
    if (currentStateName === STATE_NAMES.wordSelect) {
      // Do something
    }
    this.currentState += 1;
    this.handleCurrentState();
  }

  private handleCurrentState() {
    const currentStateName = this.stateOrder[this.currentState];
    // const stateName = this.stateOrder[this.currentState];
    // console.log(`Transitioned to state: ${stateName}`);
    // // If statements for each state
    // // Emit the event
    // // Handle updating the room
    // // Start the timer
    // const duration = GAME_DURATIONS[this.currentState];
    // this.startTimer(duration);

    if (currentStateName === STATE_NAMES.wordSelect) {

      this.io.in(this.gameid).emit(serverEvents.wordSelectStart);
      this.startTimer(STATE_DURATIONS.wordSelect);
    }
  }
}

export default GameLogic;