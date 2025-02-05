import { Component } from '@angular/core';
import { SignUpComponent } from '../../../../Components/sign-up/sign-up.component';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from '../../../services/lang.service';

@Component({
  selector: 'app-auth-layout',
  imports: [TranslateModule,SignUpComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

  constructor(private lang:LangService) { }
  
  //Change Language func
  useLanguage(event: Event): void {
    const selectedLanguage = (event.target as HTMLSelectElement).value;
    this.lang.setLanguage(selectedLanguage); // Update Language
  }
     

}
