import { Component } from '@angular/core';
import { SignUpComponent } from '../../../../Components/sign-up/sign-up.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-layout',
  imports: [TranslateModule,SignUpComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

  constructor(private translate:TranslateService) { }
  
  //Change Language func
  useLanguage(event: Event): void {
    const selectedLanguage = (event.target as HTMLSelectElement).value;
    this.translate.use(selectedLanguage);
  }

}
