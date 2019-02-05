import {TournamentContract} from "../contracts/tournament/tournamentcontract";
import {UserRanking} from "../../model/ranking/userranking";

export class RankingService {
  private tournamentContract: TournamentContract;

  constructor(tournamentContract: TournamentContract) {
    this.tournamentContract = tournamentContract;
  }

  public getUsersRankings(): UserRanking[] {
    let userRankings: UserRanking[] = [];
//    let participants: string[] = this.tournamentContract.getParticipants();
//    for (let i = 0; participants.length; i++) {
//      let userAddr: string = participants[i];
//      if (userAddr == null) {
//        break;
//      }
//      let nick: string = this.tournamentContract.getNick(userAddr);
//      let score: number = this.tournamentContract.getUserScore(userAddr);
//      userRankings.push({
//        nick: nick,
//        score: score
//      });
//    }
//
//    userRankings.sort(function (a: UserRanking, b: UserRanking) {
//      return b.score - a.score;
//    });

    return userRankings;
  }
}