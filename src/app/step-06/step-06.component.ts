import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl,FormGroup, FormGroupDirective, NgForm, Validators  } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

/* Data Service */
import { DataService } from '../data.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'app-step-06',
  templateUrl: './step-06.component.html',
  styleUrls: ['./step-06.component.scss']
})
export class Step06Component implements OnInit {

	// Error state matcher for the form validation
	matcher = new MyErrorStateMatcher();

	// Setting the FlowStep
	flowStep:string = '5';

	// Defining variables tied with the DOM
	upsellResults:string;
	upsellHiddenResult:string;
	hiddenUpsellValue:string;

	// Defining the formgroup
	upsellForm: FormGroup;

	// Radio Button Options
	upsells = [
	    {value: '1441', viewValue: 'Register for $10 (online only)'},
	    {value: '1443', viewValue: 'Donate $100 (registration fee waived)'},
	    {value: '0', viewValue: 'No, thank you.'}
	];

	// Results from getSurvey
	surveyResults:any = {};

	// Survey Question ID(s)
	hiddenUpsellQID:string = '87012'
	acceptedUpsellQID:string = '87002';

	constructor(
		private data: DataService, 
		private http: HttpClient, 
		private route: Router, 
		public snackBar: MatSnackBar) { }

	ngOnInit() {

		window.scrollTo(0,0);

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			// console.log('You are logged in!');
			this.getSurveyRes();
			this.updateFlowStep();

			// this.dataService.getParticipationType();
		} else if (this.data.storageToken === undefined) {
			// console.log('Auth Token Expired.');
			this.route.navigate(['/step-01']);

		} else {
			// if not logged in, go back to step 1 (login page)
			// console.log('You are not logged in, get outta here!');
			this.route.navigate(['/step-01']);
		}

		// Defining Upsell FormGroup
		this.upsellForm = new FormGroup({
			upsellSelect: new FormControl(null, Validators.required)
		});

	}

	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.torontoID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				// For loop to loop through the responded data from API call
				for (let data of this.surveyResults.getSurveyResponsesResponse.responses) {
					// If questionId is same as waiver question ID in Survey then check if fullName variable is undefined or null, if so set it as the response value else if it's length is equil to 0 or no reponseValue, then set it to a blank string
					if (data.questionId === this.hiddenUpsellQID) {
						if (data.responseValue === '[object Object]') {
							this.upsellResults = '';
						}
						if (this.upsellResults === undefined || null) {
							this.upsellResults = data.responseValue;
						}

						if (data.responseValue === '1441' || data.responseValue === '1443') {
							this.upsellHiddenResult = 'Yes';
						}

						if (data.responseValue === '0') {
							this.upsellHiddenResult = 'No';
						}

						if (Object.keys(data.responseValue).length === 0) {
							this.upsellResults = null;
							console.log('Nothing has been selected for upsell.');
						}

					}
				}
			}, 
			(err) => {
				console.log('There was an error!');
				if (err.status === 403) {

					this.data.logOut();
					this.snackBar.open("Your login session has expired. Please login again.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
               		this.route.navigate(['/step-01']);
				}
			});
	}

	updateSurveyRes() {
		if (this.upsellResults === '1441' || this.upsellResults === '1443') {
			this.upsellHiddenResult = 'Yes'; 
		}
		if (this.upsellResults === '0') {
			this.upsellHiddenResult = 'No'; 
		}
		// Constant variable for the upsell question response and ID
		const question_87012 = '&question_'+ this.hiddenUpsellQID + '=' + this.upsellResults;
		const question_87002 = '&question_'+ this.acceptedUpsellQID + '=' + this.upsellHiddenResult;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87002 + question_87012 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
				this.route.navigate(['/step-07']);
			}, (error) => {
				console.log(error);
			});
	}

	// Save the current Survey Responses
	saveSurveyResponses() {
		if (this.upsellResults === '1441' || this.upsellResults === '1443') {
			this.upsellHiddenResult = 'Yes'; 
		}
		if (this.upsellResults === '0') {
			this.upsellHiddenResult = 'No'; 
		}
		// Constant variable for the upsell question response and ID
		const question_87012 = '&question_'+ this.hiddenUpsellQID + '=' + this.upsellResults;
		const question_87002 = '&question_'+ this.acceptedUpsellQID + '=' + this.upsellHiddenResult;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87002 + question_87012 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
				// this.route.navigate(['/step-06']);
				window.location.reload();
			}, 
			error => {
				console.log('There was an error');
			});
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.torontoID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// console.log('Flow step updated.')
			}, (err) => {
				if (err) {
					console.log(err);
				}
			});
	}

	// Previous Route
	previous() {
		this.route.navigate(['/step-05']);
	}

}
