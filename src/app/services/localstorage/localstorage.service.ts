import {Injectable} from '@angular/core';

@Injectable()
export class LocalstorageService {
  public static readonly ALL_TOURNAMENTS_KEY: string = "alltournaments";
  public static readonly CURRENT_ACCT_KEY = "currentacct";
  public static readonly SELECTED_TOURNAMENT_KEY: string = "currenttournament";

  private localStorage: any;

  constructor() {
    this.localStorage = (typeof window !== "undefined") ? window.localStorage : null;
  }

  public setItem(key: string, item: any) {
    this.localStorage.setItem(key, item);
  }

  public getItem(key: string): any {
    return this.localStorage.getItem(key);
  }

}
