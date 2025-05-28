import { NgClass, NgIf } from '@angular/common';
import {
  Component,
  ComponentRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { AbilitySectionComponent } from '../custom_quizzes/ability-section/ability-section.component';
import { SectionSwitcherComponent } from '../custom_quizzes/section-switcher/section-switcher.component';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

export interface GlobalQuizSettings {
  [index: string]: any,
  shuffle: boolean
}

@Component({
  selector: 'app-quiz-generator',
  imports: [NgIf, NgClass],
  templateUrl: './quiz-generator.component.html',
  styleUrl: './quiz-generator.component.css',
})
export class QuizGeneratorComponent implements OnDestroy, OnInit {
  @ViewChild('sectionContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('fileUpload', { read: ViewContainerRef }) fileUpload: ViewContainerRef;
  public status: number = 0;
  public idCounter = 0;
  public errorMsg: string = '';
  public allSections: {
    id: number;
    ref: ComponentRef<SectionSwitcherComponent>;
  }[] = [];
  private errorTimeout: NodeJS.Timeout;
  public globalSettings: GlobalQuizSettings = {
    shuffle: false
  }

  // Class Variables
  public titleCardClass: string = 'title-card';

  constructor(protected renderer: Renderer2, private ngZone: NgZone, private breakpointObserver: BreakpointObserver) {}

  ngOnDestroy(): void {
    clearTimeout(this.errorTimeout);
  }

  ngOnInit(): void {
        this.breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.TabletPortrait,
        Breakpoints.Small,
      ])
      .subscribe((state: BreakpointState) => {
        this.titleCardClass = state.matches ? 'title-card-mobile' : 'title-card';
      });
  }

  public addComponent(type: string, sectionData?: any) {
    const componentRef = this.container.createComponent(
      SectionSwitcherComponent
    );
    const id = this.idCounter++;
    componentRef.instance.componentName = type;
    componentRef.instance.id = id;
    componentRef.instance.importedData = sectionData;
    componentRef.instance.remove.subscribe(() => this.removeComponent(id));
    this.allSections.push({ id, ref: componentRef });
  }

  public removeComponent(id: number) {
    const index = this.allSections.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.allSections[index].ref.destroy();
      this.allSections.splice(index, 1);
    }
  }

  public isAbilitySection(value: any): boolean {
    return value instanceof AbilitySectionComponent;
  }

  public updateStatus(newStatus: number) {
    this.status = newStatus;
  }

  public clickImport() {
    this.fileUpload.element.nativeElement.click();
  }

  public importQuiz(event: any) {
    const file: File = event.target.files[0];
    const fileReader: FileReader = new FileReader();
    let result: string | undefined;
    let data: any;
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      result = fileReader.result?.toString();
      if (result) {
        data = JSON.parse(result);
        console.log(data);
        this.editQuizFromImport(data);
      } else {
        console.error('Could not convert JSON to a suitable format.');
      }
    };
    fileReader.onerror = () => {
      console.error('Error uploading file.');
    };
  }

  public saveQuiz() {
    let dataObject: any = {
      sections: [],
      settings: this.globalSettings
    };
    if (this.allSections.length === 0) {
      this.setErrorMsg("Error: This quiz has no sections!");
      return;
    }
    for (let { id, ref } of this.allSections) {
      let data = ref.instance.getSectionData();
      if (data.type !== 'ability') {
        let validGuess = false;
        let validGiven = false;
        for (let value of Object.values(data.options.given)) {
          if (value) {
            validGiven = true;
          }
        }
        if (!validGiven) {
          this.setErrorMsg(`Error: No "Given" items checked for ${data.type} quiz section.`);
          return;
        }
        for (let value of Object.values(data.options.guess)) {
          if (value) {
            validGuess = true;
          }
        }
        if (!validGuess) {
          this.setErrorMsg(`Error: No "Guess" items checked for ${data.type} quiz section.`);
          return;
        }
      }
      dataObject.sections.push(data);
    }
    console.log(dataObject);
    let json = new Blob([JSON.stringify(dataObject)], {
      type: 'application/json',
    });
    let url = window.URL.createObjectURL(json);
    const anchor = this.renderer.createElement('a');
    anchor.setAttribute('target', '_self');
    anchor.setAttribute('href', url);
    anchor.setAttribute('download', 'quiz.json');
    anchor.click();
    anchor.remove();
  }

  public editQuizFromImport(data: any) {
    for (let section of this.allSections) {
      this.removeComponent(section.id);
    }
    for (let section of data.sections) {
      this.addComponent(section.type, section);
    }
  }

  public updateSettings(target: any, field: string) {
    if (target) {
      this.globalSettings[field] = target.checked;
    }
  } 

  public setErrorMsg(msg: string) {
    this.errorMsg = msg;
    this.errorTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.clearErrorMsg();
      })
    }, 3000);
  }

  private clearErrorMsg() {
    this.errorMsg = '';
    console.log(this.errorMsg);
  }
}
