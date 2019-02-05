import {Injectable} from '@angular/core';
import {ContractsService} from "../contracts/contracts.service"
import {LocalstorageService} from "../localstorage/localstorage.service";
import {BehaviorSubject} from "rxjs";

import * as Web3 from 'web3';



@Injectable()
export class AcctService {
  private contractsService: ContractsService;
  private localstorageService: LocalstorageService;
  private web3: Web3;

  private acct: string;
  private balance: number;
  private nick: string;

  private balanceSource = new BehaviorSubject(null);
  public currentBalance = this.balanceSource.asObservable();

  constructor(contractsService: ContractsService, localstorageService: LocalstorageService) {
    this.contractsService = contractsService;
    this.localstorageService = localstorageService;
    this.web3 = this.contractsService.getWeb3();
    this.loadAcctFromStorage();
    this.balance = null;
    this.nick = null;
  }

  public getAccounts(): string[] {
    return this.web3.eth.accounts;
  }

  public removeCurrentAcct() {
    this.setCurrentAcct(null);
    this.localstorageService.setItem(LocalstorageService.CURRENT_ACCT_KEY, null);
  }

  public setCurrentAcct(acct: string) {
    this.localstorageService.setItem(LocalstorageService.CURRENT_ACCT_KEY, acct);
    this.acct = acct;
    this.web3.eth.defaultAccount = acct;
    this.balance = null;
  }

  public getBalance(succCall, errCall): number {
    if ((this.acct == null) || (this.acct === "null") || (this.balance != null)) {
      succCall(this.balance);
      return;
    }

    let self: AcctService = this;

    this.web3.eth.getBalance(this.acct, function (err, result) {
      if (err) {
        errCall(err);
        return;
      }
      self.balance = self.web3.fromWei(result).toNumber();
      self.balanceSource.next(self.balance);
      succCall(self.balance);
    });
  }

  public getCurrentAcct(): string {
    return this.acct;
  }

  public isAcctSet(): boolean {
    return this.acct != null;
  }

  public refreshBlance() {
    this.balance = null;
  }

  private loadAcctFromStorage() {
    let acct = this.localstorageService.getItem(
      LocalstorageService.CURRENT_ACCT_KEY);
    if (acct == null) {
      return;
    }
    this.setCurrentAcct(acct);
  }

}
