import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'any',
})
export class LocalStorageService {
  constructor() {}
  private namespace: string = 'pkmn-quiz';

  setItem(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(`${this.namespace}.${key}`, jsonValue);
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
