import {ContractInstance} from "../contractinstance";
import {TransactionSpec} from "../transactionspec";

export interface TournamentContractInstance extends ContractInstance {
  addMatch(beginTime: number, awayTime: string, homeTeam: string, group: string,
    spec: any, handleCall);
  arbiter(handleCall);
  ended(handleCall);
  getBet(betId: number, handleCall);
  getBetForMatch(userAcct: string, matchId: number, handleCall);
  getJackpot(handleCall);
  getMatchesCnt(handleCall): number;
  getNick(userAcct: string, handleCall);
  getUserBetsIds(userAcct: string, handleCall);
  getUserScore(userAcct: string, handleCall);
  getParticipants(handleCall): string[];
  joinToTournament(nick: string, spec, handleCall);
  makeBet(matchId: number, homeScore: number, awayScore: number, spec: any, handleCall);
  matches(num: number, handleCall);
  nickAlreadyExist(nick, handleCall);
  resolveMatch(matchId: number, homeScore: number, awayScore: number, transactionSpec: TransactionSpec, handleCall);
  resolveTournament(spec: any, handleCall);
  weiJoinCost(handleCall);
}