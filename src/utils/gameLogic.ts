import { Socket, Server } from "socket.io";
import { serverEvents } from '../types/events';
import { Room, Player } from './rooms';
import * as IServer from '../types/IServer';
import { STATE_DURATIONS, STATE_NAMES, GEMINI_CHAMPION } from './gameConstants';
import * as Errors from '../types/errors';
import axios from 'axios';
import { serverUrl } from "./originConfig";
import { matchUp } from "./matchUp";

class GameLogic {
  private io: Server;
  private socket: Socket;
  private room: Room;
  private players: Player[]
  private gameid: string;
  private currentState: number;
  private stateOrder: string[];
  private currentMatchupNumber: number;

  constructor(io: Server, socket: Socket, room: Room) {
    this.io = io;
    this.socket = socket;
    this.room = room;
    this.players = room.getPlayers();
    this.gameid = room.getID();
    this.currentState = 0;
    this.stateOrder = [
      STATE_NAMES.wordSelect,
      STATE_NAMES.createChampion,
      STATE_NAMES.createChallenger,
      STATE_NAMES.vote,
      STATE_NAMES.score,
    ];
    this.currentMatchupNumber = 0;
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
    console.log('----------------------------------------------------------------------------------------------')
    console.log(`Current state: ${currentStateName}`)
    if (currentStateName === STATE_NAMES.wordSelect) {
      this.io.in(this.gameid).emit(serverEvents.wordSelectStart);
      this.startTimer(STATE_DURATIONS.wordSelect);
    }
    else if (currentStateName === STATE_NAMES.createChampion) {
      this.io.in(this.gameid).emit(serverEvents.createChampion);
      this.startTimer(STATE_DURATIONS.createChampion);
    }
    else if (currentStateName === STATE_NAMES.createChallenger) {
      const matchUps = this.room.getMatchUps();
      matchUps.forEach((matchUp) => {
        const challenger = matchUp.getChallengerPlayer();
        if (challenger) {
          this.io.to(challenger.getSocketId()).emit(serverEvents.sendMatchUp, {
            'championDrawing': matchUp.getChampionDrawing(),
            'championCaption': matchUp.getChampionCaption(),
          } as IServer.ISendMatchup);
          console.log(`Sent champion ${matchUp.getChampionPlayer().getUsername()} to ${matchUp.getChallengerPlayer()?.getUsername()}`)
        }
      });
      this.io.in(this.gameid).emit(serverEvents.createChallenger);
      this.startTimer(STATE_DURATIONS.createChallenger);
    }
    else if (currentStateName === STATE_NAMES.vote) {
      const matchUps = this.room.getMatchUps()
      const currentMatchUp = matchUps[this.currentMatchupNumber]

      if (!currentMatchUp) {
        console.error(`No matchup found for index ${this.currentMatchupNumber}`);
        return;
      }

      this.io.in(this.gameid).emit(serverEvents.updateVoteCount, {
        championPoints: currentMatchUp.getChampionPoints(),
        challengerPoints: currentMatchUp.getChallengerPoints(),
      } as IServer.IUpdateVoteCount);
      console.log('---------------------------------------------------------------------------------------------')
      const voteOption: IServer.ISendVoteOption = {
        prompt: currentMatchUp.getPrompt(),
        championCaption: currentMatchUp.getChampionCaption(),
        championDrawing: currentMatchUp.getChampionDrawing(),
        championPlayerUsername: currentMatchUp.getChampionPlayer().getUsername(),
        challengerCaption: currentMatchUp.getChallengerCaption(),
        challengerDrawing: currentMatchUp.getChallengerDrawing(),
        challengerPlayerUsername: currentMatchUp.getChallengerPlayer()?.getUsername() || 'No challenger yet',
      };
      // Emit the matchup and start the timer
      console.log(`Matchup ${this.currentMatchupNumber + 1}: ${voteOption.championCaption} vs ${voteOption.challengerCaption} for the title of ${voteOption.prompt}`)
      this.io.in(this.gameid).emit(serverEvents.sendVoteOption, voteOption);
      this.startTimer(STATE_DURATIONS.vote);
    }
    else if (currentStateName === STATE_NAMES.score) {
      const playerScores = this.room.getPlayers().map(player => ({
        username: player.getUsername(),
        score: player.getScore(),
      }));
      console.log('---------------------------------------------------------------------------------------------')
      console.log('Player Scores:', playerScores);
      this.io.in(this.gameid).emit(serverEvents.scoreStart, {
        scores: playerScores
      } as IServer.IUpdateScoreboard);
    }
  }

