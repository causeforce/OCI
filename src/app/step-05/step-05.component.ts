import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl,FormGroup, FormGroupDirective, NgForm, Validators  } from '@angular/forms';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Angular Material */
import { MatSnackBar } from '@angular/material';

/* Data Service */
import { DataService } from '../data.service';


@Component({
  selector: 'app-step-05',
  templateUrl: './step-05.component.html',
  styleUrls: ['./step-05.component.scss']
})
export class Step05Component implements OnInit {
	// ViewChild to connect DOM Element to typscript
	@ViewChild('videoPlayer') videoplayer: any;
	@ViewChild('waiverTxt') waiverText: any;

	// Defining the formgroup
	waiverForm: FormGroup;

	// Variables for DOM Manipulation
	fullName:string;
	ageResponse:boolean;
	ageResponseVal:string;
	videoResponse:string;
	videoWatched:boolean = false;
	scrolledBottom:boolean = false;

	// Survey Question ID(s)
	videoWatchedQID:string = '87013';
	ageQID:string = '86999';
	waiverNameQID:string = '86998';

	// Survey results
	surveyResults:any={};

	// Flowstep
	flowStep:string = '4';


	constructor(private data: DataService, private http: HttpClient, private route: Router, public snackBar: MatSnackBar) {

		// console.log(this.ageResponse);

	}

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
			console.log('You are not logged in, get outta here!');
			this.route.navigate(['/step-01']);
		}

		// Defining the FormGroup with the DOM Elements and Validators
		this.waiverForm = new FormGroup({
			fullName: new FormControl('', [Validators.required, Validators.max(40), Validators.min(5)]),
			ageResponse: new FormControl('', Validators.required)
		});



	}

	waiverScroll() {
		if (this.waiverText.nativeElement.scrollTop >= 950) {
			this.scrolledBottom = true;
		}
	}

	vidEnded() {
		this.videoResponse = 'Yes';
		this.videoWatched = true;
	}

	playVideo(event: any) {
	    this.videoplayer.nativeElement.play();
	}

	pauseVideo(event: any) {
	    this.videoplayer.nativeElement.pause();
	}

	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.torontoID + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;
				// console.log(this.surveyResults);

				// For loop to loop through the responded data from API call
				for (let data of this.surveyResults.getSurveyResponsesResponse.responses) {
					// If questionId is same as waiver question ID in Survey then check if fullName variable is undefined or null, if so set it as the response value else if it's length is equil to 0 or no reponseValue, then set it to a blank string
					if (data.questionId === this.waiverNameQID) {
						if (this.fullName === undefined || null) {
							this.fullName = data.responseValue;
						}
						if (Object.keys(data.responseValue).length === 0) {
							this.fullName = '';
						}
					}

					if (data.questionId === this.videoWatchedQID) {
						if (this.videoResponse === undefined || null) {
							this.videoResponse = data.responseValue;
						}
						if (Object.keys(data.responseValue).length === 0) {
							this.videoResponse = 'No';
						}
						if (data.responseValue === 'Yes') {
							this.videoWatched = true;
						}
					}

					if (data.questionId === this.ageQID) {
						// Same as above
						if (this.ageResponseVal === undefined || null) {
							this.ageResponseVal = data.responseValue;
						}
						if (Object.keys(data.responseValue).length === 0) {
							this.ageResponseVal = '';
						}

						// If response value is Yes, set the checkBox to be true (checkboxes only accept true or false values, the value returned from and sent to the call are a string)
						if (data.responseValue === 'Yes') {
							this.ageResponse = true;
							this.scrolledBottom = true;
						}
						if (data.responseValue === 'No') {
							this.ageResponse = false;
						}
					}
				}
			}, 
			(err) => {
				console.log('There was an error!');
				if (err.status === 403) {
					this.snackBar.open("Your login session has expired. Please login again.", "Close", {
                        duration: 13500,
                        extraClasses: ['error-info']
               		});
               		this.route.navigate(['/step-01']);
				}
			});
	}

	updateSurveyRes() {

		const question_87013 = '&question_'+ this.videoWatchedQID + '=' + this.videoResponse;
		const question_86999 = '&question_'+ this.ageQID + '=' + this.ageResponseVal;
		const question_86998 = '&question_'+ this.waiverNameQID + '=' + this.fullName;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87013 + question_86999 + question_86998 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
				this.route.navigate(['/step-06']);
			}, 
			error => {
				console.log('There was an error');
			});
	}

	updateSurveyResSave() {

		const question_87013 = '&question_'+ this.videoWatchedQID + '=' + this.videoResponse;
		const question_86999 = '&question_'+ this.ageQID + '=' + this.ageResponseVal;
		const question_86998 = '&question_'+ this.waiverNameQID + '=' + this.fullName;

		var updateSurveyResponsesUrl = 'https://secure2.convio.net/cfrca/site/CRTeamraiserAPI?method=updateSurveyResponses&api_key=cfrca&v=1.0&response_format=json&fr_id=' + this.data.eventID;

		this.http.post(updateSurveyResponsesUrl + question_87013 + question_86999 + question_86998 + '&survey_id=' + this.data.surveyID + '&sso_auth_token=' + this.data.ssoToken, null)
			.subscribe(res => {
				console.log(res);
				this.surveyResults = res;

				this.snackBar.open("Your information has been saved!", "Close", {
                        duration: 3500,
                        extraClasses: ['saved-info']
                });
			}, 
			error => {
				console.log('There was an error');
			});
	}

	previous() {
		this.route.navigate(['/step-04']);
	}

	checkRes() {
		if (this.ageResponse === true) {
			this.ageResponseVal = 'Yes';
		}
		if (this.ageResponse === false) {
			this.ageResponseVal = 'No';
		}
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
