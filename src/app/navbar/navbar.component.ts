import { Component } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { SettingsBoxComponent } from '../settings-box/settings-box.component';
import { NgIf } from '@angular/common';
import { LocalStorageService } from '../services/LocalStorageService';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, SettingsBoxComponent, NgIf],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public settings: boolean = false;
  public changelog: boolean = false;
  private version: string = '1.0.2';

  constructor(
    private router: Router,
    private storageService: LocalStorageService
  ) {
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

    const userVersion = this.storageService.getItem('version');
    // Check version
    if (!userVersion || userVersion !== this.version) {
      this.storageService.setItem('version', this.version);
      this.storageService.setItem('seen_changelog', false);
    }
    const seen_changelog = storageService.getItem('seen_changelog');
    if (!seen_changelog) {
      this.changelog = true;
    }
  }

  toggleSettings(): void {
    this.settings = !this.settings;
  }
}
