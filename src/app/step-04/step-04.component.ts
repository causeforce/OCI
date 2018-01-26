import { Component, OnInit } from '@angular/core';
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
  selector: 'app-step-04',
  templateUrl: './step-04.component.html',
  styleUrls: ['./step-04.component.scss']
})
export class Step04Component implements OnInit {
	buttonStatus:boolean = true;
	healthInsName:string;
	healthInsNumber:string;

	flowStep:string = '3';

	healthInsNameID:string = '87000';
	healthInsNumberID:string = '87001';

	healthForm: FormGroup;

	surveyResults:any={};


	constructor(private data: DataService, private http: HttpClient, private route: Router, public snackBar: MatSnackBar) { 
		
	}

	ngOnInit() {
		window.scrollTo(0,0);

		// Checking logged in state, and running correct functions
		if (this.data.isLoggedIn() === true && this.data.tokenExpired === false) {
			// console.log('You are logged in!');
			this.getSurveyRes();
			this.data.getRegInfo();
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

		this.healthForm = new FormGroup({
			healthName: new FormControl('', Validators.required),
			healthNumber: new FormControl('', Validators.required)
		});

		// console.log(this.healthForm.controls.healthName.invalid);
	}

	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.torontoID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				for (let data of this.surveyResults.getSurveyResponsesResponse.responses) {
					if (data.questionId === this.healthInsNameID) {
						if (this.healthInsName === undefined || null) {
							this.healthInsName = data.responseValue;
						}
						if (Object.keys(data.responseValue).length === 0) {
							this.healthInsName = '';
						}
					}
					if (data.questionId === this.healthInsNumberID) {

						if (this.healthInsNumber === undefined || null) {
							this.healthInsNumber = data.responseValue;
						}
						if (Object.keys(data.responseValue).length === 0) {
							this.healthInsNumber = '';
						}
					}
				}
			}, (err) =>{
				console.log(err);
			});
	}

	updateSurveyRes() {

		const question_87000 = '&question_'+ this.healthInsNameID + '=' + this.healthInsName;
		const question_87001 = '&question_'+ this.healthInsNumberID + '=' + this.healthInsNumber;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87000 + question_87001 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
				this.route.navigate(['/step-05']);
			}, 
			error => {
				console.log('There was an error');
			});
	}

	updateSurveyResSave() {

		const question_87000 = '&question_'+ this.healthInsNameID + '=' + this.healthInsName;
		const question_87001 = '&question_'+ this.healthInsNumberID + '=' + this.healthInsNumber;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87000 + question_87001 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;
				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
				// window.location.reload();
			}, 
			error => {
				console.log('There was an error');
			});
	}

	previous() {
		this.route.navigate(['/step-03']);
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.torontoID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// console.log('Flow step updated.')
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

}
