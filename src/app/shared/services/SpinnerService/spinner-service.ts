import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private minVisibleTime = 700;
  private showTime = 0;

  show() {
    this.loadingSubject.next(true);
    this.showTime = Date.now();
  }

  hide() {
    const timeVisible = Date.now() - this.showTime;
    if (timeVisible < this.minVisibleTime) {
      setTimeout(
        () => this.loadingSubject.next(false),
        this.minVisibleTime - timeVisible
      );
    } else {
      this.loadingSubject.next(false);
    }
  }
}
