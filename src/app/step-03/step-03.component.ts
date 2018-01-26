import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material/core';

import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-step-03',
  templateUrl: './step-03.component.html',
  styleUrls: ['./step-03.component.scss']
})
export class Step03Component implements OnInit {

	step03Form: FormGroup;

	matcher = new MyErrorStateMatcher();

	buttonStatus:boolean = true;

	// Flowstep
	flowStep:string='2';

	// Results from HTTP calls set as Objects for OOP
	surveyResults:any = {};
	regRes:any = {};

	// DOM Element Responses
	cancerRes:string;
	vegRes:string;
	shuttleRes:string;
	shuttleRes2:string;
	jerseyRes:string;
	attendenceRes:string;
	routeRes:string;
	experiencedRiderRes:string;

	emergencyName:string;
	emergencyPhone:string;

	// Select Options for Yes/No
	matSelect = [
		{value: 'Yes', viewValue: 'Yes'},
	    {value: 'No', viewValue: 'No'}
	]

	// Select Options for Jesey Sizes
	jerseySelect = [
		{value: 'XS', viewValue: 'XS'},
	    {value: 'S', viewValue: 'S'},
	    {value: 'M', viewValue: 'M'},
	    {value: 'L', viewValue: 'L'},
	    {value: 'XL', viewValue: 'XL'},
	    {value: '2XL', viewValue: '2XL'},
	    {value: '3XL', viewValue: '3XL'}
	]

	// Radio Button Options
	routes = [
	    {value: '1', viewValue: 'Classic'},
	    {value: '2', viewValue: 'Challenge'},
	    {value: '3', viewValue: 'Crew Member Only'}
	];

	// Years attended Options
	years = [
	    {value: '1', viewValue: '1'},
	    {value: '2', viewValue: '2'},
	    {value: '3', viewValue: '3'},
	    {value: '4', viewValue: '4'},
	    {value: '5', viewValue: '5'},
	    {value: '6', viewValue: '6'},
	    {value: '7', viewValue: '7'},
	    {value: '8', viewValue: '8'},
	    {value: '9', viewValue: '9'},
	    {value: '10', viewValue: '10'}
	];

	// Specifying API Method Variable
	method:string;

	// Survey Question IDs
	question_1:string = '&question_86997=' + this.attendenceRes;
	question_2:string = '&question_87010=' + this.cancerRes;
	question_3:string = '&question_87011=' + this.vegRes;

	constructor(private dataService: DataService, private route: Router, private http: HttpClient, public snackBar: MatSnackBar) { 
	}

	ngOnInit() {

		window.scrollTo(0,0);

		this.step03Form = new FormGroup({
			emergencyName: new FormControl(this.emergencyName, Validators.required),
			emergencyPhone: new FormControl(this.emergencyPhone, Validators.required),
			yearsAttended: new FormControl(null, Validators.required),
			routeSelect: new FormControl(null, Validators.required),
			cancerSurvivor: new FormControl(this.cancerRes),
			vegMeals: new FormControl(this.vegRes),
			jerseySizes: new FormControl(this.jerseyRes),
			shuttle1: new FormControl(this.shuttleRes),
			shuttle2: new FormControl(this.shuttleRes2),
			experienced: new FormControl(this.experiencedRiderRes)
		});

		// Checking logged in state, if they are logged in run regInfo() and getUserInfo() functions from the global dataService.
		if (this.dataService.isLoggedIn() === true && this.dataService.tokenExpired === false) {
			// console.log('You are logged in!');
			this.getSurveyRes();
			this.dataService.getRegInfo();

			// this.dataService.getParticipationType();
		} else if (this.dataService.storageToken === undefined) {
			// console.log('Auth Token Expired.');
			this.route.navigate(['/step-01']);

		} else {
			// if not logged in, go back to step 1 (login page)
			// console.log('You are not logged in, get outta here!');
			this.route.navigate(['/step-01']);
		}

	}

	ngAfterViewInit() {
		// console.log(this.step03Form);
		// console.log(this.step03Form.value.jerseySizes);
		if (this.step03Form.controls.jerseySizes.value === '[object Object]') {
			this.jerseyRes = '';
			console.log('jersey response is an empty object');
		}
	}

