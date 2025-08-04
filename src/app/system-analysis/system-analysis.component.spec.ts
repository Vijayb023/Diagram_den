import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAnalysisComponent } from './system-analysis.component';

describe('SystemAnalysisComponent', () => {
  let component: SystemAnalysisComponent;
  let fixture: ComponentFixture<SystemAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
