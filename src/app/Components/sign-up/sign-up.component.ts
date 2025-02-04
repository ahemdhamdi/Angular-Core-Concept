import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import {TranslateService} from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-sign-up',
  imports: [TranslateModule,ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  currentTab = 0;
  formTabs!: NodeListOf<HTMLElement>;
  wizardItems!: NodeListOf<HTMLElement>;
  readyToSubmit:boolean=false;

  registerform!: FormGroup;

  constructor(private translate:TranslateService,private builder: FormBuilder,private router: Router) { }

  ngOnInit(): void {
    this.generateForm();
  }


  generateForm() {
    this.registerform = this.builder.group({
      basic:this.builder.group({
        name:this.builder.control('',Validators.required),
        pharmacist:this.builder.control(''),
        email:this.builder.control(''),
        license:this.builder.control(''),
        password:this.builder.control(''),
        confirm_password:this.builder.control(''),
      }),
      location:this.builder.group({
        country:this.builder.control(''),
        city:this.builder.control(''),
        street:this.builder.control(''),
        zip:this.builder.control(''),
        latitude:this.builder.control(''),
        longitude:this.builder.control(''),
      }),
      hourse:this.builder.group({
        start_day:this.builder.control(''),
        end_day:this.builder.control(''),
        start_time:this.builder.control(''),
        end_time:this.builder.control('')
      })
    });
  }


  submit(){
    alert('success login');
    const nameValue = this.registerform.get('basic.name')?.value;
    this.router.navigate(['/profile',nameValue])
  }



  //Change Language func
  useLanguage(language: string): void {
    this.translate.use(language);
  }

  
  //#region wizard or Stepper Funcs
  ngAfterViewInit() {
    this.formTabs = document.querySelectorAll('[data-form-tab]');
    this.wizardItems = document.querySelectorAll('[data-wizard-item]');
    this.showTab(this.currentTab);
  }

  showTab(n: number) {
    
    // Hide all tabs and wizard items
    this.formTabs.forEach(tab => tab.classList.remove('active'));
    this.wizardItems.forEach(item => item.classList.remove('active'));

    // Show the current tab and wizard item
    this.formTabs[n].classList.add('active');
    this.wizardItems[n].classList.add('active');

    // Set button visibility
    const btnPrevious = document.querySelector('[data-btn-previous]') as HTMLElement;
    const btnNext = document.querySelector('[data-btn-next]') as HTMLElement;

    if (n === 0) {
      btnPrevious.style.display = 'none';
    } else {
      btnPrevious.style.display = 'block';
    }

    if (n === this.formTabs.length - 1) {
      btnNext.style.display = 'none';
      this.readyToSubmit=true;
    } else {
      btnNext.style.display = 'block';
      this.readyToSubmit=false;
    }
  }

  nextPrev(n: number) {
    // Hide the current tab and wizard item
    this.formTabs[this.currentTab].classList.remove('active');
    this.wizardItems[this.currentTab].classList.remove('active');

    // Move to the next or previous tab
    this.currentTab += n;
    this.showTab(this.currentTab);
  }

  //#End -- region 
}
