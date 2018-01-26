import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
 	

	torontoLogoURL:string='https://secure2.convio.net/cfrca/images/content/pagebuilder/rcto_2018_logo_rgb_full_400x178.png';
	torontoLogo:string='assets/images/event_logo.png';

	constructor(private dataService: DataService) {}

	ngOnInit() {}

	// Calling on the isLoggedIn() function from the global data service to check the logged in state
	isLoggedIn() {
		return this.dataService.isLoggedIn();
	}

}
