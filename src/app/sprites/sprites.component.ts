import { Component, OnDestroy, OnInit } from '@angular/core';
import { BasicQuiz } from '../base_classes/BasicQuiz';
import { NgIf } from '@angular/common';
import { LocalStorageService } from '../services/LocalStorageService';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { FormatInput } from '../constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sprites',
  imports: [NgIf, DiffdisplayComponent],
  templateUrl: './sprites.component.html',
  styleUrl: './sprites.component.css',
})
export class SpritesComponent extends BasicQuiz implements OnDestroy, OnInit {
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

  public sprite: string = '';
  public pkmnName: string = '';
  public nameGuess: string = '';
  public correct: boolean;

  override fetchData(): void {
    const PkmnID: number = Math.floor(Math.random() * 1025) + 1;
    try {
      this.P.resource('https://pokeapi.co/api/v2/pokemon/' + PkmnID).then(
        (data) => {
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
    this.nameGuess = '';
    this.sprite = '';
    this.correct = false;
    this.startGame();
  }

  override advanceRound(): void {
    this.nameGuess = '';
    this.correct = false;
    super.advanceRound();
  }

  override makeGuess(e: Event): void {
    e.preventDefault();
    this.maxscore++;
    if (this.pkmnName === FormatInput(this.nameGuess)) {
      this.score++;
      this.correct = true;
    }
    this.updateGameStatus(2);
  }
}
