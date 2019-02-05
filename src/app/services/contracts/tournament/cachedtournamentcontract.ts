import {TournamentContract} from "./tournamentcontract";
import {TournamentContractInstance} from "./tournamentcontractinstance";
import {MatchModel} from "../../../model/match/matchmodel";
import {BetModel} from "../../../model/bet/betmodel";
import {BigNumber} from "../../../model/adapter/bignumber";

export class CachedTournamentContract extends TournamentContract {
  private arbiter: string;
  private ended: boolean;
  private matches: {[key: number]: MatchModel};
  private matchcesBet: {[key: number]: BetModel};
  private bets: {[key: number]: BetModel;};
  private jackpot: number;
  private joinCost: number;
  private matchesCnt: number;
  private nicks: {[key: string]: string};
  private participants: string[];
  private userBetsIds: {[key: string]: number[];};
  private userScore: {[key: string]: number};


  constructor(contractInstance: TournamentContractInstance, id: number,
    name: string, description: string) {
    super(contractInstance, id, name, description);
    this.arbiter = null;
    this.ended = null;
    this.jackpot = null;
    this.joinCost = null;
    this.matches = null;
    this.matchcesBet = null;
    this.matchesCnt = null;
    this.participants = null;
    this.userBetsIds = null;
    this.userScore = null;
  }

  public isEnded(succCall, errCall) {
    if (this.ended != null) {
      succCall(this.ended);
      return;
    }
    let self: CachedTournamentContract = this;
    super.isEnded(
      this.wrapCachedCall(succCall,
        (result) => {
          self.ended = result;

          return result;
        }
      ),
      errCall
    );
  }

