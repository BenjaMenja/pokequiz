import { Pokedex } from 'pokeapi-js-wrapper';
import { defaultSettings } from '../constants';
import { LocalStorageService } from '../services/LocalStorageService';

interface BasicQuizFunctions {
  fetchData(): void;
  updateInputData(target: any, field: string): void;
  updateGameStatus(status: number): void;
  startGame(): void;
  resetGame(): void;
  nextRound(): void;
  advanceRound(): void;
  decrementTimer(): void;
  makeGuess(e: Event): void;
  applySettings(settings: any): void;
}

export class BasicQuiz implements BasicQuizFunctions {
  // Settings Values
  protected maxTimer: number;
  protected maxRounds: number;
  protected timeBetween: number;
  protected pendingSettings: any = null;

  // Game Data
  protected score: number = 0;
  protected round: number;
  protected status: number = 0;
  protected maxscore: number = 0;
  protected timer: number;
  protected timerHolder: NodeJS.Timeout;
  protected fetchTimeout: NodeJS.Timeout;

  protected P = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5000,
    cacheImages: true,
  });

  constructor(protected storageService: LocalStorageService) {
    const settings: any = this.storageService.getItem('settings');
    this.maxTimer = settings.timer || defaultSettings.timer;
    this.maxRounds = settings.rounds || defaultSettings.rounds;
    this.timeBetween = settings.timeBetween || defaultSettings.timeBetween;
  }

  /**
   * Fetches data required for this quiz.
   */
  fetchData(): void {}

  /**
   * Updates the user input data.
   * @param target The target element from the input event.
   * @param field The input field to change.
   */
  updateInputData(target: any, field: string): void {}

  /**
   * Updates the game status.
   * 0 is the start, 1 is game running, 2 is generating new move, 3 is game end
   * @param status The status code.
   */
  updateGameStatus(status: number): void {}

  /**
   * Starts the game. Usually will set round to 1, fetch data, and set the game status to 1.
   */
  startGame(): void {
    this.round = 1;
    this.fetchData();
    this.updateGameStatus(1);
  }

  /**
   * Resets the game. Usually will reset all data back to default and call startGame().
   */
  resetGame(): void {}

  /**
   * Handles logic pertaining to starting the next round.
   */
  nextRound(): void {
    clearInterval(this.timerHolder);
    if (this.round >= this.maxRounds) {
      clearInterval(this.timerHolder);
      if (this.timeBetween > 0) {
        this.timer = this.timeBetween;
        this.timerHolder = setInterval(() => this.decrementTimer(), 1000);
        this.fetchTimeout = setTimeout(() => {
          clearInterval(this.timerHolder);
          this.updateGameStatus(3);
          return;
        }, this.timeBetween * 1000);
      }
    } else {
      if (this.timeBetween > 0) {
        this.timer = this.timeBetween;
        this.timerHolder = setInterval(() => this.decrementTimer(), 1000);
        this.fetchTimeout = setTimeout(() => {
          this.advanceRound();
        }, this.timeBetween * 1000);
      }
    }
  }

  /**
   * Advances to the next round. Called by nextRound() after an amount of time set in the settings. Usually will reset data, fetch new data, increment the round, and reset the game status to 1.
   */
  advanceRound(): void {
    if (this.timeBetween > 0) {
      clearInterval(this.timerHolder);
    }
    if (this.round >= this.maxRounds) {
      this.updateGameStatus(3);
    } else {
      this.fetchData();
      this.updateGameStatus(1);
      this.round++;
    }
  }

  /**
   * Decrements the current timer by 1. If the game is running, forces a guess when the timer is 0. If waiting for the next round, advances the round when the timer is 0.
   */
  decrementTimer(): void {
    if (this.timer <= 0) {
      if (this.status === 1) {
        this.makeGuess(new Event('none'));
      } else if (this.status === 2) {
        this.advanceRound();
      }
    } else {
      this.timer--;
    }
  }

  /**
   * Performs a guess.
   * @param e The event that triggers this guess.
   */
  makeGuess(e: Event): void {}

  /**
   * Applies new settings to the quiz. Can only be done while a game is not active.
   * @param settings A settings object
   */
  applySettings(settings: any): void {
    if (this.status !== 1) {
      this.maxTimer = settings.timer;
      this.maxRounds = settings.rounds;
      this.timeBetween = settings.timeBetween;
    }
  }
}
