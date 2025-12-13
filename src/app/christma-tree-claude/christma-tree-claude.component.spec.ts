import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChristmaTreeClaudeComponent } from './christma-tree-claude.component';

describe('ChristmaTreeClaudeComponent', () => {
  let component: ChristmaTreeClaudeComponent;
  let fixture: ComponentFixture<ChristmaTreeClaudeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChristmaTreeClaudeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChristmaTreeClaudeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
