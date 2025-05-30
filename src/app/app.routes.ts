import { Routes } from '@angular/router';
import { PokemonComponent } from './pokemon/pokemon.component';
import { MovesComponent } from './moves/moves.component';
import { InfoComponent } from './info/info.component';
import { CriesComponent } from './cries/cries.component';
import { HomeComponent } from './home/home.component';
import { SpritesComponent } from './sprites/sprites.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { QuizGeneratorComponent } from './quiz-generator/quiz-generator.component';
import { CustomQuizComponent } from './custom-quiz/custom-quiz.component';

export const routes: Routes = [
  { path: 'pokemon', component: PokemonComponent },
  { path: 'moves', component: MovesComponent },
  { path: 'cries', component: CriesComponent },
  { path: 'info', component: InfoComponent },
  { path: 'sprites', component: SpritesComponent },
  { path: 'changelog', component: ChangelogComponent },
  { path: 'quiz-maker', component: QuizGeneratorComponent },
  { path: 'custom-quiz', component: CustomQuizComponent },
  { path: '', component: HomeComponent },
];
