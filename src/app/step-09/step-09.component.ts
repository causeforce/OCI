import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

/* HTTP Client to retrieve data */
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';

/* Data Service */
import { DataService } from '../data.service';

/* Angular Material */
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-step-09',
  templateUrl: './step-09.component.html',
  styleUrls: ['./step-09.component.scss']
})
export class Step09Component implements OnInit {

	// Setting the FlowStep
	flowStep:string = '8';

	// Survey Data and Variables
	surveyResults:any = {};
	preReg:string;

	// Registration Data
	regData:any = {};

	// Tentstatus Variable
	tentStatus:string;

	// Check-in Status Data
	updateRegRes:any = {};

	constructor(private data: DataService, private http: HttpClient) { }

	ngOnInit() {
		this.updateFlowStep();
		this.updateCheckInStatusComplete();
		this.getSurveyRes();
		this.data.getUserInfo();
		this.data.getRegInfo();
		this.data.getTeam();
	}

	// Get the Survey Responses
	getSurveyRes() {
		this.data.method = 'CRTeamraiserAPI?method=getSurveyResponses&api_key=cfrca&v=1.0&fr_id=' + this.data.torontoID + '&sso_auth_token=' + this.data.ssoToken + '&survey_id=82857' + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null)
			.subscribe(res => {
				this.surveyResults = res;

				for (let result of this.surveyResults.getSurveyResponsesResponse.responses) {
					if (result.questionId === '87002') {
						this.preReg = result.responseValue;
					}
				}

			}, (err) => {
				console.log(err);
			});
	}

	// Update the current Flowstep
	updateFlowStep() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0&fr_id=' + this.data.eventID + '&sso_auth_token=' + this.data.ssoToken + '&flow_step=' + this.flowStep + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				// console.log('Flow step updated.')
			}, (err) => {
				if (err) {
					console.log('There was an error updating the flowstep.');
				}
			});
	}

	// Set checkInStatus as Complete
	updateCheckInStatusComplete() {
		this.data.method = 'CRTeamraiserAPI?method=updateRegistration&api_key=cfrca&v=1.0' + '&fr_id=' + this.data.torontoID + '&sso_auth_token=' + this.data.ssoToken + '&checkin_status=complete' + '&response_format=json';
		this.http.post(this.data.convioURL + this.data.method, null) 
			.subscribe(res => {
				this.updateRegRes = res;
				// console.log(this.updateRegRes);
				// window.location.reload();
			});
	}

	// Print Method
	print() {
	    window.print();
	}

}
