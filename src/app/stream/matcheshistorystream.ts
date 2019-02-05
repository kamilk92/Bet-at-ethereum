import {CachedTournamentContract} from "../services/contracts/tournament/cachedtournamentcontract";
import {MatchModel} from "../model/match/matchmodel";
import {BetModel} from "../model/bet/betmodel";

export class MatchesHistoryStream {

  constructor(private tournament: CachedTournamentContract) {
  }

  public getMatchesHistoryStream(succHandler, errHandler) {
    let self: MatchesHistoryStream = this;
    this.tournament.getMatchesCnt(
      function (matchesCnt) {
        self.getMatchesCntSuccHandler(self, matchesCnt, succHandler, errHandler);
      },
      errHandler
    );
  }

  private getMatchesCntSuccHandler(self: MatchesHistoryStream, matchesCnt: number, succHandler, errHandler) {
    for (let i = 0; i < matchesCnt; i++) {
      self.tournament.getMatch(i,
        function (match: MatchModel) {
          self.getMatchSuccHandler(self, match, succHandler, errHandler);
        },
        errHandler
      );
    }
  }

  private getMatchSuccHandler(self: MatchesHistoryStream, match: MatchModel, succHandler, errHandler) {
    self.tournament.getParticipants(
      function (participants: string[]) {
        self.getParticipantsSuccHandler(self, match, participants, succHandler, errHandler);
      },
      errHandler
    );
  }

  private getParticipantsSuccHandler(self: MatchesHistoryStream, match: MatchModel,
    participants: string[], succHandler, errHandler) {

    for (let i = 0; i < participants.length; i++) {
      self.tournament.getNick(participants[i],
        function (nick) {
          self.getNickSuccHandler(self, match, participants[i], nick, succHandler, errHandler);
        },
        errHandler);
    }
  }

  private getNickSuccHandler(self: MatchesHistoryStream, match: MatchModel,
    participantAddr: string, nick: string, succHandler, errHandler) {
    let now: number = new Date().getTime();
    if ((!match.ended) && (match.beginTime > now)) {
      succHandler(match,
        self.createEmptyBet(match.id, participantAddr),
        nick);
      return;
    }
    self.tournament.getBetForMatch(participantAddr, match.id,
      function (bet: BetModel) {
        self.getBetForMatchSuccHandler(self, match, participantAddr, bet, nick, succHandler);
      },
      errHandler
    );
  }

  private getBetForMatchSuccHandler(self: MatchesHistoryStream, match: MatchModel,
    participantAddr: string, bet: BetModel, nick, succHandler) {

    if (bet == null) {
      bet = self.createEmptyBet(match.id, participantAddr);
    }

    succHandler(match, bet, nick);
  }

  private createEmptyBet(matchId: number, participantAddr: string): BetModel {
    return {
      id: null,
      homeScore: null,
      awayScore: null,
      matchId: matchId,
      owner: participantAddr,
      points: 0
    }
  }
}