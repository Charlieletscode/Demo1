import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFirst } from './page-first';

describe('PageFirst', () => {
  let component: PageFirst;
  let fixture: ComponentFixture<PageFirst>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFirst],
    }).compileComponents();

    fixture = TestBed.createComponent(PageFirst);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
