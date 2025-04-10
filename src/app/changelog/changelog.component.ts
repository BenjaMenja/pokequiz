import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { LocalStorageService } from '../services/LocalStorageService';

@Component({
  selector: 'app-changelog',
  imports: [MarkdownModule],
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.css',
})
export class ChangelogComponent {
  constructor(private storageService: LocalStorageService) {
    const seen_changelog = storageService.getItem('seen_changelog');
    if (!seen_changelog) {
      storageService.setItem('seen_changelog', true);
    }
  }
}
