import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'ar' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app_language';
  private readonly DEFAULT_LANG: Language = 'ar';
  
  private currentLangSubject = new BehaviorSubject<Language>(this.DEFAULT_LANG);
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLang = this.getStoredLanguage();
    const langToUse = savedLang || this.DEFAULT_LANG;
    this.setLanguage(langToUse);
  }

  private getStoredLanguage(): Language | null {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        return stored as Language;
      }
    }
    return null;
  }

  private storeLanguage(lang: Language): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  private updateDocumentDirection(lang: Language): void {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      html.lang = lang;
      html.dir = lang === 'ar' ? 'rtl' : 'ltr';
      
      // Update body classes for Tailwind RTL support
      document.body.classList.toggle('rtl', lang === 'ar');
      document.body.classList.toggle('ltr', lang === 'en');
      document.body.classList.toggle('arabic', lang === 'ar');
      document.body.classList.toggle('english', lang === 'en');
    }
  }

  setLanguage(lang: Language): void {
    this.currentLangSubject.next(lang);
    this.translate.use(lang);
    this.storeLanguage(lang);
    this.updateDocumentDirection(lang);
  }

  getCurrentLang(): Language {
    return this.currentLangSubject.value;
  }

  isArabic(): boolean {
    return this.currentLangSubject.value === 'ar';
  }

  isEnglish(): boolean {
    return this.currentLangSubject.value === 'en';
  }

  toggleLanguage(): void {
    const newLang = this.isArabic() ? 'en' : 'ar';
    this.setLanguage(newLang);
  }

  /**
   * Get localized name based on current language with fallback
   */
  getLocalizedName(item: { nameAr?: string; nameEn?: string; name?: string }): string {
    if (this.isArabic()) {
      return item.nameAr || item.name || item.nameEn || '';
    }
    return item.nameEn || item.name || item.nameAr || '';
  }

  /**
   * Get localized description based on current language with fallback
   */
  getLocalizedDescription(item: { descriptionAr?: string; descriptionEn?: string; description?: string }): string {
    if (this.isArabic()) {
      return item.descriptionAr || item.description || item.descriptionEn || '';
    }
    return item.descriptionEn || item.description || item.descriptionAr || '';
  }
}
