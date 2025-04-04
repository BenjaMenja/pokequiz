import { Component } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { SettingsBoxComponent } from '../settings-box/settings-box.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, SettingsBoxComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public settings: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.settings = false;
      }
      if (event instanceof NavigationStart) {
        this.settings = false;
      }
      if (event instanceof NavigationError) {
        this.settings = false;
      }
    });
  }

  toggleSettings(): void {
    this.settings = !this.settings;
  }
}
