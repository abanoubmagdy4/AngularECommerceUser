import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerService } from '../../shared/services/SpinnerService/spinner-service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.css'],
})
export class Spinner {
  isVisible = false;
  isFadingOut = false;
  isFadingIn = false;

  constructor(private spinner: SpinnerService) {
    this.spinner.loading$.subscribe((visible) => {
      if (visible) {
        // أظهر الـ overlay بالـ fade-in
        this.isVisible = true;
        this.isFadingOut = false;

        // استنى شوية لحد ما يتعمل render للعنصر
        setTimeout(() => {
          this.isFadingIn = true;
        }, 0);
      } else if (this.isVisible) {
        this.isFadingOut = true;
        this.isFadingIn = false;

        setTimeout(() => {
          this.isVisible = false;
          this.isFadingOut = false;
        }, 600);
      }
    });
  }
}
