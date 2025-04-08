import { Renderer2 } from '@angular/core';
import { LocalStorageService } from '../services/LocalStorageService';
import { BasicQuiz } from './BasicQuiz';
import Chart from 'chart.js/auto';

interface StatsQuizFunctions {
  generateGraph(): void;
  downloadGraph(): void;
}

export class StatsQuiz extends BasicQuiz implements StatsQuizFunctions {
  // Chart Data
  public chart: Chart;
  public chartImg: string;

  // Statistics
  protected statistics = {};

  constructor(
    protected override storageService: LocalStorageService,
    protected renderer: Renderer2
  ) {
    super(storageService);
  }

  /**
   * Generates a graph of your guesses.
   */
  generateGraph(): void {}

  /**
   * Downloads the graph as a png file.
   */
  downloadGraph(): void {
    const anchor = this.renderer.createElement('a');
    anchor.setAttribute('target', '_self');
    anchor.setAttribute('href', this.chartImg);
    anchor.setAttribute('download', 'chart.png');
    anchor.click();
    anchor.remove();
  }
}
