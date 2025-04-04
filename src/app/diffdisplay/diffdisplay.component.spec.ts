import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffdisplayComponent } from './diffdisplay.component';

describe('DiffdisplayComponent', () => {
  let component: DiffdisplayComponent;
  let fixture: ComponentFixture<DiffdisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiffdisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiffdisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
