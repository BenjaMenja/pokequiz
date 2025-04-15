import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormatInput } from '../constants';
import { NgIf } from '@angular/common';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { RouterModule } from '@angular/router';
import { BasicQuiz } from '../base_classes/BasicQuiz';
import { LocalStorageService } from '../services/LocalStorageService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cries',
  imports: [NgIf, DiffdisplayComponent, RouterModule],
  templateUrl: './cries.component.html',
  styleUrl: './cries.component.css',
})
export class CriesComponent extends BasicQuiz implements OnDestroy, OnInit {
  private settingsSub: Subscription;
  constructor(protected override storageService: LocalStorageService) {
    super(storageService);
  }

  ngOnInit(): void {
    this.settingsSub = this.storageService.settings$.subscribe(
      (newSettings) => {
        if (this.status === 1 || this.status === 2) {
          this.pendingSettings = newSettings;
        } else {
          this.updateSettings(newSettings);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.settingsSub.unsubscribe();
    clearInterval(this.timerHolder);
    clearTimeout(this.fetchTimeout);
  }

  // Quiz Data
  public cryData: string = '';
  public pkmnName: string = '';
  public sprite: string = '';
  public nameGuess: string = '';
  public correct: boolean = false;
  private volume: number = 0.25;

  override fetchData() {
    // Don't include special forms because their cries will be the same
    const PkmnID: number = Math.floor(Math.random() * 1025) + 1;
    try {
      this.P.resource('https://pokeapi.co/api/v2/pokemon/' + PkmnID).then(
        (data) => {
          this.cryData = data.cries.latest;
          this.pkmnName = data.name;
          this.sprite = data.sprites.front_default;
        }
      );
    } catch (err) {
      console.error('No Pokemon Found: ', err);
    }
  }

  override updateInputData(target: any, field: string): void {
    if (target !== null) {
      switch (field) {
        case 'name':
          this.nameGuess = target.value;
          break;
        default:
          break;
      }
    }
  }

  override updateGameStatus(status: number): void {
    this.status = status;
    if (status !== 1 && status !== 2 && this.pendingSettings !== null) {
      this.updateSettings(this.pendingSettings);
    }
    if (status === 1) {
      this.timer = this.maxTimer;
      this.timerHolder = setInterval(() => this.decrementTimer(), 1000);
    }
    if (status === 2) {
      this.nextRound();
    }
  }

  updateSettings(settings: any) {
    super.applySettings(settings);
  }

  override resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.cryData = '';
    this.nameGuess = '';
    this.correct = false;
    this.startGame();
  }

  override advanceRound(): void {
    this.cryData = '';
    this.nameGuess = '';
    this.correct = false;
    super.advanceRound();
  }

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

  override makeGuess(e: Event): void {
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
