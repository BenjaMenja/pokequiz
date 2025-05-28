import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { StatsQuiz } from '../base_classes/StatsQuiz';
import { LocalStorageService } from '../services/LocalStorageService';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import {
  findAbilityIntervalsByGeneration,
  findGeneration,
  findGenerationByDexID,
  findMoveIntervalsByGeneration,
  findPokemonIntervalsByGeneration,
  FormatInput,
  FormatOutput,
  Generations,
  MoveCategories,
  obtainDisplayName,
  PkmnTypes,
  searchForDescription,
  upper,
} from '../constants';
import moveIDs from '../moves.json';
import pokemonIDs from '../pokemon.json';
import { DiffdisplayComponent } from '../diffdisplay/diffdisplay.component';
import { GlobalQuizSettings } from '../quiz-generator/quiz-generator.component';

interface CustomQuizSettings {
  type: string;
  options: any;
  count: number;
}

interface CustomQuizSection {
  id: number;
  itemList: Array<number>;
  usedItems: Array<number>;
  generationIntervals: Array<Array<number>>;
  questions: number;
  given: MoveQuizInput | AbilityQuizInput | PokemonQuizInput;
  guess: MoveQuizInput | AbilityQuizInput | PokemonQuizInput;
  type: string;
}

interface MoveQuizInput {
  [index: string]: any;
  accuracy?: any;
  category?: any;
  description?: any;
  generation?: any;
  name?: any;
  power?: any;
  pp?: any;
  type?: any;
}

interface AbilityQuizInput {
  [index: string]: any;
  description: string;
  name: string;
}

interface PokemonQuizInput {
  [index: string]: any;
  name?: any;
  type?: any;
  generation?: any;
  bst?: any;
  abilities?: any;
  height?: any;
  weight?: any;
  evs?: any;
  sprite?: any;
  cry?: any;
}

interface StringMap {
  [key: string]: any;
}

