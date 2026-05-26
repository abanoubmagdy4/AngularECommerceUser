import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  NgIf,
  NgFor,
  DatePipe,
  DecimalPipe,
  CommonModule,
} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, DecimalPipe, TranslateModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css'],
})
export class NotFound implements OnInit {
  orderSummary: any;

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.orderSummary = navigation?.extras?.state?.['orderSummary'];

    if (!this.orderSummary) {
      const stored = localStorage.getItem('orderSummary');
      if (stored) {
        this.orderSummary = JSON.parse(stored);
      } else {
        this.router.navigate(['/']);
      }
    }
  }
  continueShopping() {
    localStorage.removeItem('orderSummary');
    this.router.navigate(['/home']);
  }
}