  public getArbiter(succCall, errCall) {
    if (this.arbiter != null) {
      succCall(this.arbiter);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getArbiter(
      this.wrapCachedCall(succCall, (result) => {
        self.arbiter = result;

        return result;
      }),
      errCall
    );

  }

  public getBet(betId: number, succCall, errCall) {
    if (this.bets == null) {
      this.bets = {};
    } else if (this.bets.hasOwnProperty(betId)) {
      succCall(this.bets);
      return;
    }

    let self: CachedTournamentContract = this;
    super.getBet(betId,
      this.wrapCachedCall(
        succCall,
        (betParams: any[]) => {
          let bet: BetModel = self.betParamsToBet(betParams);
          self.bets[betId] = bet;

          return bet;
        }
      ),
      errCall
    );
  }

  public getBetForMatch(userAcct: string, matchId: number, succCall, errCall) {
    if (this.matchcesBet == null) {
      this.matchcesBet = {};
    } else if (this.matchcesBet.hasOwnProperty(matchId)) {
      let bet = this.copyBetModel(this.matchcesBet[matchId]);
      succCall(bet);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getBetForMatch(userAcct, matchId,
      this.wrapCachedCall(succCall,
        (betParams: any[]) => {
          if ((betParams == null) || (betParams.length != 6) || (betParams[4] == 0)) {
            return null;
          }
          let bet = self.betParamsToBet(betParams);
          self.matchcesBet[matchId] = bet;

          return self.copyBetModel(bet);
        }),
      errCall);
  }

  public getJackpot(succCall, errCall) {
    if (this.jackpot != null) {
      succCall(this.jackpot);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getJackpot(
      this.wrapCachedCall(succCall, (result) => {
        self.jackpot = result;

        return result;
      }),
      errCall
    );
  }

  public getMatch(num: number, succCall, errCall) {
    if (this.matches == null) {
      this.matches = {};
    } else if (this.matches.hasOwnProperty(num)) {
      let match: MatchModel = this.copyMatchModel(this.matches[num]);
      succCall(match);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getMatch(
      num,
      this.wrapCachedCall(
        succCall,
        (matchParams: any[]) => {
          let matchModel: MatchModel = self.mapMatchParamsToMatchModel(matchParams);
          self.matches[num] = matchModel;

          return self.copyMatchModel(matchModel);
        }),
      errCall
    );
  }

  public getMatchesCnt(succCall, errCall) {
    if (this.matchesCnt != null) {
      succCall(this.matchesCnt);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getMatchesCnt(
      this.wrapCachedCall(succCall, (result) => {
        self.matchesCnt = result;

        return result;
      }),
      errCall
    );
  }

  public getNick(userAcct: string, succCall, errCall) {
    if (this.nicks == null) {
      this.nicks = {};
    } else if (this.nicks.hasOwnProperty(userAcct)) {
      succCall(this.nicks[userAcct]);
      return;
    }
    let self: CachedTournamentContract = this;
    super.getNick(
      userAcct,
      this.wrapCachedCall(succCall, (result) => {
        self.nicks[userAcct] = result;

        return result;
      }),
      errCall);
  }

  public getUserBetsIds(userAcct: string, succCall, errCall) {
    if (this.userBetsIds == null) {
      this.userBetsIds = {};
    } else if (this.userBetsIds.hasOwnProperty(userAcct)) {
      succCall(this.userBetsIds[userAcct]);
      return;
    }

    let self: CachedTournamentContract = this;

    super.getUserBetsIds(
      userAcct,
      this.wrapCachedCall(
        succCall,
        (betsIds: BigNumber[]) => {
          self.userBetsIds[userAcct] = self.convertToNumber(betsIds);

          return self.userBetsIds[userAcct];
        }),
      errCall
    );
  }

  public getUserScore(userAcct: string, succCall, errCall) {
    if (this.userScore == null) {
      this.userScore = {};
    } else if (this.userScore.hasOwnProperty(userAcct)) {
      succCall(this.userScore[userAcct]);
      return;
    }

    let self: CachedTournamentContract = this;
    super.getUserScore(userAcct,
      this.wrapCachedCall(succCall,
        (result) => {
          self.userScore[userAcct] = result;

          return result;
        }),
      errCall
    );
  }

  public getParticipants(succCall, errCall): string[] {
    if (this.participants != null) {
      succCall(this.participants);
      return;
    }

    let self: CachedTournamentContract = this;
    let cachedSuccCall = this.wrapCachedCall(
      succCall,
      (result) => {
        self.participants = result;

        return result;
      })

    super.getParticipants(cachedSuccCall, errCall);
  }

  public weiJoinCost(succCall, errCall) {
    let self: CachedTournamentContract = this;
    super.weiJoinCost(
      this.wrapCachedCall(
        succCall,
        (joinCost: BigNumber) => {
          self.joinCost = joinCost.toNumber();

          return self.joinCost;
        }),
      errCall);
  }

  public clearBets() {
    this.bets = null;
    this.userBetsIds = null;
  }

  public clearMatches() {
    this.matchesCnt = null;
    this.matches = null;
  }

  public clearUserScore() {
    this.userScore = {};
  }

  private betParamsToBet(betParams: any[]): BetModel {
    return {
      id: betParams[0].toNumber(),
      homeScore: betParams[1].toNumber(),
      awayScore: betParams[2].toNumber(),
      matchId: betParams[3].toNumber(),
      owner: betParams[4],
      points: betParams[5].toNumber()
    };
  }

  private copyBetModel(betModel: BetModel): BetModel {
    return {
      id: betModel.id,
      homeScore: betModel.homeScore,
      awayScore: betModel.awayScore,
      matchId: betModel.matchId,
      owner: betModel.owner,
      points: betModel.points
    };
  }

  private mapMatchParamsToMatchModel(matchParams: any[]): MatchModel {
    return {
      id: matchParams[0].toNumber(),
      beginTime: matchParams[1],
      beginDate: new Date(Number(matchParams[1])),
      guest: matchParams[2],
      host: matchParams[3],
      group: matchParams[4],
      guestScore: matchParams[5].toNumber(),
      hostScore: matchParams[6].toNumber(),
      ended: matchParams[7],
      points: 0
    };
  }

  private copyMatchModel(matchModel: MatchModel) {
    return {
      id: matchModel.id,
      beginTime: matchModel.beginTime,
      beginDate: matchModel.beginDate,
      guest: matchModel.guest,
      host: matchModel.host,
      group: matchModel.group,
      guestScore: matchModel.guestScore,
      hostScore: matchModel.hostScore,
      ended: matchModel.ended,
      points: 0
    };
  }

  private wrapCachedCall(succCall, storeInCacheCall) {
    return (result) => {
      let cached: any = storeInCacheCall(result);
      succCall(cached);
    }
  }

  private convertToNumber(bigNumbers: BigNumber[]) {
    let numbers: number[] = [];
    for (let i = 0; i < bigNumbers.length; i++) {
      numbers.push(bigNumbers[i].toNumber());
    }

    return numbers;
  }
}