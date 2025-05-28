import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveSectionComponent } from './move-section.component';

describe('MoveSectionComponent', () => {
  let component: MoveSectionComponent;
  let fixture: ComponentFixture<MoveSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
