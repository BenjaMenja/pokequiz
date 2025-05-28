import { NgSwitch, NgSwitchCase } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { AbilitySectionComponent } from '../ability-section/ability-section.component';
import { MoveSectionComponent } from '../move-section/move-section.component';
import { PokemonSectionComponent } from '../pokemon-section/pokemon-section.component';

export interface QuizSectionComponent {
  getData(): any;
  modifyQuestionCount(target: any): void;
  name: string;
  options: any;
  questionCount: number;
}

@Component({
  selector: 'app-section-switcher',
  imports: [
    NgSwitch,
    NgSwitchCase,
    AbilitySectionComponent,
    MoveSectionComponent,
    PokemonSectionComponent,
  ],
  templateUrl: './section-switcher.component.html',
  styleUrl: './section-switcher.component.css',
})
export class SectionSwitcherComponent {
  @Input({ required: true }) componentName: string;
  @Output() remove = new EventEmitter<void>();
  @Input({ required: true }) id: number;
  @Input({ required: false }) importedData: any;
  @ViewChild('section') sectionComponentRef!: QuizSectionComponent;

  public getSectionData() {
    return this.sectionComponentRef.getData();
  }
}
