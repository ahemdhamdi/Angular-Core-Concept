import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  parmacy_name:string | null;
  constructor(private route: ActivatedRoute) {
   this.parmacy_name = this.route.snapshot.paramMap.get('name')
  }



}
