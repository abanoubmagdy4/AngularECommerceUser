import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './policy.html',
  styleUrl: './policy.css',
})
export class Policy {}
