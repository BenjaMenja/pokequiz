import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpritesComponent } from './sprites.component';

describe('SpritesComponent', () => {
  let component: SpritesComponent;
  let fixture: ComponentFixture<SpritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpritesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
