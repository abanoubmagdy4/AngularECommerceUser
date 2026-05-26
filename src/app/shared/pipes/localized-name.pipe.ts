import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language/language.service';

@Pipe({
  name: 'localizedName',
  standalone: true,
  pure: false // Re-evaluate when language changes
})
export class LocalizedNamePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(item: { nameAr?: string; nameEn?: string; name?: string } | null | undefined): string {
    if (!item) return '';
    return this.languageService.getLocalizedName(item);
  }
}
