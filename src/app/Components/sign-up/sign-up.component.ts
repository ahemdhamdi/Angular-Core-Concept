import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import {TranslateService,LangChangeEvent } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LangService } from '../../Shared/services/lang.service';
import { CountryISO, NgxIntlTelInputModule, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';


/// <reference types="google.maps" />


@Component({
  selector: 'app-sign-up',
  imports: [TranslateModule,ReactiveFormsModule,RouterModule,CommonModule,NgxIntlTelInputModule],
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

// =====================================================================================================
  //#region --Telphone Properties
  PhoneNumberFormat = PhoneNumberFormat;
  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
	preferredCountries: CountryISO[] = [CountryISO.UnitedArabEmirates, CountryISO.Egypt];
  //#endregion

// =====================================================================================================

  //#region --MAP Properties
  @ViewChild('searchBox') searchBoxInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map!: google.maps.Map;
  markers: google.maps.Marker[] = [];
  selectedPlaceName: string = '';
  //#endregion

// ========================================================================================================
  constructor(private translate:TranslateService,private router: Router,private builder: FormBuilder) { }
// ========================================================================================================
  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log('Language changed to:', event.lang);
      const selectedLanguage = event.lang;
      this.loadGoogleMaps(selectedLanguage);
    });
    this.generateForm();
    
  }
// ========================================================================================================
  //#region initial form and its controls  
  generateForm() {
    this.registerform = this.builder.group({
      basicForm:this.builder.group({
        name:this.builder.control('',Validators.required),
        pharmacist:this.builder.control(''),
        email:this.builder.control(''),
        pharmacy_phone:this.builder.control(''),
        personal_phone:this.builder.control(''),
        license:this.builder.control(''),
        password:this.builder.control(''),
        confirm_password:this.builder.control(''),
      }),
      locationForm:this.builder.group({
        placeSearch: this.builder.control('') // Place search input
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

  //#endregion

// ========================================================================================================
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
 // ========================================================================================================
  ngAfterViewInit() {
    //initial gooogle place
    this.loadGoogleMaps('en');
    // get wizard tabs
    this.formTabs = document.querySelectorAll('[data-form-tab]');
    // get wizard item
    this.wizardItems = document.querySelectorAll('[data-wizard-item]');
    this.showTab(this.currentTab);
  }
// ========================================================================================================
  //#region Telephone number 
  changePreferredCountries() {
		this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	}
  //#endregion 
// ========================================================================================================
  //#region -- Google Map --
  loadGoogleMaps(lang:any) {
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAAu836oHdkxoQ0RITqGgf8CTYaKd0e3II&callback=initMap&libraries=places&language=${lang}`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.initAutocomplete();
    document.body.appendChild(script);
    
  }

  initAutocomplete() {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: -33.8688, lng: 151.2195 },
      zoom: 13,
      mapTypeId: "roadmap",
    });

    const input = this.searchBoxInput.nativeElement as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);


    this.map.addListener("bounds_changed", () => {
      searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
    });

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];

      const bounds = new google.maps.LatLngBounds();

      places.forEach((place:any) => {
        if (!place.geometry || !place.geometry.location) return;

        this.selectedPlaceName = place.name;


        const marker = new google.maps.Marker({
          map: this.map,
          title: place.name,
          position: place.geometry.location,
        });

        this.markers.push(marker);

        this.registerform.get('locationForm')?.patchValue({
          placeSearch: place.name // Save selected place name in form
        });

        if (place.geometry.viewport) bounds.union(place.geometry.viewport);
        else bounds.extend(place.geometry.location);
      });

      this.map.fitBounds(bounds);
    });
  }
  //#endregion -- Google Map --

// ========================================================================================================

  //#region -- wizard or Stepper Funcs --
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
  //#endregion
}