  private async handleTimerEnd() {
    const currentStateName = this.stateOrder[this.currentState];
    if (currentStateName === STATE_NAMES.wordSelect) {
      await this.handleWordSelectEnd();
    }
    else if (currentStateName === STATE_NAMES.createChampion) {
      await this.waitSeconds(5); // TODO: currently hard coded to wait for clients to send their champions. Dynamically code this to start after all champions are sent
      const matchUps = this.room.getMatchUps()
      console.log('---------------------------------------------------------------------------------------------')
      matchUps.forEach((matchUp) => {
        const championPlayer = matchUp.getChampionPlayer().getUsername();
        const challengerPlayer = matchUp.getChallengerPlayer()?.getUsername() || 'No challenger yet';
        console.log(`Champion: ${championPlayer}, Challenger: ${challengerPlayer}`);
      });
      this.assignOddChallengers()
    }
    else if (currentStateName === STATE_NAMES.createChallenger) {
      const matchUps = this.room.getMatchUps()
      console.log('---------------------------------------------------------------------------------------------')
      matchUps.forEach((matchUp) => {
        const championPlayer = matchUp.getChampionPlayer().getUsername();
        const challengerPlayer = matchUp.getChallengerPlayer()?.getUsername() || 'No challenger yet';
        const championCaption = matchUp.getChampionPlayer().getCaption();
        const challengerCaption = matchUp.getChallengerPlayer()?.getCaption() || 'No challenger yet';
        console.log(`Champion: ${championCaption} (${championPlayer}), Challenger: ${challengerCaption} (${challengerPlayer})`);
      });
    }
    else if (currentStateName === STATE_NAMES.vote) {
      // Count up points and store into players
      const currentMatchup = this.room.getMatchUps()[this.currentMatchupNumber];
      currentMatchup.updatePlayerPoints()
      this.currentMatchupNumber++;
      if (this.currentMatchupNumber < this.room.getMatchUps().length) {
        console.log('----------------------------------------------------------------------------------------------');
        console.log(`Current matchup number ${this.currentMatchupNumber + 1}/${this.room.getMatchUps().length}`)
        this.handleCurrentState()
        return;
      }
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
      const prompt = `${GEMINI_CHAMPION}${nounsList},${verbsList}.`;
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
      console.log('---------------------------------------------------------------------------------------------')
      console.log(`Sent prompt to ${player.getUsername()}`)
    }

    // Start the prompt reveal page after waiting
    this.io.in(this.gameid).emit(serverEvents.promptRevealStart);
  }

  private assignEvenChallengers() {
    console.log('---------------------------------------------------------------------------------------------')
    console.log('Even number of players detected, random')
    const matchUps = this.room.getMatchUps();
    const players = this.room.getPlayers();
    const chosenChallengers = new Set<Player>();

    matchUps.forEach((matchUp) => {
      // Filter available players: exclude those who are already chosen as challengers or the current champion
      const availablePlayers = players.filter(player =>
        player !== matchUp.getChampionPlayer() && !chosenChallengers.has(player)
      );

      // If there are available players, select a random challenger
      if (availablePlayers.length > 0) {
        const chosenChallenger = availablePlayers[0];

        if (players.length % 2 == 0) {
          const randomIndex = Math.floor(Math.random() * availablePlayers.length);
          const chosenChallenger = availablePlayers[randomIndex];
        }
        // Set the challenger and mark them as chosen
        matchUp.setChallengerPlayer(chosenChallenger);
        chosenChallengers.add(chosenChallenger);
        console.log(`Created matchup with player: ${matchUp.getChampionPlayer().getUsername()}, Challenger: ${matchUp.getChallengerPlayer()?.getUsername()}`);
      } else {
        // Handle case when no available players are left for a matchup (should never occur)
        console.log(`No available challengers for Champion: ${matchUp.getChampionPlayer().getUsername()}`);
      }
    });
  }

  private assignOddChallengers() {
    console.log('---------------------------------------------------------------------------------------------');
    console.log('Odd number of players detected, no repeating matchups');

    const players = this.room.getPlayers();
    const matchUps = this.room.getMatchUps();

    // Simple pairing logic: pair players sequentially
    for (let i = 0; i < matchUps.length; i++) {
      const matchUp = matchUps[i];
      const champion = matchUp.getChampionPlayer();
      const championIndex = players.findIndex(player => player === champion);
      const challengerIndex = (championIndex + 1) % players.length;
      const challenger = players[challengerIndex];
      matchUp.setChallengerPlayer(challenger);
      console.log(`Created matchup: Champion: ${champion.getUsername()}, Challenger: ${challenger.getUsername()}`);
    }
  }

}

export default GameLogic;