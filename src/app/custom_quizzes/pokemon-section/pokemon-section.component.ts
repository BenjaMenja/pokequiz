import { Component, Input, OnInit } from '@angular/core';
import { QuizSectionComponent } from '../section-switcher/section-switcher.component';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-pokemon-section',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './pokemon-section.component.html',
  styleUrl: './pokemon-section.component.css'
})
export class PokemonSectionComponent implements QuizSectionComponent, OnInit {
  @Input({ required: false }) importedData: any;

  public name: string = 'pokemon';
  public options: {[index: string]: any} = {
    generations: {
      gen1: false,
      gen2: false,
      gen3: false,
      gen4: false,
      gen5: false,
      gen6: false,
      gen7: false,
      gen8: false,
      gen9: false,
    },
    types: {
      normal: false,
      fighting: false,
      flying: false,
      poison: false,
      ground: false,
      rock: false,
      bug: false,
      ghost: false,
      steel: false,
      fire: false,
      water: false,
      grass: false,
      electric: false,
      psychic: false,
      ice: false,
      dragon: false,
      dark: false,
      fairy: false,
    },
    given: {
      name: false,
      type: false,
      generation: false,
      bst: false,
      abilities: false,
      height: false,
      weight: false,
      evs: false,
      sprite: false,
      cry: false
    },
    guess: {
      name: false,
      type: false,
      generation: false,
      bst: false,
      abilities: false,
      height: false,
      weight: false,
      evs: false,
    }
  };
  public questionCount: number = 1;
  public generations: [string, boolean][];
  public types: [string, boolean][];
  public given: [string, boolean][];
  public guess: [string, boolean][];

  // Styling Classes
  public typeClass: string = 'types';

  getData() {
    return {
      type: this.name,
      options: this.options,
      questions: this.questionCount,
    }
  }

  constructor (private breakpointObserver: BreakpointObserver) {

  }

  ngOnInit(): void {
    if (this.importedData) {
      this.questionCount = parseInt(this.importedData.questions);
      this.options = this.importedData.options;
      console.log(this.importedData.options);
    }
    this.generations = Object.entries(this.options['generations']);
    this.types = Object.entries(this.options['types']);
    this.given = Object.entries(this.options['given']);
    this.guess = Object.entries(this.options['guess']);
    this.breakpointObserver.observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.TabletPortrait,
        Breakpoints.Small,
      ])
      .subscribe((state: BreakpointState) => {
        this.typeClass = state.matches ? 'types-mobile' : 'types';
      });
  }

  public modifyOptions(target: any, options: { gen?: string; type?: string; given?: string; guess?: string }) {
    if (target) {
      if (options.gen) {
        this.options['generations'][options.gen] = target.checked
      }
      if (options.type) {
        this.options['types'][options.type] = target.checked
      }
      if (options.given) {
        this.options['given'][options.given] = target.checked
      }
      if (options.guess) {
        this.options['guess'][options.guess] = target.checked
      }
    }
  }

  public modifyQuestionCount(target: any): void {
    if (target) {
      this.questionCount = target.value;
    }
  }


}
