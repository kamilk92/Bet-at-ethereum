import {TestBed, inject} from '@angular/core/testing';

import {AcctService} from './acct.service';

describe('AcctserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcctService]
    });
  });

  it('should be created', inject([AcctService], (service: AcctService) => {
    expect(service).toBeTruthy();
  }));
});