@Component({
  selector: 'app-custom-quiz',
  imports: [CommonModule, DiffdisplayComponent],
  templateUrl: './custom-quiz.component.html',
  styleUrl: './custom-quiz.component.css',
})
export class CustomQuizComponent
  extends StatsQuiz
  implements OnInit, OnDestroy
{
  private settingsSub: Subscription;
  @ViewChild('fileUpload', { read: ViewContainerRef })
  fileUpload!: ViewContainerRef;
  public quizSettings: Array<CustomQuizSettings> = [];
  public quizSections: Array<CustomQuizSection> = [];
  public importStatus: boolean = false;
  public activeQuizSection: CustomQuizSection;
  public activeQuizGiven: MoveQuizInput | AbilityQuizInput | PokemonQuizInput = {};
  public activeQuizGuess: MoveQuizInput | AbilityQuizInput | PokemonQuizInput = {};
  public activeQuizInput: MoveQuizInput | AbilityQuizInput | PokemonQuizInput = {};
  public guesses: Array<boolean> = [];
  public globalQuizSettings: GlobalQuizSettings;

  // Settings
  private ppRange: number;
  private powerRange: number;
  private accuracyRange: number;
  private bstRange: number;
  private heightRange: number;
  private weightRange: number;

  // Styling Classes
  public contentClass: string = 'content';
  public formClass: string = 'form';
  public diffDisplayClass: string = 'diff-display';
  public chartClass: string = 'chart';
  public titleCardClass: string = 'title-card';

  // Move Stuff
  public MoveTypes = PkmnTypes.filter((e) => {
    return e !== 'None';
  });
  public PkmnTypes = PkmnTypes;
  public MoveCategories = MoveCategories;

  protected override statistics: {[index: string]: any} = {
    sections: {}
  };
  public statsDisplay: any = {}

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
        this.diffDisplayClass = state.matches ? 'diff-display-mobile' : 'diff-display';
        this.titleCardClass = state.matches ? 'title-card-mobile' : 'title-card';
      });
  }

  ngOnDestroy(): void {
    this.settingsSub.unsubscribe();
    clearInterval(this.timerHolder);
    clearTimeout(this.fetchTimeout);
  }

  updateSettings(settings: any) {
    super.applySettings(settings);
    this.ppRange = settings.ppRange;
    this.powerRange = settings.powerRange;
    this.accuracyRange = settings.accuracyRange;
    this.bstRange = settings.bstRange;
    this.heightRange = settings.heightRange;
    this.weightRange = settings.weightRange;
  }

  public clickImport() {
    this.fileUpload.element.nativeElement.click();
  }

  public importQuiz(e: any) {
    const file: File = e.target.files[0];
    const fileReader: FileReader = new FileReader();
    let result: string | undefined;
    let data: any;
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      result = fileReader.result?.toString();
      if (result) {
        data = JSON.parse(result);
        this.setQuizFromImport(data);
        this.importStatus = true;
      } else {
        console.error('Could not convert JSON to a suitable format.');
        this.importStatus = false;
      }
    };
    fileReader.onerror = () => {
      console.error('Error uploading file.');
      this.importStatus = false;
    };
  }

  public setQuizFromImport(data: any) {
    this.quizSettings.length = 0;
    this.globalQuizSettings = data.settings;
    this.maxRounds = 0;
    for (const section of data.sections) {
      this.quizSettings.push({
        type: section.type,
        options: section.options,
        count: section.questions,
      });
      this.maxRounds += parseInt(section.questions);
    }
  }

  public startQuiz() {
    this.quizSections.length = 0;
    let id: number = 1;
    for (let setting of this.quizSettings) {
      const type: string = setting.type;
      let generations = Object.values(setting.options['generations']);
      let intervals: Array<Array<number>> = [];
      let itemList: Array<number> = [];
      if (type === 'move') {
        const IDs = moveIDs as StringMap;
        let types = Object.entries(setting.options['types']);
        for (const type of types) {
          if (type[1]) {
            itemList = itemList.concat(IDs['types'][type[0]]);
          }
        }
        if (itemList.length === 0) {
          for (let i = 1; i <= 919; i++) {
            itemList.push(i);
          }
        }
        for (let i = 0; i < generations.length; i++) {
          if (generations[i]) {
            intervals.push(findMoveIntervalsByGeneration(i + 1));
          }
        }
        if (intervals.length === 0) {
          intervals.push([
            findMoveIntervalsByGeneration(1)[0],
            findMoveIntervalsByGeneration(9)[1],
          ]);
        }
        itemList = itemList.filter((item) => this.isInIntervals(intervals, item))
      }
      if (type === 'ability') {
        for (let i = 0; i < generations.length; i++) {
          if (generations[i]) {
            intervals.push(findAbilityIntervalsByGeneration(i + 3));
          }
        }
        if (intervals.length === 0) {
          intervals.push([
            findAbilityIntervalsByGeneration(3)[0],
            findAbilityIntervalsByGeneration(9)[1],
          ]);
        }
        for (const interval of intervals) {
          for (let i = interval[0]; i <= interval[1]; i++) {
            itemList.push(i);
          }
        }
      }
      if (type === 'pokemon') {
        const IDs = pokemonIDs as StringMap;
        let types = Object.entries(setting.options['types']);
        for (const type of types) {
          if (type[1]) {
            itemList = itemList.concat(IDs['types'][type[0]]);
          }
        }
        if (itemList.length === 0) {
          for (let i = 1; i <= 1025; i++) {
            itemList.push(i);
          }
          for (let i = 10001; i <= 10277; i++) {
            itemList.push(i);
          }
        }
        for (let i = 0; i < generations.length; i++) {
          if (generations[i]) {
            const intervalList: Array<Array<number>> = findPokemonIntervalsByGeneration(i + 1)
            for (const interval of intervalList) {
              intervals.push(interval)
            }
          }
        }
        if (intervals.length === 0) {
          intervals.push([1, 1025], [10001, 10277])
        }
        itemList = itemList.filter((item) => this.isInIntervals(intervals, item))
      }
      this.quizSections.push({
        id: id,
        itemList: itemList,
        usedItems: [],
        generationIntervals: intervals,
        questions: setting.count as number,
        given: setting.options['given'],
        guess: setting.options['guess'],
        type: setting.type,
      });
      id++;
    }
    for (const section of this.quizSections) {
      this.addSectionToStatistics(section);
    }
    this.setActiveQuizSection();
    this.startGame();
  }

  /**
   * Checks if the given resource ID is within any of the specified intervals.
   * Frequently used when checking if the generated values for types of moves and Pokemon fit with ID intervals for pokemon game generations.
   * @param intervals An array of valid intervals for a quiz section.
   * @param id The ID to check.
   * @returns Whether or not the ID lies within the specified intervals.
   */
  private isInIntervals(intervals: Array<Array<number>>, id: number): boolean {
    for (const interval of intervals) {
      if (id >= interval[0] && id <= interval[1]) {
        return true;
      }
    }
    return false;
  }

  override resetGame(): void {
    this.score = 0;
    this.maxscore = 0;
    this.startQuiz();
  }

  public override fetchData(): void {
    let itemID: number;
    this.activeQuizGiven = {};
    this.activeQuizGuess = {};
    this.activeQuizInput = {};
    if (this.activeQuizSection.usedItems.length === this.activeQuizSection.itemList.length) {
      this.activeQuizSection.usedItems.length = 0;
    }
    do {
      itemID =
        this.activeQuizSection.itemList[
          Math.floor(Math.random() * this.activeQuizSection.itemList.length)
        ];
    } while (
      this.activeQuizSection.usedItems.includes(itemID) ||
      !this.isInIntervals(this.activeQuizSection.generationIntervals, itemID)
    );
    if (this.activeQuizSection.type === 'move') {
      this.fetchMoveData(itemID);
    }
    if (this.activeQuizSection.type === 'ability') {
      this.fetchAbilityData(itemID);
    }
    if (this.activeQuizSection.type === 'pokemon') {
      this.fetchPokemonData(itemID)
    }
  }

  /**
   * Fetchs move data for the active quiz section.
   * @param id The ID of the move to fetch.
   */
  private fetchMoveData(id: number) {
    try {
      this.P.getMoveByName(id).then((data) => {
        // Reset input data
        Object.keys(this.activeQuizSection.guess).forEach((key) => {
          if (this.activeQuizSection.guess[key]) {
            this.activeQuizInput[key] = '';
          }
        });
        // Set the given values based on quiz settings
        if (this.activeQuizSection.given.accuracy) {
          this.activeQuizGiven.accuracy = data.accuracy;
        }
        if (this.activeQuizSection.given.category) {
          this.activeQuizGiven['category'] = data.damage_class.name;
        }
        if (this.activeQuizSection.given.description) {
          this.activeQuizGiven['description'] = searchForDescription(
            data.flavor_text_entries
          );
        }
        if (this.activeQuizSection.given.generation) {
          this.activeQuizGiven['generation'] =
            Generations.indexOf(data.generation.name) + 1;
        }
        if (this.activeQuizSection.given.name) {
          this.activeQuizGiven['name'] = FormatOutput(data.name);
        }
        if (this.activeQuizSection.given.power) {
          this.activeQuizGiven['power'] = data.power;
        }
        if (this.activeQuizSection.given.pp) {
          this.activeQuizGiven['pp'] = data.pp;
        }
        if (this.activeQuizSection.given.type) {
          this.activeQuizGiven['type'] = data.type.name;
        }
        // Set the required guess values based on quiz settings
        if (this.activeQuizSection.guess.accuracy) {
          this.activeQuizGuess['accuracy'] = data.accuracy;
          this.activeQuizInput['accuracy'] = 0;
        }
        if (this.activeQuizSection.guess.category) {
          this.activeQuizGuess['category'] = data.damage_class.name;
          this.activeQuizInput['category'] = 'physical';
        }
        if (this.activeQuizSection.guess.generation) {
          this.activeQuizGuess['generation'] = Generations.indexOf(data.generation.name) + 1;
          this.activeQuizInput['generation'] = 1;
        }
        if (this.activeQuizSection.guess.name) {
          this.activeQuizGuess['name'] = data.name;
          this.activeQuizInput['name'] = 'None';
        }
        if (this.activeQuizSection.guess.power) {
          this.activeQuizGuess['power'] = data.power;
          this.activeQuizInput['power'] = 0
        }
        if (this.activeQuizSection.guess.pp) {
          this.activeQuizGuess['pp'] = data.pp;
          this.activeQuizInput['pp'] = 0;
        }
        if (this.activeQuizSection.guess.type) {
          this.activeQuizGuess['type'] = data.type.name;
          this.activeQuizInput['type'] = 'normal';
        }
      });
    } catch (err) {
      console.error('Error Fetching Data: ' + err);
    }
  }

    /**
   * Fetchs ability data for the active quiz section.
   * @param id The ID of the ability to fetch.
   */
  private fetchAbilityData(id: number) {
    try {
      this.P.getAbilityByName(id).then((data) => {
        this.activeQuizGiven['description'] = searchForDescription(
          data.flavor_text_entries
        );
        this.activeQuizGuess['name'] = data.name;
      });
    } catch (err) {
      console.error('Error Fetching Data: ' + err);
    }
  }

    /**
   * Fetchs Pokemon data for the active quiz section.
   * @param id The ID of the Pokemon to fetch.
   */
  private fetchPokemonData(id: number) {
    try {
      this.P.getPokemonByName(id).then(data => {
        // Reset input data
        Object.keys(this.activeQuizSection.guess).forEach((key) => {
          if (this.activeQuizSection.guess[key]) {
            this.activeQuizInput[key] = '';
          }
        });
        // Set the given values based on quiz settings
        if (this.activeQuizSection.given.name) {
          this.activeQuizGiven['name'] = obtainDisplayName(id, data.name);
        }
        if (this.activeQuizSection.given.type) {
          this.activeQuizGiven['type'] = data.types;
        }
        if (this.activeQuizSection.given.generation) {
          this.activeQuizGiven['generation'] = findGenerationByDexID(id);
        }
        if (this.activeQuizSection.given.bst) {
          this.activeQuizGiven['bst'] = data.stats.reduce((a: number, b: any) => {
            return a + b.base_stat;
          }, 0)
        }
        if (this.activeQuizSection.given.abilities) {
          this.activeQuizGiven['abilities'] = data.abilities.map(ability => ability.ability.name);
        }
        if (this.activeQuizSection.given.height) {
          this.activeQuizGiven['height'] = data.height / 10;
        }
        if (this.activeQuizSection.given.weight) {
          this.activeQuizGiven['weight'] = data.weight / 10;
        }
        if (this.activeQuizSection.given.evs) {
          this.activeQuizGiven['evs'] = data.stats.map(stat => stat.effort);
        }
        if (this.activeQuizSection.given.sprite) {
          this.activeQuizGiven['sprite'] = data.sprites.front_default;
        }
        if (this.activeQuizSection.given.cry) {
          this.activeQuizGiven['cry'] = data['cries'].latest;
        }
        // Set the guessing values based on quiz settings
        if (this.activeQuizSection.guess.name) {
          this.activeQuizGuess['name'] = data.species.name;
          this.activeQuizInput['name'] = 'None';
        }
        if (this.activeQuizSection.guess.type) {
          this.activeQuizGuess['type'] = data.types.map(type => type.type.name);
          this.activeQuizInput['type'] = ['None', 'None'];
        }
        if (this.activeQuizSection.guess.generation) {
          this.activeQuizGuess['generation'] = findGeneration(data.game_indices[0].version.name);
          this.activeQuizInput['generation'] = 1;
        }
        if (this.activeQuizSection.guess.bst) {
          this.activeQuizGuess['bst'] = data.stats.reduce((a: number, b: any) => {
            return a + b.base_stat;
          }, 0)
          this.activeQuizInput['bst'] = 0;
        }
        if (this.activeQuizSection.guess.abilities) {
          this.activeQuizGuess['abilities'] = data.abilities.map(ability => ability.ability.name);
          this.activeQuizInput['abilities'] = ['None', 'None', 'None'];
        }
        if (this.activeQuizSection.guess.height) {
          this.activeQuizGuess['height'] = data.height / 10;
          this.activeQuizInput['height'] = 0;
        }
        if (this.activeQuizSection.guess.weight) {
          this.activeQuizGuess['weight'] = data.weight / 10;
          this.activeQuizInput['weight'] = 0;
        }
        if (this.activeQuizSection.guess.evs) {
          this.activeQuizGuess['evs'] = data.stats.map(stat => stat.effort);
          this.activeQuizInput['evs'] = Array(6).fill(0);
        }
      })
    }
    catch (err) {
      console.error('Error Fetching Data: ' + err);
    }
  }

  override updateInputData(target: any, field: string): void {
    if (target !== null) {
      if (field.includes('type') && this.activeQuizSection.type === 'pokemon') {
        const index = parseInt(field[field.length - 1]) - 1;
        this.activeQuizInput['type'][index] = target.value;
      }
      else if (field.includes('ability')) {
        const index = parseInt(field[field.length - 1]) - 1;
        this.activeQuizInput['abilities'][index] = target.value;
      }
      else if (field.includes('EV')) {
        const index = parseInt(field[field.length - 1]) - 1;
        this.activeQuizInput['evs'][index] = target.value;
      }
      else {
        this.activeQuizInput[field] = target.value;
      }
    }
  }

  override updateGameStatus(status: number): void {
    // 0 is the start, 1 is game running, 2 is generating new data, 3 is game end, 4 is statistics
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
      this.createStatsDisplay()
    }
  }

  override nextRound(): void {
    this.activeQuizSection.questions--;
    super.nextRound();
  }

  override advanceRound(): void {
    this.guesses.length = 0;
    this.activeQuizInput = {};
    if (this.activeQuizSection.questions <= 0) {
      for (let i = 0; i < this.quizSections.length; i++) {
        if (this.quizSections[i].id === this.activeQuizSection.id) {
          this.quizSections.splice(i, 1);
        }
      }
    }
    if (this.quizSections.length <= 0) {
      this.updateGameStatus(3);
    }
    this.setActiveQuizSection();
    super.advanceRound();
  }

  /**
   * Sets the active quiz section. Can either set one randomly if shuffling is enabled or in sequential order.
   */
  private setActiveQuizSection() {
    const index: number = this.globalQuizSettings.shuffle ? Math.floor(Math.random() * this.quizSections.length) : 0
    this.activeQuizSection = this.quizSections[index];
  }

  /**
   * Adds a quiz section's fields to the statistics object if it doesn't already exist.
   */
  private addSectionToStatistics(section: CustomQuizSection): void {
    const currentKey = section.type.concat(section.id.toString())
    if (this.statistics['sections'][currentKey]) {
      return;
    } 
    let values: StringMap = {}
    for (const entry of Object.entries(section.guess)) {
      if (entry[1]) {
        values[entry[0]] = 0;
      }
    }
    values['max'] = section.questions as number;
    this.statistics['sections'][currentKey] = values;
  }

  /**
   * Validates a guess on a specific attribute of the quiz.
   * Adds to the overall score as well as the statistics.
   * @param correct Whether the guess was correct or not
   * @param field The field this guess belongs to.
   */
  private validateGuess(correct: boolean, field: string) {
    this.guesses.push(correct);
    if (correct) {
      this.score++;
      const currentKey = this.activeQuizSection.type.concat(this.activeQuizSection.id.toString());
      this.statistics['sections'][currentKey][field]++;
    }
  }

  private createStatsDisplay() {
    this.statsDisplay = {}
    for (const key of this.objectKeys(this.statistics['sections'])) {
      this.statsDisplay[key] = {};
      const splitkey = key.split(/(\d+)/);
      this.statsDisplay[key]['type'] = upper(splitkey[0]);
      this.statsDisplay[key]['index'] = splitkey[1];
      this.statsDisplay[key]['entries'] = this.statistics['sections'][key];
    }
  }

  public objectKeys(obj: any) {
    return Object.keys(obj);
  }

  override makeGuess(e: Event): void {
    e.preventDefault();
    this.maxscore += Object.keys(this.activeQuizGuess).length;
    if (this.activeQuizSection.type === 'move') {
      if (this.activeQuizGuess.name) {
        const correct: boolean = this.activeQuizGuess.name === FormatInput(this.activeQuizInput.name);
        this.validateGuess(correct, 'name')
      }
      if (this.activeQuizGuess.accuracy) {
        const correct: boolean = Math.abs(parseInt(this.activeQuizGuess.accuracy) - parseInt(this.activeQuizInput.accuracy)) <= this.accuracyRange;
        this.validateGuess(correct, 'accuracy')
      }
      if (this.activeQuizGuess.category) {
        const correct: boolean = this.activeQuizGuess.category === FormatInput(this.activeQuizInput.category);
        this.validateGuess(correct, 'category')
      }
      if (this.activeQuizGuess.generation) {
        const correct: boolean = this.activeQuizGuess.generation == this.activeQuizInput.generation;
        this.validateGuess(correct, 'generation')
      }
      if (this.activeQuizGuess.power) {
        const correct: boolean = Math.abs(parseInt(this.activeQuizGuess.power) - parseInt(this.activeQuizInput.power)) <= this.powerRange;
        this.validateGuess(correct, 'power')
      }
      if (this.activeQuizGuess.pp) {
        const correct: boolean = Math.abs(parseInt(this.activeQuizGuess.pp) - parseInt(this.activeQuizInput.pp)) <= this.ppRange;
        this.validateGuess(correct, 'pp')
      }
      if (this.activeQuizGuess.type) {
        const correct: boolean = this.activeQuizGuess.type === FormatInput(this.activeQuizInput.type);
        this.validateGuess(correct, 'type')
      }
    }
    if (this.activeQuizSection.type === 'ability') {
      const correct: boolean = this.activeQuizGuess.name === FormatInput(this.activeQuizInput.name);
      this.validateGuess(correct, 'name')
    }
    if (this.activeQuizSection.type === 'pokemon') {
      if (this.activeQuizGuess.name) {
        const correct: boolean = this.activeQuizGuess.name === FormatInput(this.activeQuizInput.name);
        this.validateGuess(correct, 'name')
      }
      if (this.activeQuizGuess.type) {
        let correct: boolean = false;
        if (this.activeQuizGuess.type.length === 1) {
          correct = (((FormatInput(this.activeQuizInput.type[0]) === this.activeQuizGuess.type[0]) && this.activeQuizInput.type[1] === 'None') || ((FormatInput(this.activeQuizInput.type[1]) === this.activeQuizGuess.type[0]) && this.activeQuizInput[0] === 'None')) 
        }
        else {
          correct = (this.activeQuizGuess.type.includes(FormatInput(this.activeQuizInput.type[0])) && this.activeQuizGuess.type.includes(FormatInput(this.activeQuizInput.type[1])))
        }
        this.validateGuess(correct, 'type')
      }
      if (this.activeQuizGuess.generation) {
        const correct: boolean = this.activeQuizGuess.generation === parseInt(this.activeQuizInput.generation);
        this.validateGuess(correct, 'generation')
      }
      if (this.activeQuizGuess.bst) {
        const correct: boolean = Math.abs(this.activeQuizGuess.bst - parseInt(this.activeQuizInput.bst)) <= this.bstRange;
        this.validateGuess(correct, 'bst')
      }
      if (this.activeQuizGuess.abilities) {
        const ability1 = FormatInput(this.activeQuizInput.abilities[0]);
        const ability2 = FormatInput(this.activeQuizInput.abilities[1]);
        const ability3 = FormatInput(this.activeQuizInput.abilities[2]);
        let correct: boolean = false;
        if (this.activeQuizGuess.abilities.length === 1) {
          if (ability1 === this.activeQuizGuess.abilities[0] && ability2 === 'None' && ability3 === 'None') {
            correct = true;
          }
        }
        if (this.activeQuizGuess.abilities.length === 2) {
          if ((ability1 === this.activeQuizGuess.abilities[0] && ability2 === 'None') || (ability2 === this.activeQuizGuess.abilities[0] && ability1 === 'None') && ability3 === this.activeQuizGuess.abilities[1]) {
            correct = true;
          }
        }
        else {
          if (((ability1 === this.activeQuizGuess.abilities[0] && ability2 === this.activeQuizGuess.abilities[1]) || (ability2 === this.activeQuizGuess.abilities[0] && ability1 === this.activeQuizGuess.abilities[1])) && ability3 === this.activeQuizGuess.abilities[2]) {
            correct = true;
          }
        }
        this.validateGuess(correct, 'abilities')
      }
      if (this.activeQuizGuess.height) {
        const correct: boolean = Math.abs(this.activeQuizGuess.height - parseFloat(this.activeQuizInput.height)) <= this.heightRange;
        this.validateGuess(correct, 'height');
      }
      if (this.activeQuizGuess.weight) {
        const correct: boolean = Math.abs(this.activeQuizGuess.weight - parseFloat(this.activeQuizInput.weight)) <= this.weightRange;
        this.validateGuess(correct, 'weight');
      }
      if (this.activeQuizGuess.evs) {
        let correct: boolean = true;
        for (let i=0; i<this.activeQuizGuess.evs.length; i++) {
          if (this.activeQuizGuess.evs[i] !== parseInt(this.activeQuizInput.evs[i])) {
            correct = false;
          }
        }
        this.validateGuess(correct, 'evs');
      }
    } 
    this.updateGameStatus(2);
  }
}
