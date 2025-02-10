import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {TranslateModule} from "@ngx-translate/core";
import {TranslateService,LangChangeEvent } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
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
  
  uniqueId = Math.random().toString(36).substr(2, 9);

  currentTab = 0;
  formTabs!: NodeListOf<HTMLElement>;
  wizardItems!: NodeListOf<HTMLElement>;
  readyToSubmit:boolean=false;
  registerform!: FormGroup;
  sameHoursForAll:boolean=false;
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
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  selectedMarker!: google.maps.marker.AdvancedMarkerElement;
  selectedPlaceName: any = '';
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
    return this.days.map(day => {
      const from = userData[`${day}_open`] || '';
      const to = userData[`${day}_close`] || '';
      return {
        day: day,
        from: from,
        to: to,
        enabled: from !== '' && to !== '' // Set enabled to true only if both from and to have values
      };
    });
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
        is24Hours: [false],  // Ensure this is defined
        from: [''],
        to: [''],
        days: this.builder.array(this.days.map(day => this.createDayControl(day)))
      })
    });
    // Subscribe to `sameHours` changes
    this.registerform.get('workingHoursForm.sameHours')?.valueChanges.subscribe((isChecked) => {
      this.toggleSameHours(isChecked);
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
    
    // If 24-hour mode is checked, reset from & to fields
    if (is24Hours) {
      dayControl.patchValue({ from: '', to: '' });
    }
  }

  // Toggle Same Hours for all days
  toggleSameHours(event: any): void {
    
    const sameHours = this.registerform.get('workingHoursForm.sameHours')?.value;
    const from = this.registerform.get('workingHoursForm.from')?.value;
    const to = this.registerform.get('workingHoursForm.to')?.value;
    const is24Hours = this.registerform.get('workingHoursForm.is24Hours')?.value;

    if (sameHours) {
      this.daysArray.controls.forEach((dayControl) => {
        dayControl.patchValue({
          enabled: true,
          is24Hours: is24Hours,
          from: is24Hours ? '' : from,
          to: is24Hours ? '' : to
        });
      });
    }
  }

  // Toggle 24-hour mode for all days
  toggle24HoursForAll(is24Hours: boolean): void {
    if (this.registerform.get('workingHoursForm.sameHours')?.value) {
      // If "Same hours" is checked, update global 24-hour toggle
      this.registerform.patchValue({
        workingHoursForm: {
          from: is24Hours ? '' : this.registerform.get('workingHoursForm.from')?.value,
          to: is24Hours ? '' : this.registerform.get('workingHoursForm.to')?.value
        }
      });

      // Apply to all days
      this.daysArray.controls.forEach(dayControl => {
        dayControl.patchValue({
          is24Hours,
          from: is24Hours ? '' : dayControl.get('from')?.value,
          to: is24Hours ? '' : dayControl.get('to')?.value
        });
      });
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

  loadGoogleMaps(lang: string) {


    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement;

      if (existingScript) {
        console.log("Google Maps script already exists:", existingScript);

        // Get the current script src
        let currentSrc = existingScript.getAttribute('src') as string;

        // Regex to match the "language=" parameter in the URL
        const languageRegex = /[?&]language=[a-zA-Z-]+/;

        if (languageRegex.test(currentSrc)) {
          // If language parameter exists, replace it
          currentSrc = currentSrc.replace(languageRegex, `&language=${lang}`);
        } else {
          // If language parameter doesn't exist, append it
          currentSrc += `&language=${lang}`;
        }

        // Reload the script by setting the src again
        existingScript.setAttribute('src', currentSrc);

        console.log("Updated script src:", existingScript.src);

        // Call initAutocomplete again to update the map with the new language
        existingScript.onload = () => {
          this.initAutocomplete();
        };
        return;
      }

      // If script does not exist, create and add it
      const newScript = document.createElement('script') as HTMLScriptElement;
      newScript.async = true;
      newScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAAu836oHdkxoQ0RITqGgf8CTYaKd0e3II&libraries=places,marker&language=${lang}`;
      newScript.defer = true;
      
      newScript.onload = () => {
        this.initAutocomplete();
      };

      document.body.appendChild(newScript);
      console.log("New script added:", newScript.src);

      // Find the existing script
    // const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement;

    // if (existingScript) {
    //   console.log("Google Maps script already exists:", existingScript);

    //   // Remove the old script before adding the new one
    //   existingScript.remove();
    //   console.log("Old script removed.");
    // }

    // // Create and append a new script with the updated language
    // const newScript = document.createElement('script') as HTMLScriptElement;
    // newScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAAu836oHdkxoQ0RITqGgf8CTYaKd0e3II&libraries=places,marker&language=${lang}`;
    // newScript.async = true;
    // newScript.defer = true;

    // newScript.onload = () => {
    //   console.log("New script loaded with language:", lang);
    //   this.initAutocomplete(); // Reinitialize the map
    // };

    // document.body.appendChild(newScript);
    // console.log("New script added:", newScript.src);
    
  }

  async initAutocomplete() {
    // Default location (United Arab Emirates)
    const defaultLocation = { lat: 25.276987, lng: 55.296249 }; // Example: Dubai, UAE
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 13,
      mapTypeId: "roadmap",
      mapId: "90523c0c1ad46807",
    });

    // Load AdvancedMarkerElement dynamically
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    // Create and store a single marker (initially at the default location)
    this.selectedMarker = new AdvancedMarkerElement({
      map: this.map,
      title: "Default Location",
      position: defaultLocation,
    });

    // Set up search box functionality
    const input = this.searchBoxInput.nativeElement as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);

    this.map.addListener("bounds_changed", () => {
      searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
    });

    searchBox.addListener("places_changed", async () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      const place = places[0]; // Get the first selected place
      if (!place.geometry || !place.geometry.location) return;

      // Update the selected place name
      this.selectedPlaceName = place.name ?? '';  // Handle undefined

      const selectedLocation = place.geometry.location;

      // Ensure the selected location is not null
      if (selectedLocation) {
        // If the marker is already created, update its position and title
        this.selectedMarker.position = selectedLocation;
        this.selectedMarker.title = place.name ?? '';

        // Update the form with the selected place name
        this.registerform.get('locationForm')?.patchValue({
          placeSearch: this.selectedPlaceName,
        });

        // Center the map and zoom in
        this.map.setCenter(selectedLocation);
        this.map.setZoom(15);
      }
    });

    // Handle map click event to select location
    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const clickedLocation = event.latLng;
      
      // Log the clicked location for debugging
      console.log("Clicked location: ", clickedLocation);

      // Ensure the clicked location is not null
      if (clickedLocation) {
        // Reverse geocode the clicked location to get the place name
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: clickedLocation }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const clickedPlace = results[0];

            // Log the clicked place for debugging
            console.log("Clicked place: ", clickedPlace);

            // Update the selected place name and form
            this.selectedPlaceName = clickedPlace.formatted_address ?? '';
            this.registerform.get('locationForm')?.patchValue({
              placeSearch: this.selectedPlaceName,
            });

            // If the marker is already created, update its position and title
            this.selectedMarker.position = clickedLocation;
            this.selectedMarker.title = this.selectedPlaceName;

            // Log the updated marker position for debugging
            console.log("Updated marker position: ", this.selectedMarker.position);

            // Center the map on the clicked location and zoom in
            this.map.setCenter(clickedLocation);
            this.map.setZoom(15);
          }
        });
      }
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
