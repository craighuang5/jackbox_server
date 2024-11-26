import { Socket, Server } from "socket.io";
import { serverEvents } from '../types/events';
import { Room, Player } from './rooms';
import * as IServer from '../types/IServer';
import { STATE_DURATIONS, STATE_NAMES, GEMINI_PROMPT } from './gameConstants';
import axios from 'axios';
import { serverUrl } from "./originConfig";

class GameLogic {
  private io: Server;
  private socket: Socket;
  private room: Room;
  private players: Player[]
  private gameid: string;
  private currentState: number;
  private stateOrder: string[];

  constructor(io: Server, socket: Socket, room: Room) {
    this.io = io;
    this.socket = socket;
    this.room = room;
    this.players = room.getPlayers();
    this.gameid = room.getID();
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

  private waitSeconds(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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

  private handleCurrentState() {
    const currentStateName = this.stateOrder[this.currentState];
    if (currentStateName === STATE_NAMES.wordSelect) {
      this.io.in(this.gameid).emit(serverEvents.wordSelectStart);
      this.startTimer(STATE_DURATIONS.wordSelect);
    }
    else if (currentStateName === STATE_NAMES.draw) {
      this.io.in(this.gameid).emit(serverEvents.drawStart);
      // this.startTimer(STATE_DURATIONS.draw);
    }
  }

  private async handleTimerEnd() {
    const currentStateName = this.stateOrder[this.currentState];
    if (currentStateName === STATE_NAMES.wordSelect) {
      await this.handleWordSelectEnd();
    }

    // Move to the next state after all prompts are revealed
    this.currentState += 1;
    this.handleCurrentState();
  }

  private async useGemini(data: Record<string, any>): Promise<string> {
    try {
      const response = await axios.post<{ response: string }>(`${serverUrl}/generate-prompt`, data);
      return response.data.response.trim();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to generate response');
    }
  }

  private async handleWordSelectEnd() {
    // Create an array to store the prompts for each player
    const promptPromises = this.players.map(async (player) => {
      const nouns = player.getNouns();
      const verbs = player.getVerbs();
      const nounsList = nouns.length > 0 ? nouns.join(", ") : "no nouns selected";
      const verbsList = verbs.length > 0 ? verbs.join(", ") : "no verbs selected";

      // Construct the prompt by appending the selected nouns and verbs
      const prompt = `${GEMINI_PROMPT} Nouns: ${nounsList}. Verbs: ${verbsList}.`;
      const input = { prompt: prompt };
      try {
        const response = await this.useGemini(input);
        player.setPrompt(response);
        console.log('----------------------------------------------------------------------------------------------');
        console.log(`Player ${player.getUsername()}'s prompt:\n${player.getPrompt()}`);
      } catch (error) {
        console.error(`Failed to generate prompt for player ${player.getUsername()}:`, error);
      }
    });

    // Wait for all prompt generation to complete
    await Promise.all(promptPromises);

    // Emit the prompts to all players after all have been generated
    for (const player of this.players) {
      this.io.to(player.getSocketId()).emit(serverEvents.sendPrompt, {
        'username': player.getUsername(),
        'prompt': player.getPrompt()
      } as IServer.ISendPrompt);
      console.log(`Sent prompt to ${player.getUsername()}`)
    }

    // Start the prompt reveal page after waiting
    this.io.in(this.gameid).emit(serverEvents.promptRevealStart);
    await this.waitSeconds(5);
  }
}

export default GameLogic;