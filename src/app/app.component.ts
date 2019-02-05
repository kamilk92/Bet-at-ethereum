import {Router} from '@angular/router';
import {Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {AcctService} from "./services/acct/acct.service";
import {TournamentService} from "./services/tournament/tournament.service";
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'bet-at-eth';

  @Input() balanceObserver: Observable<any>;
  balance: number;


  private router: Router;
  private acctService: AcctService;
  private tournamentService: TournamentService;
  private changeDetector: ChangeDetectorRef;

  constructor(changeDetecor: ChangeDetectorRef, router: Router, acctService: AcctService, 
    tournamentService: TournamentService) {
    this.balanceObserver = acctService.currentBalance;
    this.balance = null;
    this.router = router;
    this.acctService = acctService;
    this.changeDetector = changeDetecor;
    this.tournamentService = tournamentService;
  }

  ngOnInit() {
    this.balanceObserver.subscribe(balance => {
      this.balance = balance;
      this.changeDetector.detectChanges();
    });
  }

  public chooseAcct(acct: string) {
    this.acctService.setCurrentAcct(acct);
  }

  public isLogged(): boolean {
    return this.acctService.isAcctSet();
  }

  public getAcct(): string {
    let acct: string = this.acctService.getCurrentAcct();
    if (acct == null) {
      return acct;
    }

    return acct.substring(0, 6) + "..." + acct.substring(acct.length - 4, acct.length - 1)
  }

  public getBalance(): number {
    return this.balance;
  }

  public logout() {
    this.balance = null;
    this.acctService.removeCurrentAcct();
    this.tournamentService.refreshTournamentst();
    this.router.navigate(["/login"]);
  }
}
