import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriesComponent } from './cries.component';

describe('CriesComponent', () => {
  let component: CriesComponent;
  let fixture: ComponentFixture<CriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
