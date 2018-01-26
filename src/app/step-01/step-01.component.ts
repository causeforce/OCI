import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-01',
  templateUrl: './step-01.component.html',
  styleUrls: ['./step-01.component.scss']
})
export class Step01Component implements OnInit {

	hide = true;

	loginForm: FormGroup;

	matcher = new MyErrorStateMatcher();

	constructor(private dataService: DataService, private http: HttpClient, private router: Router) {
		
		// Checking if the user is logged in, if so go to step 2
		console.log(dataService.isloggedIn);
		if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {
			console.log('Step 1: You are logged in already...');
			this.router.navigate(['/step-02']);
		}
	}

	ngOnInit() {

		this.loginForm = new FormGroup({
			username: new FormControl('', Validators.required),
			password: new FormControl('', Validators.required)
		});

	}

	@Input() isVisible : boolean = true;
	
	// Setting locale by running the setLocaleEn() function in the data service then reloading
	setLocaleEN() {
		this.dataService.setLocaleEn();
		window.location.reload();
	}
	// Setting locale by running the setLocaleFr() function in the data service then reloading
	setLocaleFR() {
		this.dataService.setLocaleFr();
		window.location.reload();
	}
	// Calling on the isLoggedIn() function from the global data service to check the logged in state
	isLoggedIn() {
		return this.dataService.isLoggedIn();
	}
	// Show or hide the locale buttons or menu
	showLocale() {
		return this.dataService.toggleLocaleMenu();
	}

}
