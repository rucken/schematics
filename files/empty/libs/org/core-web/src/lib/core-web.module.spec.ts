import { async, TestBed } from '@angular/core/testing';
import { CoreWebModule } from './core-web.module';

describe('CoreWebModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CoreWebModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CoreWebModule).toBeDefined();
  });
});
