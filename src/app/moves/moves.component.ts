import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
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
  searchForDescription,
} from '../constants';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LocalStorageService } from '../services/LocalStorageService';
import { RouterModule } from '@angular/router';
import { StatsQuiz } from '../base_classes/StatsQuiz';
import { Subscription } from 'rxjs';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';

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
  imports: [DiffdisplayComponent, NgIf, NgFor, NgClass, RouterModule],
  templateUrl: './moves.component.html',
  styleUrl: './moves.component.css',
})
export class MovesComponent extends StatsQuiz implements OnDestroy, OnInit {
  @ViewChild('chartRef', { static: false }) chartRef: ElementRef;
  private settingsSub: Subscription;

  constructor(
    protected override storageService: LocalStorageService,
    protected override renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {
    super(storageService, renderer);
    const settings: any = this.storageService.getItem('settings');
    this.ppRange = settings.ppRange || defaultSettings.ppRange;
    this.powerRange = settings.powerRange || defaultSettings.heightRange;
    this.accuracyRange = settings.accuracyRange || defaultSettings.weightRange;
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
        this.diffDisplayClass = state.matches ? 'diff-display-mobile' : 'diff-display';
        this.titleCardClass = state.matches ? 'title-card-mobile' : 'title-card';
      });
  }

  ngOnDestroy(): void {
    this.settingsSub.unsubscribe();
    clearInterval(this.timerHolder);
    clearTimeout(this.fetchTimeout);
  }

  public MoveTypes = PkmnTypes.filter((e) => {
    return e !== 'None';
  });
  public MoveCategories = MoveCategories;

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

  protected override statistics = {
    name: 0,
    type: 0,
    generation: 0,
    pp: 0,
    power: 0,
    category: 0,
    accuracy: 0,
  };

  public guesses: Array<boolean> = [...new Array(7)].map(() => false);

  // Settings
  private ppRange: number;
  private powerRange: number;
  private accuracyRange: number;

  // Styling Classes
  public contentClass: string = 'content';
  public formClass: string = 'form';
  public diffDisplayClass: string = 'diff-display';
  public chartClass: string = 'chart';
  public titleCardClass: string = 'title-card';

  override fetchData() {
    // PokeAPI has 919 moves in the database
    const MoveID: number = Math.floor(Math.random() * 919) + 1;
    try {
      this.P.resource('https://pokeapi.co/api/v2/move/' + MoveID).then(
        (data) => {
          this.moveDescription = searchForDescription(data.flavor_text_entries);
          if (this.moveDescription === 'r') {
            this.moveDescription = data.name;
          }
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

  override generateGraph(): void {
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

  override updateInputData(target: any, field: string): void {
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

  override updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new move, 3 is game end, 4 is statistics
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
    this.ppRange = settings.ppRange;
    this.powerRange = settings.powerRange;
    this.accuracyRange = settings.accuracyRange;
  }

  override resetGame() {
    this.score = 0;
    this.maxscore = 0;
    this.resetMoveData(this.moveInputData);
    this.resetMoveData(this.moveData);
    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = false;
    }
    this.statistics = {
      name: 0,
      type: 0,
      generation: 0,
      pp: 0,
      power: 0,
      category: 0,
      accuracy: 0,
    };
    this.startGame();
  }

  override advanceRound(): void {
    this.resetMoveData(this.moveData);
    this.resetMoveData(this.moveInputData);
    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = false;
    }
    super.advanceRound();
  }

  resetMoveData(data: MoveData) {
    data.name = '';
    data.type = 'normal';
    data.generation = 1;
    data.pp = 1;
    data.power = 0;
    data.category = 'physical';
    data.accuracy = 0;
  }

  override makeGuess(e: Event): void {
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
