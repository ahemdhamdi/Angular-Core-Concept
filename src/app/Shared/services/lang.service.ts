import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
TranslateService
@Injectable({
  providedIn: 'root'
})
export class LangService {


  private languageSubject = new BehaviorSubject<string>('en');
  language$ = this.languageSubject.asObservable();

  constructor(private translate:TranslateService) { }

  setLanguage(lang: string): void {
    localStorage.setItem('lang', lang);
    this.languageSubject.next(lang);
    this.translate.use(lang);
  }


  
}
