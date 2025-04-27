import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-info',
  imports: [RouterModule, NgClass],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent implements OnInit {
  public titleBoxClass: string = 'title-box';
  public containerClass: string = 'container';
  public titleImgClass: string = 'title-img';
  public subtitleImgClass: string = 'subtitle-img';
  public contentClass: string = 'content';

  constructor(private breakpointObserver: BreakpointObserver) {}
  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.TabletPortrait,
        Breakpoints.Small,
      ])
      .subscribe((state: BreakpointState) => {
        this.titleBoxClass = state.matches ? 'title-box-mobile' : 'title-box';
        this.containerClass = state.matches ? 'container-mobile' : 'container';
        this.titleImgClass = state.matches ? 'title-img-mobile' : 'title-img';
        this.contentClass = state.matches ? 'content-mobile' : 'content';
        this.subtitleImgClass = state.matches
          ? 'subtitle-img-mobile'
          : 'subtitle-img';
      });
  }
}
