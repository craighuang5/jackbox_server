export default class Player {
  private username: string;
  private score: number;

  constructor(username: string) {
    this.username = username;
    this.score = 0;
  }

  getUsername() {
    return this.username;
  }

  getScore() {
    return this.score;
  }

  setScore(score: number) {
    this.score = score;
  }
}