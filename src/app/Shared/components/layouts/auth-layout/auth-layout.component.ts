import { Component } from '@angular/core';
import { SignUpComponent } from '../../../../Components/sign-up/sign-up.component';

@Component({
  selector: 'app-auth-layout',
  imports: [SignUpComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

}
