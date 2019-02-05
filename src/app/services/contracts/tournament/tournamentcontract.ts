import {Contract} from "../contract";
import {TournamentContractInstance} from "./tournamentcontractinstance";
import {TransactionSpec} from "../../contracts/transactionspec";
import {MatchModel} from "../../../model/match/matchmodel";
import {BetModel} from "../../../model/bet/betmodel";

export class TournamentContract extends Contract<TournamentContractInstance> {
  protected id: number;
  protected name: string;
  protected description: string;

  constructor(contractInstance: TournamentContractInstance, id: number,
    name: string, description: string) {

    super(contractInstance);
    this.id = id;
    this.name = name;
    this.description = description;
  }

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public addMatch(beginTime: number, awayTeam: string, homeTeam: string,
    group: string, fromAcct: string, gasLimit: number, succCall, errCall) {

    this.contractInstance.addMatch(beginTime, awayTeam, homeTeam, group, {
      from: fromAcct, gas: gasLimit
    }, this.handleRsp(succCall, errCall));
  }

  public isEnded(succCall, errCall) {
    this.contractInstance.ended(this.handleRsp(succCall, errCall));
  }

  public getArbiter(succCall, errCall) {
    this.contractInstance.arbiter(
      this.handleRsp(succCall, errCall));
  }

  public getBet(betId: number, succCall, errCall) {
    this.contractInstance.getBet(betId, this.handleRsp(succCall, errCall));
  }

  public getBetForMatch(userAcct: string, matchId: number, succCall, errCall) {
    this.contractInstance.getBetForMatch(userAcct, matchId, this.handleRsp(succCall, errCall));
  }

  public getJackpot(succCall, errCall) {
    this.contractInstance.getJackpot(this.handleRsp(succCall, errCall));
  }

  public getMatch(num: number, succCall, errCall) {
    this.contractInstance.matches(num, this.handleRsp(succCall, errCall));

    return
  }

  public getMatchesCnt(succCall, errCall) {
    this.contractInstance.getMatchesCnt(this.handleRsp(succCall, errCall));
  }

  public getNick(userAcct: string, succCall, errCall) {
    this.contractInstance.getNick(userAcct, this.handleRsp(succCall, errCall));
  }

  public getUserBetsIds(userAcct: string, succCall, errCall) {
    this.contractInstance.getUserBetsIds(userAcct, this.handleRsp(succCall, errCall))
  }

  public getUserScore(userAcct: string, succCall, errCall) {
    this.contractInstance.getUserScore(userAcct,
      this.handleRsp(succCall, errCall));
  }

  public getParticipants(succCall, errCall) {
    this.contractInstance.getParticipants(this.handleRsp(succCall, errCall));
  }

  public joinToTournament(nick: string, acct: string, joinCost: number, succCall, errCall) {
    this.contractInstance.joinToTournament(nick, {from: acct, value: joinCost},
      this.handleRsp(succCall, errCall));
  }

  public makeBet(matchId: number, homeScore: number, awayScore: number,
    fromAcct: string, gasLimit: number, succCall, errCall) {
    this.contractInstance.makeBet(matchId, homeScore, awayScore,
      {from: fromAcct, gas: gasLimit},
      this.handleRsp(succCall, errCall)
    );
  }

  public nickAlreadyExist(nick: string, succCall, errCall) {
    this.contractInstance.nickAlreadyExist(nick, this.handleRsp(succCall, errCall));
  }

  public resolveMatch(matchId: number, homeScore: number, awayScore: number,
    transactionSpec: TransactionSpec, succCall, errCall) {
    this.contractInstance.resolveMatch(matchId, homeScore, awayScore, transactionSpec,
      this.handleRsp(succCall, errCall));
  }

  public resolveTournament(gasLimit: number, succCall, errCall) {
    this.contractInstance.resolveTournament({gas: gasLimit},
      this.handleRsp(succCall, errCall)
    );
  }

  public weiJoinCost(succCall, errCall) {
    this.contractInstance.weiJoinCost(this.handleRsp(succCall, errCall));
  }

  private handleRsp(succCall, errCall) {
    return (err, result) => {
      if (err) {
        errCall(err);
        return;
      }
      succCall(result);
    }
  }
}