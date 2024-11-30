import { Player } from "./rooms";
import { POINTS } from "./gameConstants";

export class matchUp {
  private prompt: string;
  private championDrawing: string;
  private championCaption: string;
  private championPlayer: Player;
  private challengerDrawing: string;
  private challengerCaption: string;
  private challengerPlayer: Player | null;
  private championPoints: number;
  private challengerPoints: number;

  constructor(prompt: string, championDrawing: string, championCaption: string, championPlayer: Player) {
    this.prompt = prompt;
    this.championDrawing = championDrawing;
    this.championCaption = championCaption;
    this.championPlayer = championPlayer;
    this.challengerDrawing = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjH3g/eTAAAAtGVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECAA4AAABaAAAAaYcEAAEAAABoAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xAAMAAJAHAAQAAAAwMjMwAaADAAEAAAABAAAABaAEAAEAAACSAAAAAAAAAAIAAQACAAQAAABSOTgAAgAHAAQAAAAwMTAwAAAAAGOkJsRSTv3MAAAADElEQVQYV2P4//8/AAX+Av6nNYGEAAAAAElFTkSuQmCC';
    this.challengerCaption = '';
    this.challengerPlayer = null;
    this.championPoints = 0;
    this.challengerPoints = 0;
  }
  getPrompt(): string {
    return this.prompt;
  }

  setPrompt(value: string) {
    this.prompt = value;
  }

  getChampionDrawing(): string {
    return this.championDrawing;
  }

  setChampionDrawing(value: string) {
    this.championDrawing = value;
  }

  getChampionCaption(): string {
    return this.championCaption;
  }

  setChampionCaption(value: string) {
    this.championCaption = value;
  }

  getChampionPlayer(): Player {
    return this.championPlayer;
  }

  setChampionPlayer(value: Player) {
    this.championPlayer = value;
  }

  getChallengerDrawing(): string {
    return this.challengerDrawing;
  }

  setChallengerDrawing(value: string) {
    this.challengerDrawing = value;
  }

  getChallengerCaption(): string {
    return this.challengerCaption;
  }

  setChallengerCaption(value: string) {
    this.challengerCaption = value;
  }

  getChallengerPlayer(): Player | null {
    return this.challengerPlayer;
  }

  setChallengerPlayer(value: Player | null) {
    this.challengerPlayer = value;
  }

  getChampionPoints() {
    return this.championPoints
  }

  setChampionPoints(value: number) {
    this.championPoints = value
  }

  getChallengerPoints() {
    return this.challengerPoints
  }

  setChallengerPoints(value: number) {
    this.challengerPoints = value
  }

  updatePlayerPoints() {
    const currentChampionScore = this.championPlayer?.getScore()
    const currentChallengerScore = this.championPlayer?.getScore()
    this.championPlayer?.setScore(currentChampionScore + this.championPoints * POINTS.multiplier)

    if (this.challengerPoints === this.championPoints) {
      this.challengerPlayer?.setScore(currentChallengerScore + this.challengerPoints * POINTS.multiplier + POINTS.bonus)
    }
    else {
      this.challengerPlayer?.setScore(currentChallengerScore + this.challengerPoints * POINTS.multiplier)
    }
    console.log(`Player ${this.championPlayer?.getUsername()}'s points: ${this.championPlayer?.getScore()}`)
    console.log(`Player ${this.challengerPlayer?.getUsername()}'s points: ${this.challengerPlayer?.getScore()}`)
  }
}