	// Get the Survey Responses
	getSurveyRes() {
		this.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.dataService.torontoID + '&sso_auth_token=' + this.dataService.ssoToken + '&survey_id=82857' + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				// For Loop to get Survey Data and set it to the correct variables
				for (let res of this.surveyResults.getSurveyResponsesResponse.responses) {

					// Cancer Survivor
					if (res.questionId === '87010') {
						if (this.cancerRes === undefined) {
							this.cancerRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.cancerRes = '';
						}
					}

					// Vegetarian Meals
					if (res.questionId === '87011') {
						if (this.vegRes === undefined) {
							this.vegRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.vegRes = '';
						}
					}

					// Attended Event (How many years attended event)
					if (res.questionId === '86997') {
						this.attendenceRes = res.responseValue;
						if (this.attendenceRes === undefined || null) {
							this.attendenceRes = '';
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.attendenceRes = '';
						}
					}

					// Jersey Selection
					if (res.questionId === '87014') {

						if (this.jerseyRes === '[object Object]') {
							console.log('jersey empty object');
						}
						
						if (this.jerseyRes === undefined || null) {
							this.jerseyRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.jerseyRes = '';
						}
						this.jerseyRes = res.responseValue;
					}

					// Shuttle 1 Selection
					if (res.questionId === '87015') {
						this.shuttleRes = res.responseValue;
						if (this.shuttleRes === undefined || null) {
							this.shuttleRes = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes = '';
						}
					}

					// Shuttle 2 Selection
					if (res.questionId === '87019') {
						this.shuttleRes2 = res.responseValue;
						if (this.shuttleRes2 === undefined || null) {
							this.shuttleRes2 = res.responseValue;
						}
						if (Object.keys(res.responseValue).length === 0) {
							this.shuttleRes2 = '';
						}
					}

					// Route Selection
					if (res.questionId === '87021') {
						this.routeRes = res.responseValue;
						if (res.responseValue === '[object Object]') {
							this.routeRes = '';
						}
						// if (this.routeRes === undefined || null) {
						// 	this.routeRes = res.responseValue;
						// }
						if (Object.keys(res.responseValue).length === 0) {
							this.routeRes = '';
							console.log('nothing selected for route!');
						}
					}

					// Experienced Rider
					if (res.questionId === '87022') {
						this.experiencedRiderRes = res.responseValue;
						if (this.experiencedRiderRes === undefined || null) {
							this.experiencedRiderRes = res.responseValue;
						}
					}
				}
			});
	}

	// Update the Survey Responses
	updateSurveyRes() {

		const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=1641&survey_id=' + this.dataService.surveyID;

		const question_86997 = '&question_86997=' + this.attendenceRes;
		const question_87010 = '&question_87010=' + this.cancerRes;
		const question_87011 = '&question_87011=' + this.vegRes;
		const question_87014 = '&question_87014=' + this.jerseyRes;
		const question_87015 = '&question_87015=' + this.shuttleRes;
		const question_87019 = '&question_87019=' + this.shuttleRes2;
		const question_87021 = '&question_87021=' + this.routeRes;
		const question_87022 = '&question_87022=' + this.experiencedRiderRes;

		this.http.post(updateSurveyResponsesUrl + question_86997 + question_87010 + question_87011 + question_87014 + question_87015 + question_87019 + question_87021 + question_87022 + '&sso_auth_token=' + this.dataService.ssoToken, null)
			.subscribe(res => {
				// console.log(res);
				this.updateReg();
				this.route.navigate(['/step-04']);
			}, 
			(error) => {
				console.log(error);
				this.route.navigate(['/step-01']);
			});
	}

	// Save Current Survey Answers (save for later)
	saveSurveyRes() {

		// Checking to see if data in the input is null or undefined, if so send as blank (to prevent errors in survey)
		if (this.dataService.emergencyName === null || undefined) {
			this.dataService.emergencyName = '';
		}

		if (this.dataService.emergencyPhone === null || undefined) {
			this.dataService.emergencyPhone = '';
		}

		if (this.routeRes === '[object Object]') {
			this.routeRes = '';
		}

		const updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=1641&survey_id=' + this.dataService.surveyID;

		const question_86997 = '&question_86997=' + this.attendenceRes;
		const question_87010 = '&question_87010=' + this.cancerRes;
		const question_87011 = '&question_87011=' + this.vegRes;
		const question_87014 = '&question_87014=' + this.jerseyRes;
		const question_87015 = '&question_87015=' + this.shuttleRes;
		const question_87019 = '&question_87019=' + this.shuttleRes2;
		const question_87021 = '&question_87021=' + this.routeRes;
		const question_87022 = '&question_87022=' + this.experiencedRiderRes;

		this.http.post(updateSurveyResponsesUrl + question_86997 + question_87010 + question_87011 + question_87014 + question_87015 + question_87019 + question_87021 + question_87022 + '&sso_auth_token=' + this.dataService.ssoToken, null)
			.subscribe(res => {
				this.updateReg();
			}, 
			(error) => {
				console.log(error);
				this.snackBar.open("There was an error while saving your form!", "Close", {
                        duration: 3500,
                        extraClasses: ['error-info']
                });
				this.route.navigate(['/step-01']);
			});
	}

	// Update the Registration Information
	updateReg() {
		if (this.emergencyName === null || undefined) {
			this.emergencyName = '';
		}

		if (this.emergencyPhone === null || undefined) {
			this.emergencyPhone = '';
		}

		this.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.dataService.torontoID + '&sso_auth_token=' + this.dataService.ssoToken + '&flow_step=' + this.flowStep + '&emergency_name=' + this.dataService.emergencyName + '&emergency_phone=' + this.dataService.emergencyPhone + '&response_format=json';
		this.http.post(this.dataService.convioURL + this.method, null) 
			.subscribe(res => {
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			});
	}

	// Previous Route
	previous() {
		this.route.navigate(['/step-02']);
	}

}
