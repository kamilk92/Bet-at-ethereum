import {Injectable} from '@angular/core';

import * as Web3 from 'web3';

@Injectable()
export class ContractsService {

  private mode: string = "PRODUCTION";

  private web3Provider: any;
  private web3: Web3;

  constructor() {
    if (this.mode == "PRODUCTION") {
      console.log("PRODUCTION: found web3 provider.");
      this.web3Provider = (window as any).web3.currentProvider;
    } else {
      console.log("DEVELOPE: Not found web3 provider trying to connect local provider.");
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    this.web3 = new Web3(this.web3Provider);
  }

  public getWeb3(): Web3 {
    return this.web3;
  }

  public parseContract(abi: string) {
    return this.web3.eth.contract(JSON.parse(abi));
  }

}
