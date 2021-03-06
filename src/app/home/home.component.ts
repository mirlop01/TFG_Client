import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FoodDiaryComponent } from '../food-diary/food-diary.component';
import { GlucoseDiaryComponent } from '../glucose-diary/glucose-diary.component';
import { InsulinDiaryComponent } from '../insulin-diary/insulin-diary.component';
import { ActionResultModel } from '../_models/action-result.model';
import { ActionMessageComponent } from '../_popups/action-message/action-message.component';
import { NotificationComponent } from '../_popups/notification/notification.component';
import { UserModel } from '../_models/user.model';
import { Router } from '@angular/router';
import { CustomItemModel } from '../_models/custom-item.model';
import { UserService } from '../_services/user.service';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
selector: 'app-home',
templateUrl: './home.component.html',
styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit{
	title = 'Mirlop01tfg';
	avatarStatus = "neutro.gif";

	currentAction: ActionResultModel;
	selectedItems: CustomItemModel[] = [];
	menuType = null;
	menuOpen: boolean = false;
	
	coins = 0;

	constructor(private authenticationService: AuthenticationService, private userService: UserService, public dialog: MatDialog, private router: Router){};

	ngOnInit() {
		this.userService.getUserInformation()
		.subscribe((userInfoResponse:any) => {
			let userInfo = new UserModel().deserialize(userInfoResponse);
			this.coins = userInfo.coins;
			this.currentAction = userInfoResponse.currentAction && !userInfoResponse.currentAction.fulfilled? new ActionResultModel().deserialize(userInfo.currentAction) : null;
			this.avatarStatus = this.currentAction? this.currentAction.status: userInfo.avatarStatus;
			this.selectedItems = [...userInfo.customItems];
		});
	}

	openDialog(type:string): void {
		let component; 
		let dialogData;

		this.menuType = type;

		switch(this.menuType){
			case 'food':
				component = FoodDiaryComponent;
				break;

			case 'glucose':
				component = GlucoseDiaryComponent;
				break;

			case 'insulin':
				component = InsulinDiaryComponent;
				break;
			
			case 'actionMessage':
				let newData = {...this.currentAction};
				newData.prize = null;

				this.openNotification(ActionMessageComponent, newData);
				break;
				
		}

		if(!dialogData)
		 	dialogData = { requiredAction: this.currentAction };

		if(component) {
			const dialogRef = this.openNotification(component, dialogData);
		
			dialogRef.afterClosed().subscribe(result => {
				this.menuType = null;

				if(result) {
					if(result.prize || result.problem || result.solution) {
						this.openNotification(ActionMessageComponent, result);
						this.coins += result.prize;

						if(result.status)
							this.avatarStatus = result.status;

						this.currentAction = result.nextAction? result : null;

					} else {
						this.openNotification(NotificationComponent, {
							message: result.message
						});
					}
				}
			});
		}
	}
	
	openNotification(component, message?) {
		return this.dialog.open(component, {
			hasBackdrop: true,
			data: message
		});
	}	

	openNewPage(pageName) {
		this.router.navigate([pageName]);
	}

	openMenu(){
		this.menuOpen = !this.menuOpen;
	}

	logout() {
		this.authenticationService.logout();
	}
}
