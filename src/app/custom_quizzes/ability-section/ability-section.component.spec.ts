import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilitySectionComponent } from './ability-section.component';

describe('AbilitySectionComponent', () => {
  let component: AbilitySectionComponent;
  let fixture: ComponentFixture<AbilitySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbilitySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbilitySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
