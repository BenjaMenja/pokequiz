import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { defaultSettings } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private settingsKey: string = 'settings';
  private namespace: string = 'pkmn-quiz';
  private settingsSubject = new BehaviorSubject<any>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor() {
    // Create settings if it does not exist
    if (!this.getItem(this.settingsKey)) {
      this.setItem(this.settingsKey, defaultSettings);
    }

    // Add new settings if they don't exist (usually as a result of an update)
    const settings: any = this.getItem(this.settingsKey);
    for (let key in defaultSettings) {
      if (settings[key] === undefined) {
        const keyValue = key as keyof typeof defaultSettings;
        settings[key] = defaultSettings[keyValue];
      }
    }
    this.setItem(this.settingsKey, settings);
    this.settingsSubject.next(settings);
  }

  setItem(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(`${this.namespace}.${key}`, jsonValue);
      this.settingsSubject.next(value);
    } catch (err) {
      console.error('Local Storage Set Error: ', err);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(`${this.namespace}.${key}`);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Local Storage Get Error: ', err);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.namespace}.${key}`);
    } catch (err) {
      console.error('Local Storage Remove Error: ', err);
    }
  }

  clearSettings(): void {
    try {
      localStorage.removeItem(`${this.namespace}.settings`);
    } catch (err) {
      console.error('Local Storage Clear Error: ', err);
    }
  }
}
