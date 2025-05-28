import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { SettingsBoxComponent } from '../settings-box/settings-box.component';
import { NgClass, NgIf } from '@angular/common';
import { LocalStorageService } from '../services/LocalStorageService';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, SettingsBoxComponent, NgIf, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  public settings: boolean = false;
  public changelog: boolean = false;
  private version: string = '1.1';
  public navStyle: string = 'nav-items';
  public changelogStyle: string = 'changelog';
  public itemsVisible: boolean = true;

  constructor(
    private router: Router,
    private storageService: LocalStorageService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationStart ||
        event instanceof NavigationError
      ) {
        this.settings = false;
        if (this.navStyle === 'nav-items-mobile') {
          this.itemsVisible = false;
        }
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

  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.TabletPortrait,
        Breakpoints.Small,
      ])
      .subscribe((state: BreakpointState) => {
        this.navStyle = state.matches ? 'nav-items-mobile' : 'nav-items';
        this.changelogStyle = state.matches ? 'changelog-mobile' : 'changelog';
        this.itemsVisible = state.matches ? false : true;
      });
  }

  toggleSettings(): void {
    this.settings = !this.settings;
  }

  toggleItems(): void {
    this.itemsVisible = !this.itemsVisible;
  }
}
