import {MatchModel} from "../../match/matchmodel";

export interface TournamentModel {
  ended: boolean;
  isArbiter: boolean;
  isParticipant: boolean;
  jackpot: number;
  joinCost: number,
  matchesCnt: number;
  matches: MatchModel[]
}