import { Component, OnInit } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { LocalStorageService } from '../services/LocalStorageService';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-changelog',
  imports: [MarkdownModule, NgClass],
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.css',
})
export class ChangelogComponent implements OnInit {
  public contentClass: string = 'content';
  constructor(
    private storageService: LocalStorageService,
    private breakpointObserver: BreakpointObserver
  ) {
    const seen_changelog = storageService.getItem('seen_changelog');
    if (!seen_changelog) {
      storageService.setItem('seen_changelog', true);
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
        this.contentClass = state.matches ? 'content-mobile' : 'content';
      });
  }
}
