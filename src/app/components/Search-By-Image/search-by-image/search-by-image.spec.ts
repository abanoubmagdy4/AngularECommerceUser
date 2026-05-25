import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByImage } from './search-by-image';

describe('SearchByImage', () => {
  let component: SearchByImage;
  let fixture: ComponentFixture<SearchByImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchByImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchByImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
