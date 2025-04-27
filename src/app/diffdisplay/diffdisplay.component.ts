import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormatOutput } from '../constants';

@Component({
  selector: 'diffdisplay',
  imports: [NgFor, NgClass, NgStyle],
  templateUrl: './diffdisplay.component.html',
  styleUrl: './diffdisplay.component.css',
})
export class DiffdisplayComponent<T extends Record<string, any>>
  implements OnChanges
{
  @Input({ required: true }) data: T;
  @Input({ required: false }) guesses: Array<boolean>;
  @Input({ required: true }) title: string;
  @Input({ required: true }) mobileClass: string;
  entries: [string, any][] = [];

  ngOnChanges(): void {
    if (this.data && typeof this.data === 'object') {
      this.entries = Object.entries(this.data).map(([k, v]) => [
        k[0].toUpperCase() + k.substring(1),
        FormatOutput(v),
      ]);
    }
  }

  getColor(index: number) {
    if (!this.guesses) {
      return 'white';
    }
    return this.guesses[index] ? 'green' : 'red';
  }
}
