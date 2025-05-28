import { Component, Input, OnInit } from '@angular/core';
import { QuizSectionComponent } from '../section-switcher/section-switcher.component';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-move-section',
  imports: [NgFor, FormsModule, NgClass],
  templateUrl: './move-section.component.html',
  styleUrl: './move-section.component.css',
})
export class MoveSectionComponent implements QuizSectionComponent, OnInit {
  @Input({ required: false }) importedData: any;
  public name: string = 'move';
  public questionCount: number = 1;
  public options: { [index: string]: any } = {
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
      description: false,
      type: false,
      generation: false,
      pp: false,
      power: false,
      category: false,
      accuracy: false,
    },
    guess: {
      name: false,
      type: false,
      generation: false,
      pp: false,
      power: false,
      category: false,
      accuracy: false,
    },
  };
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
    };
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
        Breakpoints.Small])
      .subscribe((state: BreakpointState) => {
        this.typeClass = state.matches ? 'types-mobile' : 'types';
      });
  }

  public modifyOptions(target: any, options: { gen?: number; type?: string; given?: string; guess?: string }) {
    if (target) {
      if (options.gen) {
        switch (options.gen) {
          case 1:
            this.options['generations'].gen1 = target.checked;
            break;
          case 2:
            this.options['generations'].gen2 = target.checked;
            break;
          case 3:
            this.options['generations'].gen3 = target.checked;
            break;
          case 4:
            this.options['generations'].gen4 = target.checked;
            break;
          case 5:
            this.options['generations'].gen5 = target.checked;
            break;
          case 6:
            this.options['generations'].gen6 = target.checked;
            break;
          case 7:
            this.options['generations'].gen7 = target.checked;
            break;
          case 8:
            this.options['generations'].gen8 = target.checked;
            break;
          case 9:
            this.options['generations'].gen9 = target.checked;
            break;
        }
      }
      if (options.type) {
        switch (options.type) {
          case 'normal':
            this.options['types'].normal = target.checked;
            break;
          case 'fighting':
            this.options['types'].fighting = target.checked;
            break;
          case 'flying':
            this.options['types'].flying = target.checked;
            break;
          case 'poison':
            this.options['types'].poison = target.checked;
            break;
          case 'ground':
            this.options['types'].ground = target.checked;
            break;
          case 'rock':
            this.options['types'].rock = target.checked;
            break;
          case 'bug':
            this.options['types'].bug = target.checked;
            break;
          case 'ghost':
            this.options['types'].ghost = target.checked;
            break;
          case 'steel':
            this.options['types'].steel = target.checked;
            break;
          case 'fire':
            this.options['types'].fire = target.checked;
            break;
          case 'water':
            this.options['types'].water = target.checked;
            break;
          case 'grass':
            this.options['types'].grass = target.checked;
            break;
          case 'electric':
            this.options['types'].electric = target.checked;
            break;
          case 'psychic':
            this.options['types'].psychic = target.checked;
            break;
          case 'ice':
            this.options['types'].ice = target.checked;
            break;
          case 'dragon':
            this.options['types'].dragon = target.checked;
            break;
          case 'dark':
            this.options['types'].dark = target.checked;
            break;
          case 'fairy':
            this.options['types'].fairy = target.checked;
            break;
        }
      }
      if (options.given) {
        switch (options.given) {
          case 'name':
            this.options['given'].name = target.checked;
            break;
          case 'description':
            this.options['given'].description = target.checked;
            break;
          case 'type':
            this.options['given'].type = target.checked;
            break;
          case 'generation':
            this.options['given'].generation = target.checked;
            break;
          case 'pp':
            this.options['given'].pp = target.checked;
            break;
          case 'power':
            this.options['given'].power = target.checked;
            break;
          case 'category':
            this.options['given'].category = target.checked;
            break;
          case 'accuracy':
            this.options['given'].accuracy = target.checked;
            break;
        }
      }
      if (options.guess) {
        switch (options.guess) {
          case 'name':
            this.options['guess'].name = target.checked;
            break;
          case 'type':
            this.options['guess'].type = target.checked;
            break;
          case 'generation':
            this.options['guess'].generation = target.checked;
            break;
          case 'pp':
            this.options['guess'].pp = target.checked;
            break;
          case 'power':
            this.options['guess'].power = target.checked;
            break;
          case 'category':
            this.options['guess'].category = target.checked;
            break;
          case 'accuracy':
            this.options['guess'].accuracy = target.checked;
            break;
        }
      }
    }
  }

  public modifyQuestionCount(target: any): void {
    if (target) {
      this.questionCount = target.value;
    }
  }
}
