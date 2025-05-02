import { Component, Input, OnDestroy } from '@angular/core';
import { LocalStorageService } from '../services/LocalStorageService';
import { defaultSettings } from '../constants';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-settings-box',
  imports: [NgIf],
  templateUrl: './settings-box.component.html',
  styleUrl: './settings-box.component.css',
})
export class SettingsBoxComponent implements OnDestroy {
  @Input({ required: true }) active: boolean;
  private settingsKey: string = 'settings';
  public settings: any;
  public buttonText: string = 'Save';
  private buttonTimeout: NodeJS.Timeout;
  constructor(private storageService: LocalStorageService) {
    this.settings = this.storageService.getItem(this.settingsKey);
  }
  ngOnDestroy(): void {
    clearTimeout(this.buttonTimeout);
  }

  updateSettings(key: string, target: any): void {
    if (target !== null && key in this.settings) {
      const value = parseInt(target.value);
      if (isNaN(value)) {
        this.settings[key] = target.value;
      } else {
        this.settings[key] = value;
      }
    }
  }

  saveSettings() {
    clearTimeout(this.buttonTimeout);
    this.storageService.setItem(this.settingsKey, this.settings);
    this.buttonText = 'Settings Saved!';
    this.buttonTimeout = setTimeout(() => {
      this.buttonText = 'Save';
    }, 2000);
  }

  resetSettings() {
    const reset: boolean = window.confirm(
      'This will reset all settings to default. Are you sure?'
    );
    if (reset) {
      this.storageService.setItem(this.settingsKey, defaultSettings);
      this.settings = defaultSettings;
    }
  }

  closeSettings() {
    this.active = !this.active;
  }
}
