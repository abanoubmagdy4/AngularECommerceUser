import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language/language.service';

@Pipe({
  name: 'localizedDescription',
  standalone: true,
  pure: false // Re-evaluate when language changes
})
export class LocalizedDescriptionPipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(item: { descriptionAr?: string; descriptionEn?: string; description?: string } | null | undefined): string {
    if (!item) return '';
    return this.languageService.getLocalizedDescription(item);
  }
}
