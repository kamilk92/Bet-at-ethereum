import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TournamentService} from "../services/tournament/tournament.service";
import {TournamentContract} from "../services/contracts/tournament/tournamentcontract";

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit {

  tournaments: TournamentContract[];

  private router: Router;
  private tournamentService: TournamentService;

  constructor(tournamentService: TournamentService, router: Router) {
    this.router = router;
    this.tournamentService = tournamentService;
  }

  ngOnInit() {
    this.tournaments = this.tournamentService.getTournaments();
  }

  public selectTournament(tournament: any) {
    this.tournamentService.selectTournament(tournament);
    this.router.navigate(['/tournamentdetail']);
  }

}
