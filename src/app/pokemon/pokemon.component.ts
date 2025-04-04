import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  PkmnTypes,
  FormatInput,
  colorBar,
  findGeneration,
  findGenerationByDexID,
  defaultSettings,
} from '../constants';
import { Pokedex } from 'pokeapi-js-wrapper';
import { Chart } from 'chart.js/auto';
import { RouterModule } from '@angular/router';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { LocalStorageService } from '../services/LocalStorageService';

type PokemonInputData = {
  type1: string;
  type2: string;
  bst: number;
  ability1: string;
  ability2: string;
  ability3: string;
  generation: number;
  height: number;
  weight: number;
};

@Component({
  selector: 'app-pokemon',
  imports: [NgFor, NgIf, RouterModule, DiffdisplayComponent],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.css',
})
export class PokemonComponent implements OnDestroy {
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
    this.bstRange = settings.bstRange || defaultSettings.bstRange;
    this.heightRange = settings.heightRange || defaultSettings.heightRange;
    this.weightRange = settings.weightRange || defaultSettings.weightRange;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerHolder);
  }

  // Consts
  public PkmnTypes = PkmnTypes;
  private P = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5000,
    cacheImages: true,
  });

  // Pokemon Data
  public pkmndata: Object = {};
  public bst: number = 0;
  public types: string[] = [];
  public generation: number = 1;
  public abilities: string[] = [];
  public height: number = 0;
  public weight: number = 0;
  public sprite: string = '';
  public name: string = '';
  public displayName: string;

  // Input Data
  public inputData: PokemonInputData = {
    type1: 'None',
    type2: 'None',
    bst: 0,
    ability1: 'None',
    ability2: 'None',
    ability3: 'None',
    generation: 0,
    height: 0,
    weight: 0,
  };

  // Statistic Data
  private statistics = {
    bst: 0,
    type: 0,
    generation: 0,
    abilities: 0,
    height: 0,
    weight: 0,
  };

  // Guess Data
  public guesses: Array<boolean> = [...new Array(6)].map(() => false);

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
  private bstRange: number;
  private heightRange: number;
  private weightRange: number;

  // Functions
  // Ids range from 1-1025 and 10001-10277 (Forms such as Deoxys-Attack)
  fetchPokemon(): void {
    let pkmnID: number;
    do {
      pkmnID = Math.floor(Math.random() * 10277) + 1;
    } while (pkmnID > 1025 && pkmnID < 10001);
    this.P.resource('https://pokeapi.co/api/v2/pokemon/' + pkmnID).then(
      (data) => {
        console.log(data);
        this.pkmndata = data;
        this.name = data.species.name;
        this.displayName = this.name[0].toUpperCase() + this.name.substring(1);
        this.sprite = data.sprites.front_default;
        this.height = data.height / 10;
        this.weight = data.weight / 10;
        for (const ability of data.abilities) {
          this.abilities.push(ability.ability.name);
        }
        for (const type of data.types) {
          this.types.push(type.type.name);
        }
        if (data.game_indices.length > 0) {
          this.generation = findGeneration(data.game_indices[0].version.name);
        } else {
          this.generation = findGenerationByDexID(data.id);
        }
        this.bst = 0;
        this.bst = data.stats.reduce((a: number, b: any) => {
          return a + b.base_stat;
        }, 0);
      }
    );
  }

  generateGraph(): void {
    let context = this.chartRef.nativeElement.getContext('2d');
    const guessdata = [
      this.statistics.type,
      this.statistics.abilities,
      this.statistics.generation,
      this.statistics.bst,
      this.statistics.height,
      this.statistics.weight,
    ];
    Chart.defaults.color = '#000000';
    Chart.defaults.borderColor = '#000000';
    this.chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: [
          'Types',
          'Abilities',
          'Generation',
          'Base Stat Total',
          'Height',
          'Weight',
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
        case 'type1':
          this.inputData.type1 = target.value;
          break;
        case 'type2':
          this.inputData.type2 = target.value;
          break;
        case 'bst':
          this.inputData.bst = parseFloat(target.value);
          break;
        case 'ability1':
          this.inputData.ability1 = target.value;
          break;
        case 'ability2':
          this.inputData.ability2 = target.value;
          break;
        case 'ability3':
          this.inputData.ability3 = target.value;
          break;
        case 'generation':
          this.inputData.generation = parseFloat(target.value);
          break;
        case 'height':
          this.inputData.height = parseFloat(target.value);
          break;
        case 'weight':
          this.inputData.weight = parseFloat(target.value);
          break;
        default:
          break;
      }
    }
  }

  updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new pokemon, 3 is game end, 4 is statistics
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

  startGame(): void {
    this.round = 1;
    this.fetchPokemon();
    this.updateGameStatus(1);
  }

  resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.resetInputData();
    this.name = '';
    this.sprite = '';
    this.types.length = 0;
    this.abilities.length = 0;
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
        this.resetInputData();
        this.name = '';
        this.sprite = '';
        this.types.length = 0;
        this.abilities.length = 0;
        for (let i = 0; i < this.guesses.length; i++) {
          this.guesses[i] = false;
        }
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

  resetInputData(): void {
    this.inputData.ability1 = 'None';
    this.inputData.ability2 = 'None';
    this.inputData.ability3 = 'None';
    this.inputData.bst = 0;
    this.inputData.generation = 1;
    this.inputData.height = 0;
    this.inputData.weight = 0;
    this.inputData.type1 = 'None';
    this.inputData.type2 = 'None';
  }

  makeGuess(e: Event): void {
    e.preventDefault();
    this.maxscore += 6;
    if (this.generation === this.inputData.generation) {
      this.score++;
      this.statistics.generation++;
      this.guesses[0] = true;
    }
    if (this.types.length === 1) {
      if (
        this.types[0] === this.inputData.type1.toLowerCase() &&
        this.inputData.type2 === 'None'
      ) {
        this.score++;
        this.statistics.type++;
        this.guesses[1] = true;
      } else if (
        this.types[0] === this.inputData.type2.toLowerCase() &&
        this.inputData.type1 === 'None'
      ) {
        this.score++;
        this.statistics.type++;
        this.guesses[1] = true;
      }
    } else {
      if (
        this.types.includes(this.inputData.type1.toLowerCase()) &&
        this.types.includes(this.inputData.type2.toLowerCase())
      ) {
        this.score++;
        this.statistics.type++;
        this.guesses[1] = true;
      }
    }
    if (Math.abs(this.inputData.bst - this.bst) <= this.bstRange) {
      this.score++;
      this.statistics.bst++;
      this.guesses[2] = true;
    }
    const a1: string = FormatInput(this.inputData.ability1);
    const a2: string = FormatInput(this.inputData.ability2);
    const a3: string = FormatInput(this.inputData.ability3);
    if (this.abilities.length === 1) {
      if (a1 === this.abilities[0] && a2 === '' && a3 === '') {
        this.score++;
        this.statistics.abilities++;
        this.guesses[3] = true;
      }
    } else if (this.abilities.length === 2) {
      if (a1 === this.abilities[0] && a3 === this.abilities[1] && a2 === '') {
        this.score++;
        this.statistics.abilities++;
        this.guesses[3] = true;
      }
    } else {
      if (
        this.abilities.includes(a1) &&
        this.abilities.includes(a2) &&
        a3 === this.abilities[2]
      ) {
        this.score++;
        this.statistics.abilities++;
        this.guesses[3] = true;
      }
    }
    if (Math.abs(this.inputData.height - this.height) <= this.heightRange) {
      this.score++;
      this.statistics.height++;
      this.guesses[4] = true;
    }
    if (Math.abs(this.inputData.weight - this.weight) <= this.weightRange) {
      this.score++;
      this.statistics.weight++;
      this.guesses[5] = true;
    }
    this.updateGameStatus(2);
  }
}
