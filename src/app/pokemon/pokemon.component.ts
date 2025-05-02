import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  PkmnTypes,
  FormatInput,
  colorBar,
  findGeneration,
  findGenerationByDexID,
  nameMap,
  upper,
  FormatOutput,
  FormatMega,
  SpecialFormFormatting,
} from '../constants';
import { Chart } from 'chart.js/auto';
import { RouterModule } from '@angular/router';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { LocalStorageService } from '../services/LocalStorageService';
import { StatsQuiz } from '../base_classes/StatsQuiz';
import { Subscription } from 'rxjs';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';

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
  imports: [NgFor, NgIf, NgClass, RouterModule, DiffdisplayComponent],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.css',
})
export class PokemonComponent extends StatsQuiz implements OnDestroy, OnInit {
  @ViewChild('chartRef', { static: false }) chartRef: ElementRef;
  private settingsSub: Subscription;

  constructor(
    protected override storageService: LocalStorageService,
    protected override renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {
    super(storageService, renderer);
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
    this.breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.TabletPortrait,
        Breakpoints.Small,
      ])
      .subscribe((state: BreakpointState) => {
        this.contentClass = state.matches ? 'content-mobile' : 'content';
        this.formClass = state.matches ? 'form-mobile' : 'form';
        this.chartClass = state.matches ? 'chart-mobile' : 'chart';
        this.diffDisplayClass = state.matches
          ? 'diff-display-mobile'
          : 'diff-display';
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.timerHolder);
    this.settingsSub.unsubscribe();
  }

  // Consts
  public PkmnTypes = PkmnTypes;

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
  protected override statistics = {
    bst: 0,
    type: 0,
    generation: 0,
    abilities: 0,
    height: 0,
    weight: 0,
  };

  // Guess Data
  public guesses: Array<boolean> = [...new Array(6)].map(() => false);

  // Settings
  private bstRange: number;
  private heightRange: number;
  private weightRange: number;

  // Styling Classes
  public contentClass: string = 'content';
  public formClass: string = 'form';
  public diffDisplayClass: string = 'diff-display';
  public chartClass: string = 'chart';

  // Functions
  // Ids range from 1-1025 and 10001-10277 (Forms such as Deoxys-Attack)
  override fetchData(): void {
    let pkmnID: number;
    do {
      pkmnID = Math.floor(Math.random() * 10277) + 1;
    } while (pkmnID > 1025 && pkmnID < 10001);
    this.P.resource('https://pokeapi.co/api/v2/pokemon/' + pkmnID).then(
      (data) => {
        this.pkmndata = data;
        this.name = data.name;
        this.displayName = this.obtainDisplayName(pkmnID, this.name);
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

  override generateGraph(): void {
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

  override updateInputData(target: any, field: string): void {
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

  override updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new pokemon, 3 is game end, 4 is statistics
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
    if (status === 4) {
      setTimeout(() => {
        this.generateGraph();
      }, 0);
    }
  }

  updateSettings(settings: any) {
    super.applySettings(settings);
    this.bstRange = settings.bstRange;
    this.heightRange = settings.heightRange;
    this.weightRange = settings.weightRange;
  }

  override resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.resetInputData();
    this.name = '';
    this.sprite = '';
    this.types.length = 0;
    this.abilities.length = 0;
    this.statistics = {
      bst: 0,
      type: 0,
      generation: 0,
      abilities: 0,
      height: 0,
      weight: 0,
    };
    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = false;
    }
    this.startGame();
  }

  override advanceRound(): void {
    this.resetInputData();
    this.name = '';
    this.sprite = '';
    this.types.length = 0;
    this.abilities.length = 0;
    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = false;
    }
    super.advanceRound();
  }

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

  override makeGuess(e: Event): void {
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
      if (a1 === this.abilities[0] && a2 === 'none' && a3 === 'none') {
        this.score++;
        this.statistics.abilities++;
        this.guesses[3] = true;
      }
    } else if (this.abilities.length === 2) {
      if (
        a1 === this.abilities[0] &&
        a3 === this.abilities[1] &&
        a2 === 'none'
      ) {
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

  /**
   * Since some pokemon have special names (Ex. nidoran-f), this function converts special names to be more readable.
   * Uses the constant name map for most forms. Some pokemon (such as Wo-Chien) actually have a hyphen in their name.
   * Others have a hyphen in the API (Such as great-tusk) and need to be checked
   * Other forms are handled separately (Ex. Galarian / Alolan / Paldean)
   * @param index The pokedex number of the pokemon, used to determine whether this pokemon needs a name change
   * @param name The original name, used if the index does not match
   * @returns
   */
  private obtainDisplayName(index: number, name: string): string {
    if (index in nameMap) {
      return nameMap[index];
    } else if (
      [
        'ho-oh',
        'porygon-z',
        'wo-chien',
        'chien-pao',
        'ting-lu',
        'chi-yu',
      ].includes(name)
    ) {
      return name
        .split('-')
        .map((part) => {
          part = upper(part);
          return part;
        })
        .join('-');
    } else if (
      (index >= 785 && index <= 788) ||
      (index >= 984 && index <= 995) ||
      (index >= 1005 && index <= 1006) ||
      (index >= 1009 && index <= 1010) ||
      (index >= 1020 && index <= 1023)
    ) {
      return FormatOutput(name);
    } else if (name.includes('-mega')) {
      return FormatMega(name);
    } else if (name.includes('-alola')) {
      return `Alolan ${SpecialFormFormatting(name)}`;
    } else if (name.includes('-galar')) {
      return `Galarian ${SpecialFormFormatting(name)}`;
    } else if (name.includes('-gmax')) {
      return `Gigantamax ${SpecialFormFormatting(name)}`;
    } else if (name.includes('-hisui')) {
      return `Hisuian ${SpecialFormFormatting(name)}`;
    } else if (name.includes('-')) {
      return SpecialFormFormatting(name);
    }
    return name[0].toUpperCase() + name.substring(1);
  }
}
