import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSwitcherComponent } from './section-switcher.component';

describe('SectionSwitcherComponent', () => {
  let component: SectionSwitcherComponent;
  let fixture: ComponentFixture<SectionSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSwitcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
