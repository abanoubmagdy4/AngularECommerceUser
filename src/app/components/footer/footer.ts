import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(public routerState: RouterStateService) {}
}
