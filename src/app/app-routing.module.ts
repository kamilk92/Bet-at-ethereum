import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {TournamentComponent} from './tournament/tournament.component';
import {TournamentdetailComponent} from './tournament/detail/tournamentdetail.component';
import {LoginComponent} from './login/login.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'tournament', component: TournamentComponent},
  {path: 'tournamentdetail', component: TournamentdetailComponent},
  {path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    FormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
