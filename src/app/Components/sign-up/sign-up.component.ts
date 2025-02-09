import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import {TranslateService,LangChangeEvent } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LangService } from '../../Shared/services/lang.service';
import { CountryISO, NgxIntlTelInputModule, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/// <reference types="google.maps" />


@Component({
  selector: 'app-sign-up',
  imports: [TranslateModule,ReactiveFormsModule,RouterModule,CommonModule,NgxIntlTelInputModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  nanoFormSelected = true;
  excelFileSelected = false;

  uploadedData: any[] = []; // Store extracted data
  

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

  toggleRegisterView(registerType:string){
    if(registerType === 'nano'){
      this.nanoFormSelected = true;
      this.excelFileSelected = false;
    }else{
      this.nanoFormSelected = false;
      this.excelFileSelected = true;
    }
  }

// ========================================================================================================
  //#region excl file register functions

  //==== download excel file ====
  downloadExcelTemplate() {
    // Define the structure of the Excel file
    const sampleData = [
      {
        name: "shifaa",
        pharmacist: "mohamed",
        email: "shifaa@example.com",
        pharmacy_phone: "+1234567890",
        personal_phone: "+9876543210",
        license: "123456",
        password: "password123",
        confirm_password: "password123",
        placeSearch: "Dubai",
        sameHours: "TRUE",
        Monday_open: "08:00 AM",
        Monday_close: "06:00 PM",
        Tuesday_open: "08:00 AM",
        Tuesday_close: "06:00 PM",
        Wednesday_open: "08:00 AM",
        Wednesday_close: "06:00 PM",
        Thursday_open: "08:00 AM",
        Thursday_close: "06:00 PM",
        Friday_open: "08:00 AM",
        Friday_close: "06:00 PM",
        Saturday_open: "10:00 AM",
        Saturday_close: "04:00 PM",
        Sunday_open: "Closed",
        Sunday_close: "Closed"
      }
    ];
  
    // Convert JSON to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Users': worksheet }, SheetNames: ['Users'] };
  
    // Convert workbook to a buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Create a Blob and trigger download
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Nano_SignUp_Template.xlsx');
  }

  // On Uploaded file 
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      console.error("Only one file is allowed.");
      return;
    }
  
    console.log("Selected file:", target.files[0]); // Debug file selection
  
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer: ArrayBuffer = e.target.result;
      console.log("ArrayBuffer Data Read:", arrayBuffer); // Debug file reading
  
      const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: 'array' });
  
      const sheetName: string = workbook.SheetNames[0]; // Read first sheet
      console.log("Sheet Name:", sheetName); // Debug sheet name
  
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
  
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // Ensure empty cells return ""
  
      // Populate form with the first row of data (assuming single sign-up per upload)
      if (jsonData.length > 0) {
        const userData:any = jsonData[0];
        console.log(userData)
        this.registerform.patchValue({
          basicForm: {
            name: userData.name,
            pharmacist: userData.pharmacist,
            email: userData.email,
            pharmacy_phone: userData.pharmacy_phone,
            personal_phone: userData.personal_phone,
            license: userData.license,
            password: userData.password,
            confirm_password: userData.confirm_password
          },
          locationForm: {
            placeSearch: userData.placeSearch
          },
          workingHoursForm: {
            sameHours: userData.sameHours === 'TRUE', // Convert string to boolean
            days: this.populateWorkingHours(userData)
          }
        });
        this.uploadedData = jsonData;
        console.log("register form after append",this.registerform.value)
      }
    };
  
    reader.readAsArrayBuffer(target.files[0]);
  }
  
  // Function to populate working hours
  populateWorkingHours(userData: any) {
    return this.days.map(day => ({
      day: day,
      open: userData[`${day}_open`] || '',
      close: userData[`${day}_close`] || ''
    }));
  }


  processExcel() {
    if (!this.uploadedData.length) {
      alert("No data available!");
      return;
    }

    // Example: Process each user entry 
    this.uploadedData.forEach(user => {
      console.log(`Processing User: ${user.name}, Email: ${user.email}, Phone: ${user.pharmacy_phone}`);
    });
    // calling submit to login
    this.submit()
  }

//#endregion

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
  //#region Telephone number func
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
