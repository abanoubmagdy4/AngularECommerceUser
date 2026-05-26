import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { Cart } from '../cart/cart';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Login } from '../login/login';
import { MatDialogModule } from '@angular/material/dialog';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  LanguageService,
  Language,
} from '../../shared/services/language/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatDialogModule,
    Cart,
    TranslateModule,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  isLoggedIn = false;
  isCartVisible = false;
  isProfileVisible = false;
  isMobileMenuVisible = false;
  isSearchVisible = false;
  isLanguageDropdownVisible = false;
  cartCount = 0; // Cart counter
  searchQuery = '';

  constructor(
    private cartservice: CartItemService,
    public routerState: RouterStateService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private eRef: ElementRef,
    public languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isCartVisible = false;
        this.closeProfile();
      });
  }
  ngOnInit(): void {
    this.cartservice.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    //clear local storage
    localStorage.removeItem('guestCart');
    this.cartservice.clearCartCache(); // يمسح بيانات الكاش الحالية
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('guestCart');
    }
  }

  toggleProfile() {
    this.isProfileVisible = !this.isProfileVisible;
  }

  closeProfile() {
    this.isProfileVisible = false;
  }

  toggleCart() {
    this.isCartVisible = !this.isCartVisible;
  }

  closeCart() {
    this.isCartVisible = false;
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(Login, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'logged-in') {
        // ✅ المستخدم سجل دخول فعلاً
        this.isLoggedIn = true;
      }
    });
  }
  toggleMobileMenu() {
    this.isMobileMenuVisible = !this.isMobileMenuVisible;
  }

  closeMobileMenu() {
    this.isMobileMenuVisible = false;
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }, 100);
    }
  }

  closeSearch() {
    this.isSearchVisible = false;
    this.searchQuery = '';
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search-results'], {
        state: { query: this.searchQuery },
      });
      this.closeSearch();
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.performSearch();
    } else if (event.key === 'Escape') {
      this.closeSearch();
    }
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownVisible = !this.isLanguageDropdownVisible;
  }

  setLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.isLanguageDropdownVisible = false;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;

    // لو مش جزء من الكومبوننت
    if (!this.eRef.nativeElement.contains(targetElement)) {
      this.isCartVisible = false;
      this.isProfileVisible = false;
      this.isMobileMenuVisible = false;
      this.isSearchVisible = false;
      this.isLanguageDropdownVisible = false;
    }
  }
}
