import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TournamentService} from "../../services/tournament/tournament.service";
import {AcctService} from "../../services/acct/acct.service";
import {RankingService} from "../../services/ranking/rankingservice";
import {ActionResult} from "../../model/result/actionresult";
import {TournamentContract} from "../../services/contracts/tournament/tournamentcontract";
import {CachedTournamentContract} from "../../services/contracts/tournament/cachedtournamentcontract";
import {JoinTournamentModel} from "../../model/contract/tournament/jointournamentmodel";
import {TournamentModel} from "../../model/contract/tournament/tournamentmodel";
import {MatchModel} from "../../model/match/matchmodel";
import {BetModel} from "../../model/bet/betmodel";
import {MatchResult} from "../../model/match/matchresult";
import {UserRanking} from "../../model/ranking/userranking";
import {BigNumber} from "../../model/adapter/bignumber";
import {MatchesHistory} from '../../model/history/matcheshistory';
import {MatchesHistoryStream} from '../../stream/matcheshistorystream';

@Component({
  selector: 'app-tournamentdetail',
  templateUrl: './tournamentdetail.component.html',
  styleUrls: ['./tournamentdetail.component.css']
})
export class TournamentdetailComponent implements OnInit, OnDestroy {
  public actionReadiness: {[key: string]: boolean} = {
    tournament: false,
    addBet: true,
    refreshRanking: true
  };
  public joinTournamentModel: JoinTournamentModel = {
    nick: ""
  };
  public addMatchModel: MatchModel = this.createEmpyMatchModel();
  public getMatchesResult: ActionResult = this.createEmptyResult();
  public addMatchResult: ActionResult = this.createEmptyResult();
  public addMatchBetResults: {[key: number]: ActionResult} = {};
  public getMatchesHistoryResult: ActionResult = this.createEmptyResult();
  public isParticipantResult: ActionResult = this.createEmptyResult();
  public matchModels: MatchModel[];
  public matchResults: {[key: number]: MatchResult};
  public matchBets: {[key: number]: BetModel;};
  public matchesHistory: MatchesHistory[];
  public participantsRankings: UserRanking[];
  public tournamentModel: TournamentModel;
  public userNick: string;

  private acctService: AcctService;
  private changeDetectorRef: ChangeDetectorRef;
  private matchesHistoryStream: MatchesHistoryStream;
  private modalService: NgbModal;
  private rankingService: RankingService;
  private tournament: CachedTournamentContract;
  private tournamentService: TournamentService;

  constructor(acctService: AcctService, tournamentService: TournamentService,
    modalService: NgbModal, changeDetectorRef: ChangeDetectorRef) {
    this.acctService = acctService;
    this.changeDetectorRef = changeDetectorRef;
    this.tournamentService = tournamentService;
    this.tournament = tournamentService.getCurrentTournament();
    this.rankingService = new RankingService(this.tournament);
    this.modalService = modalService;
    this.matchesHistoryStream = new MatchesHistoryStream(this.tournament);
  }

  ngOnInit() {
    this.fillTournamentDetails();
    setInterval(() => {
      if (!this.changeDetectorRef['destroyed']) {
        this.refreshView();
      }
    }, 500);
  }

  ngOnDestroy() {
    this.changeDetectorRef.detach();
  }

  private refreshView() {
    this.changeDetectorRef.detectChanges();
  }

  public joinToTournament() {
    this.isParticipantResult = this.createEmptyResult();
    this.tournament.nickAlreadyExist(this.joinTournamentModel.nick,
      this.wrapHandler(this.checkNickAndJoinIfDoesntExistSuccHandler, null),
      this.wrapHandler(this.checkNickAndJoinIfDoesntExistErrHandler, null)
    );
  }

  private checkNickAndJoinIfDoesntExistSuccHandler(self: TournamentdetailComponent, exist: boolean) {

    let nick: string = self.joinTournamentModel.nick;
    if (exist) {
      self.isParticipantResult.isError = true;
      self.isParticipantResult.errMsg = "Nick '" + nick + "' jest już zajęty.";
      return;
    }
    let acct: string = self.acctService.getCurrentAcct();
    self.tournament.joinToTournament(nick, acct, self.tournamentModel.joinCost,
      function (result) {
        self.callJoinToTournament(self, result);
      },
      self.wrapHandler(self.checkNickAndJoinIfDoesntExistErrHandler, self)
    );
  }

  private checkNickAndJoinIfDoesntExistErrHandler(
    self: TournamentdetailComponent, err) {

    console.log("Can't join to tournament. Exception:\n", err);
    self.isParticipantResult.isError = true;
    self.isParticipantResult.errMsg = "Nie można dołączyć do turnieju. Spróbuj ponownie później.";
  }

