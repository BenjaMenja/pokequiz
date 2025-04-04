import {
  Component,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { Chart } from 'chart.js/auto';
import {
  colorBar,
  defaultSettings,
  FormatInput,
  Generations,
  MoveCategories,
  PkmnTypes,
} from '../constants';
import { Pokedex } from 'pokeapi-js-wrapper';
import { NgFor, NgIf } from '@angular/common';
import { LocalStorageService } from '../services/LocalStorageService';
import { RouterModule } from '@angular/router';

type MoveData = {
  name: string;
  type: string;
  generation: number;
  pp: number;
  power: number;
  category: string;
  accuracy: number;
};

@Component({
  selector: 'app-moves',
  imports: [DiffdisplayComponent, NgIf, NgFor, RouterModule],
  templateUrl: './moves.component.html',
  styleUrl: './moves.component.css',
})
export class MovesComponent implements OnDestroy {
  @ViewChild('chartRef', { static: false }) chartRef: ElementRef;
  public chart: Chart;
  public chartImg: string;
  constructor(
    private storageService: LocalStorageService,
    private renderer: Renderer2
  ) {
    const settings: any = this.storageService.getItem('settings');
    this.maxTimer = settings.timer || defaultSettings.timer;
    this.maxRounds = settings.rounds || defaultSettings.rounds;
    this.ppRange = settings.ppRange || defaultSettings.bstRange;
    this.powerRange = settings.powerRange || defaultSettings.heightRange;
    this.accuracyRange = settings.accuracyRange || defaultSettings.weightRange;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerHolder);
    clearTimeout(this.fetchTimeout);
  }

  public MoveTypes = PkmnTypes.filter((e) => {
    return e !== 'None';
  });
  public MoveCategories = MoveCategories;
  private P = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5000,
    cacheImages: true,
  });

  public moveDescription: string = '';
  public moveData: MoveData = {
    name: '',
    type: '',
    generation: 0,
    pp: 0,
    power: 0,
    category: '',
    accuracy: 0,
  };

  public moveInputData: MoveData = {
    name: '',
    type: 'normal',
    generation: 1,
    pp: 1,
    power: 0,
    category: 'physical',
    accuracy: 0,
  };

  private statistics = {
    name: 0,
    type: 0,
    generation: 0,
    pp: 0,
    power: 0,
    category: 0,
    accuracy: 0,
  };

  public guesses: Array<boolean> = [...new Array(7)].map(() => false);

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
  private ppRange: number;
  private powerRange: number;
  private accuracyRange: number;

  fetchMove() {
    // PokeAPI has 919 moves in the database
    const MoveID: number = Math.floor(Math.random() * 919) + 1;
    try {
      this.P.resource('https://pokeapi.co/api/v2/move/' + MoveID).then(
        (data) => {
          console.log(data);
          this.moveDescription = this.searchForDescription(
            data.flavor_text_entries
          );
          this.moveData.name = data.name;
          this.moveData.type = data.type.name;
          this.moveData.generation =
            Generations.indexOf(data.generation.name) + 1;
          this.moveData.pp = data.pp;
          this.moveData.power = data.power === null ? 0 : data.power;
          this.moveData.category = data.damage_class.name;
          this.moveData.accuracy = data.accuracy === null ? 0 : data.accuracy;
        }
      );
    } catch (err) {
      console.error('No description found for move: ', err);
    }
  }

  generateGraph(): void {
    let context = this.chartRef.nativeElement.getContext('2d');
    const guessdata = [
      this.statistics.name,
      this.statistics.type,
      this.statistics.generation,
      this.statistics.pp,
      this.statistics.power,
      this.statistics.category,
      this.statistics.accuracy,
    ];
    Chart.defaults.color = '#000000';
    Chart.defaults.borderColor = '#000000';
    this.chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: [
          'Name',
          'Type',
          'Generation',
          'PP',
          'Power',
          'Category',
          'Accuracy',
        ],
        datasets: [
          {
            data: guessdata,
            backgroundColor: guessdata.map((data) =>
              colorBar(Math.floor((data * 10) / this.maxRounds))
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Category',
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Score',
            },
            grid: {
              display: false,
            },
            suggestedMax: this.maxRounds,
          },
        },
        animation: {
          onComplete: () => {
            this.chartImg = this.chart.toBase64Image();
          },
        },
      },
    });
  }

  downloadGraph() {
    const anchor = this.renderer.createElement('a');
    anchor.setAttribute('target', '_self');
    anchor.setAttribute('href', this.chartImg);
    anchor.setAttribute('download', 'chart.png');
    anchor.click();
    anchor.remove();
  }

  updateInputData(target: any, field: string): void {
    if (target !== null) {
      switch (field) {
        case 'name':
          this.moveInputData.name = target.value;
          break;
        case 'type':
          this.moveInputData.type = target.value;
          break;
        case 'generation':
          this.moveInputData.generation = target.value;
          break;
        case 'pp':
          this.moveInputData.pp = target.value;
          break;
        case 'power':
          this.moveInputData.power = target.value;
          break;
        case 'category':
          this.moveInputData.category = target.value;
          break;
        case 'accuracy':
          this.moveInputData.accuracy = target.value;
          break;
        default:
          break;
      }
    }
  }

  updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new move, 3 is game end, 4 is statistics
    this.status = status;
    if (status === 1) {
      this.timer = this.maxTimer;
      this.timerHolder = setInterval(this.decrementTimer, 1000);
    }
    if (status === 2) {
      this.nextRound();
    }
    if (status === 4) {
      setTimeout(() => {
        this.generateGraph();
      }, 0);
    }
  }

  startGame() {
    this.round = 1;
    this.fetchMove();
    this.updateGameStatus(1);
  }

  resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.resetMoveData(this.moveInputData);
    this.resetMoveData(this.moveData);
    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = false;
    }
    this.startGame();
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
        this.resetMoveData(this.moveData);
        this.resetMoveData(this.moveInputData);
        for (let i = 0; i < this.guesses.length; i++) {
          this.guesses[i] = false;
        }
        this.fetchMove();
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

  resetMoveData(data: MoveData) {
    data.name = '';
    data.type = 'normal';
    data.generation = 1;
    data.pp = 1;
    data.power = 0;
    data.category = 'physical';
    data.accuracy = 0;
  }

  /**
   * Searches for the most recent (by generation) English description of a move
   * @param text_entries A list of flavor_text_entries returned by the API
   * @returns The most recent (by generation) flavor_text entry's value
   */
  searchForDescription(text_entries: Array<any>): string {
    for (let i = text_entries.length - 1; i >= 0; i--) {
      console.log(text_entries[i]);
      if (text_entries[i].language.name === 'en') {
        if (
          !text_entries[i].flavor_text.includes(
            'recommended that this move is forgotten'
          )
        ) {
          return text_entries[i].flavor_text;
        } else {
          console.log('CANT BE USED LOL');
        }
      }
    }
    return 'r';
  }

  makeGuess(e: Event): void {
    e.preventDefault();
    this.maxscore += 7;
    if (this.moveData.name === FormatInput(this.moveInputData.name)) {
      this.score++;
      this.statistics.name++;
      this.guesses[0] = true;
    }
    if (this.moveData.type === FormatInput(this.moveInputData.type)) {
      this.score++;
      this.statistics.type++;
      this.guesses[1] = true;
    }
    if (this.moveData.generation == this.moveInputData.generation) {
      this.score++;
      this.statistics.generation++;
      this.guesses[2] = true;
    }
    if (Math.abs(this.moveData.pp - this.moveInputData.pp) <= this.ppRange) {
      this.score++;
      this.statistics.pp++;
      this.guesses[3] = true;
    }
    if (
      Math.abs(this.moveData.power - this.moveInputData.power) <=
      this.powerRange
    ) {
      this.score++;
      this.statistics.power++;
      this.guesses[4] = true;
    }
    if (this.moveData.category === FormatInput(this.moveInputData.category)) {
      this.score++;
      this.statistics.category++;
      this.guesses[5] = true;
    }
    if (
      Math.abs(this.moveData.accuracy - this.moveInputData.accuracy) <=
      this.accuracyRange
    ) {
      this.score++;
      this.statistics.accuracy++;
      this.guesses[6] = true;
    }
    this.updateGameStatus(2);
  }
}
