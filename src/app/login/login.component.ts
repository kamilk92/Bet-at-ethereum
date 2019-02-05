import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AcctService} from "../services/acct/acct.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public accts: string[];
  public selectedAcct: string;
  public acctValid: any = {
    valid: false,
    err: false,
    errMsg: ""
  };

  private router: Router;
  private acctService: AcctService;

  constructor(router: Router, acctService: AcctService) {
    this.router = router;
    this.acctService = acctService;
    this.accts = this.acctService.getAccounts();
  }

  public login() {
    if (this.selectedAcct == null) {
      this.acctValid.valid = false;
      this.acctValid.err = true;
      this.acctValid.errMsg = "Nie wybrano konta.";

      return;
    }
    this.acctService.setCurrentAcct(this.selectedAcct);
    this.acctService.getBalance(
      function (balance) {},
      function (err) {
        console.log("Can't fetch balance. Error: ", err);
      }
    );

    this.router.navigate(['/tournament']);
  }

  ngOnInit() {
  }

}
