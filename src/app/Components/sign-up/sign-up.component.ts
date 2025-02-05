import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import {TranslateService} from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sign-up',
  imports: [TranslateModule,ReactiveFormsModule,RouterModule,CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  currentTab = 0;
  formTabs!: NodeListOf<HTMLElement>;
  wizardItems!: NodeListOf<HTMLElement>;
  readyToSubmit:boolean=false;

  registerform!: FormGroup;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  constructor(private translate:TranslateService,private router: Router,private builder: FormBuilder) { }

  ngOnInit(): void {
    this.generateForm();
    console.log(this.registerform.get('workingHoursForm.days') as FormArray)
  }


  generateForm() {
    this.registerform = this.builder.group({
      basicForm:this.builder.group({
        name:this.builder.control('',Validators.required),
        pharmacist:this.builder.control(''),
        email:this.builder.control(''),
        license:this.builder.control(''),
        password:this.builder.control(''),
        confirm_password:this.builder.control(''),
      }),
      locationForm:this.builder.group({
        country:this.builder.control(''),
        city:this.builder.control(''),
        street:this.builder.control(''),
        zip:this.builder.control(''),
        latitude:this.builder.control(''),
        longitude:this.builder.control(''),
      }),
      workingHoursForm: this.builder.group({
        sameHours: this.builder.control(false), // Checkbox for same hours all days
        days: this.builder.array(this.days.map(day => this.createDayControl(day)))
      })
    });
  }

  // Create FormGroup for each day
  createDayControl(day: string): FormGroup {
    return this.builder.group({
      day: [day],
      enabled: [false], // If the day is selected
      is24Hours: [false], // If 24-hour mode is checked
      from: [''], // Start time
      to: [''] // End time
    });
  }


  // Get FormArray reference
  get daysArray() {
    return this.registerform.get('workingHoursForm.days') as FormArray;
  }


  // Toggle enabling/disabling specific day
  toggleDay(index: number) {
    const dayControl = this.daysArray.at(index);
    const enabled = dayControl.get('enabled')?.value;
  
    // Toggle enabled state
    dayControl.patchValue({ enabled: !enabled });
  
    // If disabled, reset its values
    if (!dayControl.get('enabled')?.value) {
      dayControl.patchValue({ is24Hours: false, from: '', to: '' });
    }
  }

  // Toggle 24-hour mode
  toggle24Hours(index: number) {
    const dayControl = this.daysArray.at(index);
    const is24Hours = dayControl.get('is24Hours')?.value;
    if (is24Hours) {
      dayControl.patchValue({ from: '', to: '' });
    }
  }


  submit(){
    if(this.registerform.valid){
      alert('success login');
      console.log(this.registerform.value);
      const nameValue = this.registerform.get('basicForm.name')?.value;
      this.router.navigate(['/profile',nameValue])
    }
    else{
      alert('Please Enter Pharmacy Name');
    }
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
