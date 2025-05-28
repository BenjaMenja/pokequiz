import { Component, Input, OnInit } from '@angular/core';
import { QuizSectionComponent } from '../section-switcher/section-switcher.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ability-section',
  imports: [FormsModule],
  templateUrl: './ability-section.component.html',
  styleUrl: './ability-section.component.css',
})
export class AbilitySectionComponent implements QuizSectionComponent, OnInit {
  public getData() {
    return {
      type: this.name,
      options: this.options,
      questions: this.questionCount,
    };
  }

  @Input({ required: false }) importedData: any;
  public name: string = 'ability';
  public options: { [index: string]: any } = {
    generations: {
      gen3: false,
      gen4: false,
      gen5: false,
      gen6: false,
      gen7: false,
      gen8: false,
      gen9: false,
    },
    given: {
      description: true
    },
    guess: {
      name: true
    }
  };
  public questionCount: number = 1;

  ngOnInit(): void {
    if (this.importedData) {
      this.questionCount = parseInt(this.importedData.questions);
      this.options = this.importedData.options;
      console.log(this.importedData.options);
    }
  }

  public modifyOptions(index: string, target: any) {
    if (target) {
      this.options['generations'][index] = target.checked;
    }
    console.log(this.options);
  }

  public modifyQuestionCount(target: any): void {
    if (target) {
      this.questionCount = target.value;
    }
  }
}