  private callJoinToTournament(self: TournamentdetailComponent, result) {
    self.isParticipantResult.isSuccess = true;
    self.isParticipantResult.succMsg = "Dołączono do turnieju. Zaloguj się ponownie aby zyskać dostęp do szczegółów turnieju.";
  }

  public addMatch() {
    this.addMatchResult = this.createEmptyResult();
    let beginTimeMilis: number = new Date(this.addMatchModel.beginTime).getTime();
    this.tournament.addMatch(beginTimeMilis, this.addMatchModel.guest,
      this.addMatchModel.host, this.addMatchModel.group,
      this.acctService.getCurrentAcct(), 1000000,
      this.wrapHandler(this.addMatchSuccHandler, null),
      this.wrapHandler(this.addMatchErrHandler, null)
    );
  }

  private addMatchSuccHandler(self: TournamentdetailComponent, result) {
    self.refreshMatches();
    self.addMatchResult.isSuccess = true;
    self.addMatchResult.succMsg = "Mecz został zapisany.";
    self.addMatchModel = self.createEmpyMatchModel();
  }

  private addMatchErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't add match. Exception:\n", err);
    self.addMatchResult.isError = true;
    self.addMatchResult.errMsg = "Nie udało się dodać meczu. Spróbuj ponownie później.";
  }

  public addBet(matchIdx: number) {
    this.actionReadiness["addBet"] = false;
    let matchModel: MatchModel = this.matchModels[matchIdx];
    let self: TournamentdetailComponent = this;
    this.tournament.makeBet(matchModel.id, matchModel.hostScore,
      matchModel.guestScore, this.acctService.getCurrentAcct(), 200000,
      function (result) {
        self.addBetSuccHandler(self, matchModel, result);
      },
      function (err) {
        self.addBetErrHandler(self, matchModel, err);
      }
    );
  }

  private addBetSuccHandler(self: TournamentdetailComponent, matchModel: MatchModel, result) {
//    self.refreshMatches();
    let addMatchResult: ActionResult = self.addMatchBetResults[matchModel.id];
    addMatchResult.isSuccess = true;
    addMatchResult.succMsg = "Twój typ został zapisany pomyślnie. Wynik zostanie zaaktualizowany wkrótce i widoczny po ponownym zalogowaniu.";
    self.actionReadiness["addBet"] = true;
  }

  private addBetErrHandler(self: TournamentdetailComponent, matchModel: MatchModel, err) {
    console.log("Can't save bet. Exception:\n", err);
    let result: ActionResult = self.addMatchBetResults[matchModel.id];
    result.isError = true;
    result.errMsg = "Operacja nie powiodła się. Spróbuj ponownie później.";
    self.actionReadiness["addBet"] = true;
  }

  public resolveMatch(matchIdx: number) {
    let matchModel: MatchModel = this.matchModels[matchIdx];
    this.addMatchBetResults[matchModel.id] = this.createEmptyResult();
    let resolveMatchResult = this.addMatchBetResults[matchModel.id];
    let self: TournamentdetailComponent = this;
    this.tournament.resolveMatch(matchModel.id, matchModel.hostScore, matchModel.guestScore,
      {
        fromAcct: null,
        gas: 500000
      },
      function (result) {
        self.resolveMatchSuccCall(self, resolveMatchResult, result);
      },
      function (err) {
        self.resolveMatchErrCall(self, resolveMatchResult, err);
      }
    );
  }

  private resolveMatchSuccCall(self: TournamentdetailComponent, resolveMatchResult: ActionResult,
    result) {

    resolveMatchResult.isSuccess = true;
    resolveMatchResult.succMsg = "Wynik meczu został zapisany.";
  }

  private resolveMatchErrCall(self: TournamentdetailComponent, resolveMatchResult: ActionResult,
    err) {

    console.log("Can't resolve match. Exception: \n", err);
    resolveMatchResult.isError = true;
    resolveMatchResult.errMsg = "Nie można rozstrzygnąć meczu. Spróbuj ponownie później.";
  }

  public refreshRanking() {
    this.actionReadiness["refreshRanking"] = false;
    this.tournament.clearUserScore();
    this.fillParticipantsRanking();
    this.actionReadiness["refreshRanking"] = true;
  }

  public openEndTournamentModal(tournamentEndModal) {
    this.modalService.open(tournamentEndModal, {}).result.then(
      (result) => {
        if (result == 'finish') {
          this.reslveTournament();
        }
      }, (reason) => {
        //close
      });
  }

  private reslveTournament() {
    this.getMatchesResult = this.createEmptyResult();
    this.tournament.resolveTournament(200000,
      this.wrapHandler(this.resolveTournamentSuccHandler, null),
      this.wrapHandler(this.resolveTournamentErrHandler, null)
    )
  }

  private resolveTournamentSuccHandler(self: TournamentdetailComponent, result) {
    self.getMatchesResult.isSuccess = true;
    self.getMatchesResult.succMsg = "Turniej został zakończony.";
  }

  private resolveTournamentErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't resolve tournament. Exception:\n", err);
    self.getMatchesResult.isError = true;
    self.getMatchesResult.errMsg = "Nie można zakończyć turnieju. Spróbuj ponownie później.";
  }

  private fillTournamentDetails() {
    if (this.tournament == null) {
      console.log("First select tournament.");
      return;
    }
    this.actionReadiness["tournament"] = false;

    this.tournamentModel = {
      ended: true,
      isArbiter: false,
      isParticipant: false,
      jackpot: null,
      matches: [],
      matchesCnt: 0,
      joinCost: null
    };

    this.fillJoinCost();
    this.fillEnded();
    this.fillJackpot();
    this.fillMatchesCnt();
    this.fillIsTournamentParticipant();
    this.fillIsArbiter();
    this.fillMatches();
    this.fillParticipantsRanking();
    this.fillMatchesHistory();
    this.actionReadiness["tournament"] = true;
  }

  private fillJoinCost() {
    this.tournamentModel.joinCost = 0;
    this.tournament.weiJoinCost(
      this.wrapHandler(this.weiJoinCostSuccHandler, null),
      this.wrapHandler(this.weiJoinCostErrHandler, null)
    );
  }

  private weiJoinCostSuccHandler(self: TournamentdetailComponent, joinCost: number) {
    self.tournamentModel.joinCost = joinCost;
  }

  private weiJoinCostErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch join cost. Exception:\n", err);
    self.isParticipantResult.isError = true;
    self.isParticipantResult.errMsg = "Nie udało się pobrać informacji o koszcie dołączenia do tuenieju." +
      "Spróbuj ponownie później";
  }

  private fillJackpot() {
    this.tournamentModel.jackpot = null;
    this.tournament.getJackpot(
      this.wrapHandler(this.fillJackpotSuccHandler, null),
      this.wrapHandler(this.fillJackpotErrHandler, null)
    );
  }

  private fillJackpotSuccHandler(self: TournamentdetailComponent, jackpot: BigNumber) {
    self.tournamentModel.jackpot = jackpot.toNumber();
  }

  private fillJackpotErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch jackpot. Exception:\n", err);
  }

  private fillEnded() {
    this.tournamentModel.ended = true;
    this.tournament.isEnded(
      this.wrapHandler(this.getTournamentEndedSuccHandler, null),
      this.wrapHandler(this.getTournamentEndedErrHandler, null)
    );
  }

  private getTournamentEndedSuccHandler(self: TournamentdetailComponent, isEnded: boolean) {
    self.tournamentModel.ended = isEnded;
  }

  private getTournamentEndedErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch is tournament end. Exception:\n", err);
  }

  private fillMatchesCnt() {
    this.tournament.getMatchesCnt(
      this.wrapHandler(this.getMatchesCntSuccHandler, null),
      this.wrapHandler(this.getMatchesCntErrHandler, null)
    );
  }

  private getMatchesCntSuccHandler(self: TournamentdetailComponent, matchesCnt: BigNumber) {
    self.tournamentModel.matchesCnt = matchesCnt.toNumber();
  }

  private getMatchesCntErrHandler(self: TournamentdetailComponent, err) {
    console.log("Cant't fetch tournament matches cnt. Exception:\n", err);
  }

  private fillIsArbiter() {
    this.tournamentModel.isArbiter = false;
    this.tournament.getArbiter(
      this.wrapHandler(this.isTournamentArbiterSuccHandler, null),
      this.wrapHandler(this.isTournamentArbiterErrHandler, null)
    );
  }

  private isTournamentArbiterSuccHandler(self: TournamentdetailComponent, arbiter: string) {
    let userAddr = self.acctService.getCurrentAcct();
    self.tournamentModel.isArbiter = (arbiter == userAddr);
    self.changeDetectorRef.markForCheck();
  }

  private isTournamentArbiterErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch tournament arbiter. Exception:\n", err);
  }

  private fillMatches() {
    this.tournamentModel.matches = [];
    this.matchModels = [];
    this.matchResults = {};
    this.addMatchBetResults = {};
    this.matchBets = {};

    this.tournament.getMatchesCnt(
      this.wrapHandler(this.getMatchesIdsSuccHandler, null),
      this.wrapHandler(this.getMatchesIdsErrHandler, null)
    );

  }

  private getMatchesIdsSuccHandler(self: TournamentdetailComponent, matchesCnt) {
    for (let i = 0; i < matchesCnt; i++) {
      self.tournament.getMatch(i,
        self.wrapHandler(self.getMatchSuccHandler, null),
        self.wrapHandler(self.getMatchErrHandler, null)
      );
    }
  }

  private getMatchesIdsErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch matches cnt. Exception:\n", err);
    self.getMatchesResult.isError = true;
    self.getMatchesResult.errMsg = "Nie udało się pobrać infomracji o liczbie meczy. Spróbuj pownie później";
  }

  private getMatchSuccHandler(self: TournamentdetailComponent, match: MatchModel) {
    self.tournamentModel.matches.push(match);
    self.setMatchResult(self, match);
    self.tournament.getBetForMatch(self.acctService.getCurrentAcct(), match.id,
      function (bet: BetModel) {
        self.getUserBetSuccHandler(self, bet, match);
      },
      self.wrapHandler(self.getUserBetErrHandler, self)
    );
  }

  private getMatchErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch match info. Exception:\n", err);
    self.getMatchesResult.isError = true;
    self.getMatchesResult.errMsg = "Nie udało się pobrać informacji o meczu. Spróbuj pownie później";
  }


  private initMatchModel(self: TournamentdetailComponent, singleMatch: MatchModel) {
    let now = new Date().getTime();

    self.matchModels[singleMatch.id] = {
      beginDate: new Date(Number(singleMatch.beginTime)),
      beginTime: singleMatch.beginTime,
      ended: singleMatch.ended || (now > singleMatch.beginTime),
      group: singleMatch.group,
      guest: singleMatch.guest,
      guestScore: singleMatch.guestScore,
      host: singleMatch.host,
      hostScore: singleMatch.hostScore,
      id: singleMatch.id,
      points: singleMatch.points
    };

    self.addMatchBetResults[singleMatch["id"]] = self.createEmptyResult();
//    self.matchModels.sort(function (a: MatchModel, b: MatchModel) {
//      return a.beginDate.getTime() - b.beginDate.getTime();
//    });
  }

  private getUserBetSuccHandler(self: TournamentdetailComponent, bet: BetModel,
    matchModel: MatchModel) {

    if (bet == null) {
      bet = {
        homeScore: null,
        awayScore: null,
        points: 0,
        matchId: null,
        id: null,
        owner: null
      }
    }
    self.matchBets[bet.matchId] = bet;
    self.fillBetForMatch(self, matchModel);
    matchModel.hostScore = bet.homeScore;
    matchModel.guestScore = bet.awayScore;

    self.initMatchModel(self, matchModel);
  }

  private fillBetForMatch(self: TournamentdetailComponent, match: MatchModel) {
    let homeScore: number = null;
    let awayScore: number = null;
    let points: number = null;
    if (self.matchBets.hasOwnProperty(match.id)) {
      homeScore = self.matchBets[match.id].homeScore;
      awayScore = self.matchBets[match.id].awayScore;
      points = self.matchBets[match.id].points;
    }
    match.hostScore = homeScore;
    match.guestScore = awayScore;
    match.points = points;

    if (!match.ended) {
      return;
    }

    let matchResult: MatchResult = self.matchResults[match.id];
    matchResult.hitClass = "fail";
    if ((match.hostScore == matchResult.hostScore) &&
      (match.guestScore == matchResult.guestScore)) {
      matchResult.hitClass = "success";
    }
  }

  private getUserBetErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch user bet. Exception:\n", err);
    this.getMatchesResult.isError = true;
    this.getMatchesResult.errMsg = "Nie udało się pobrać listy meczy. Spróbuj ponownie później";
  }

  private fillParticipantsRanking() {
    this.participantsRankings = [];
    this.tournament.getParticipants(
      this.wrapHandler(this.getRankingParticipantsSuccHandler, null),
      this.wrapHandler(this.getRankingParticipantsErrHandler, null)
    );
  }

  private getRankingParticipantsErrHandler(err) {
    console.log("Can't fetch ranking participants. Exception:\n", err);
  }

  private getRankingParticipantsSuccHandler(self: TournamentdetailComponent, participants: string[]) {
    for (let i = 0; participants.length; i++) {
      let userAddr: string = participants[i];
      if (userAddr == null) {
        break;
      }
      self.tournament.getNick(userAddr,
        function (result) {
          self.getRankingParticipantNickSuccHandler(self, userAddr, result);
        },
        function (err) {
          console.log("Can't fetch user ranking score. Exception:\n", err);
        }
      );
    }
  }

  private getRankingParticipantNickSuccHandler(self: TournamentdetailComponent, userAddr: string,
    nick: string) {

    self.tournament.getUserScore(userAddr,
      function (result) {
        self.getRankingParticipantScoreSuccHandler(self, nick, result);
      },
      function (err) {
        console.log("Can't fetch user '", nick, "' with addr '", userAddr, ", score. Exception:\n", err);
      });
  }

  private getRankingParticipantScoreSuccHandler(self: TournamentdetailComponent, nick: string, score: BigNumber) {
    self.participantsRankings.push({
      nick: nick,
      score: score.toNumber()
    });
    this.participantsRankings.sort(function (a: UserRanking, b: UserRanking) {
      return b.score - a.score;
    })
  }

  private fillUserNick() {
    this.userNick = null;
    let currentAcct: string = this.acctService.getCurrentAcct();
    let self: TournamentdetailComponent = this;
    this.tournament.getNick(currentAcct,
      function (result) {
        self.userNick = result;
      }, function (err) {
        console.log("Can't fetch user nick. Excetpion: \n", err);
      }
    );
  }

  private setMatchResult(self: TournamentdetailComponent, matchModel: MatchModel) {
    let result: MatchResult = {
      guestScore: null,
      hitClass: null,
      hostScore: null
    };
    if (matchModel.ended) {
      result.guestScore = matchModel.guestScore;
      result.hitClass = null;
      result.hostScore = matchModel.hostScore;
    }

    self.matchResults[matchModel.id] = result;
  }

  private fillIsTournamentParticipant() {
    this.tournament.getParticipants(
      this.wrapHandler(this.getIsTournamentParticipantSuccHandler, null),
      this.wrapHandler(this.getIsTournamentParticipantsErrHandler, null)
    );
  }

  private getIsTournamentParticipantSuccHandler(self: TournamentdetailComponent,
    participants: string[]) {
    let userAddr: string = self.acctService.getCurrentAcct();
    self.tournamentModel.isParticipant =
      ((participants != null) && (participants.indexOf(userAddr) > -1));
  }

  private getIsTournamentParticipantsErrHandler(self: TournamentdetailComponent, err) {
    console.log("Can't fetch tournament participants. Exception: ", err);
  }

  private fillMatchesHistory() {
    this.matchesHistory = [];
    this.getMatchesHistoryResult = this.createEmptyResult();
    let self: TournamentdetailComponent = this;
    this.matchesHistoryStream.getMatchesHistoryStream(
      function (match: MatchModel, bet: BetModel, nick: string) {
        self.getMatchesHistorySuccHandler(self, match, bet, nick);
      },
      function (err) {
        self.getMatchesHistoryErrHandler(self, err);
      }
    );
  }

  private getMatchesHistorySuccHandler(self: TournamentdetailComponent, match: MatchModel,
    bet: BetModel, nick: string) {

    self.matchesHistory.push({
      match: match,
      bet: bet,
      nick: nick
    });

    self.matchesHistory.sort(function (a: MatchesHistory, b: MatchesHistory) {
      return a.match.beginTime - b.match.beginTime;
    });
  }

  private getMatchesHistoryErrHandler(self: TournamentdetailComponent, err) {
    console.log("Cant' fetch matches history. Exception:\n", err);
    self.getMatchesHistoryResult.isError = true;
    self.getMatchesHistoryResult.errMsg = "Nie udało się pobrać historii typowań graczy. Spróbuj ponownie później.";
  }

  private refreshMatches() {
    this.tournament.clearMatches();
    this.tournament.clearBets();
    this.fillMatches();
  }

  private createEmptyResult(): ActionResult {
    return {
      isError: false,
      isSuccess: false,
      errMsg: "",
      succMsg: ""
    };
  }

  private createEmpyMatchModel(): MatchModel {
    return {
      beginDate: null,
      beginTime: null,
      ended: false,
      group: "",
      guest: "",
      guestScore: 0,
      host: "",
      hostScore: 0,
      id: -1,
      points: 0
    };
  }

  private wrapHandler(handlerFunc, self: TournamentdetailComponent) {
    if (self == null) {
      self = this;
    }

    return function (result) {
      handlerFunc(self, result);
    }
  }

}
