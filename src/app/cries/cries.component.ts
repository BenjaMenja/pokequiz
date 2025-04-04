import { Component, OnDestroy } from '@angular/core';
import { Pokedex } from 'pokeapi-js-wrapper';
import { defaultSettings, FormatInput } from '../constants';
import { NgIf } from '@angular/common';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { LocalStorageService } from '../services/LocalStorageService';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cries',
  imports: [NgIf, DiffdisplayComponent, RouterModule],
  templateUrl: './cries.component.html',
  styleUrl: './cries.component.css',
})
export class CriesComponent implements OnDestroy {
  constructor(private storageService: LocalStorageService) {
    const settings: any = this.storageService.getItem('settings');
    this.maxTimer = settings.timer || defaultSettings.timer;
    this.maxRounds = settings.rounds || defaultSettings.rounds;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerHolder);
    clearTimeout(this.fetchTimeout);
  }

  private P = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5000,
    cacheImages: true,
  });

  // Game Data
  public cryData: string = '';
  public pkmnName: string = '';
  public sprite: string = '';
  public nameGuess: string = '';
  public correct: boolean = false;
  private volume: number = 0.25;

  // Other Data
  public score: number = 0;
  public round: number;
  public status: number = 0;
  public maxscore: number = 0;
  public timer: number;
  public timerHolder: NodeJS.Timeout;
  public fetchTimeout: NodeJS.Timeout;

  // Settings
  public maxTimer: number;
  private maxRounds: number;

  fetchPokemon() {
    // Don't include special forms because their cries will be the same
    const PkmnID: number = Math.floor(Math.random() * 1025) + 1;
    try {
      this.P.resource('https://pokeapi.co/api/v2/pokemon/' + PkmnID).then(
        (data) => {
          console.log(data);
          this.cryData = data.cries.latest;
          this.pkmnName = data.name;
          this.sprite = data.sprites.front_default;
        }
      );
    } catch (err) {
      console.error('No Pokemon Found: ', err);
    }
  }

  updateInputData(target: any): void {
    if (target !== null) {
      this.nameGuess = target.value;
    }
  }

  updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new move, 3 is game end
    this.status = status;
    if (status === 1) {
      this.timer = this.maxTimer;
      this.timerHolder = setInterval(this.decrementTimer, 1000);
    }
    if (status === 2) {
      this.nextRound();
    }
  }

  resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.cryData = '';
    this.nameGuess = '';
    this.correct = false;
    this.startGame();
  }

  startGame() {
    this.round = 1;
    this.fetchPokemon();
    this.updateGameStatus(1);
  }

  nextRound(): void {
    clearInterval(this.timerHolder);
    if (this.round >= this.maxRounds) {
      this.fetchTimeout = setTimeout(() => {
        this.updateGameStatus(3);
        return;
      }, 3000);
    } else {
      this.fetchTimeout = setTimeout(() => {
        this.cryData = '';
        this.nameGuess = '';
        this.correct = false;
        this.fetchPokemon();
        this.updateGameStatus(1);
        this.round++;
      }, 3000);
    }
  }

  decrementTimer = () => {
    if (this.timer <= 0) {
      this.makeGuess(new Event('none'));
    } else {
      this.timer--;
    }
  };

  changeVolume(target: any) {
    if (target !== null) {
      this.volume = target.value;
    }
  }

  playAudio() {
    const audio: HTMLAudioElement = new Audio(this.cryData);
    audio.volume = this.volume;
    audio.play();
  }

  makeGuess(e: Event): void {
    e.preventDefault();
    this.maxscore++;
    this.playAudio();
    if (this.pkmnName === FormatInput(this.nameGuess)) {
      this.score++;
      this.correct = true;
    }
    this.updateGameStatus(2);
  }
}
