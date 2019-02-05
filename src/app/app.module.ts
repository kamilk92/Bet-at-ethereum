import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';


import {AppComponent} from './app.component';
import {AppRoutingModule} from './/app-routing.module';
import {TournamentComponent} from './tournament/tournament.component';

import {ContractsService} from "./services/contracts/contracts.service";
import {LocalstorageService} from "./services/localstorage/localstorage.service";
import {AcctService} from "./services/acct/acct.service";
import {TournamentService} from "./services/tournament/tournament.service";
import {TournamentdetailComponent} from './tournament/detail/tournamentdetail.component';
import {LoginComponent} from './login/login.component'

@NgModule({
  declarations: [
    AppComponent,
    TournamentComponent,
    TournamentdetailComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    TournamentService,
    ContractsService,
    LocalstorageService,
    AcctService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
