import { Routes } from '@angular/router';
import { PokemonComponent } from './pokemon/pokemon.component';
import { MovesComponent } from './moves/moves.component';
import { InfoComponent } from './info/info.component';
import { CriesComponent } from './cries/cries.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'pokemon', component: PokemonComponent },
  { path: 'moves', component: MovesComponent },
  { path: 'cries', component: CriesComponent },
  { path: 'info', component: InfoComponent },
  { path: '', component: HomeComponent },
];
