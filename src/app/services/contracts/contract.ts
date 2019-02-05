import {ContractInstance} from "./contractinstance";

export abstract class Contract<T extends ContractInstance> {
  protected contractInstance: T;

  constructor(contractInstance: T) {
    this.contractInstance = contractInstance;
  }
}