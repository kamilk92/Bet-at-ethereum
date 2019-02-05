import {MatchModel} from "../match/matchmodel";
import {BetModel} from "../bet/betmodel";

export interface MatchesHistory {
  bet: BetModel;
  match: MatchModel;
  nick: string;
}