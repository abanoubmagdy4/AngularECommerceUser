import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-discount-Products',
  standalone: true,
  templateUrl: './discount-Products.html',
  styleUrls: ['./discount-Products.css'],
  imports: [CommonModule, TranslateModule],
})
export class DiscountProducts implements OnInit {
  constructor() {}

  ngOnInit() {}
}
