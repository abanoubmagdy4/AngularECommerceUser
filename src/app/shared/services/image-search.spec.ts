import { TestBed } from '@angular/core/testing';

import { ImageSearch } from './image-search';

describe('ImageSearch', () => {
  let service: ImageSearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageSearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
