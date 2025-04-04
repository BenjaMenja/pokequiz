import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LocalStorageService } from './services/LocalStorageService';
import { defaultSettings } from './constants';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private settingsKey: string = 'settings';
  constructor(private storageService: LocalStorageService) {
    // Create settings if it does not exist
    if (!this.storageService.getItem(this.settingsKey)) {
      this.storageService.setItem(this.settingsKey, defaultSettings);
    }
  }
}
