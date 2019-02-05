import {Injectable} from '@angular/core';
import {ContractsService} from "../contracts/contracts.service";
import {LocalstorageService} from "../../services/localstorage/localstorage.service";
import {TournamentContract} from "../contracts/tournament/tournamentcontract";
import {CachedTournamentContract} from "./../contracts/tournament/cachedtournamentcontract";
import {ContractMeta} from "../contracts/contractmeta";

@Injectable()
export class TournamentService {
  private static readonly TOURNAMENT_CONTRACTS: ContractMeta[] = [
    {
      address: "0x7c20c1d504e11eb0513b97b2917aac12355bc9e3",
      abi: '[ { "constant": false, "inputs": [ { "name": "_beginTime", "type": "uint256" }, { "name": "_awayTeam", "type": "string" }, { "name": "_homeTeam", "type": "string" }, { "name": "group", "type": "string" } ], "name": "addMatch", "outputs": [ { "name": "_id", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "nick", "type": "string" } ], "name": "joinToTournament", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "matchId", "type": "uint256" }, { "name": "homeScore", "type": "uint256" }, { "name": "awayScore", "type": "uint256" } ], "name": "makeBet", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "matchId", "type": "uint256" }, { "name": "homeScore", "type": "uint256" }, { "name": "awayScore", "type": "uint256" } ], "name": "resolveMatch", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resolveTournament", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "name": "joinDeadline_", "type": "uint256" }, { "name": "weiJoinCost_", "type": "uint256" }, { "name": "totalMatchesCnt_", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": true, "inputs": [], "name": "arbiter", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "bets", "outputs": [ { "name": "id", "type": "uint256" }, { "name": "homeScore", "type": "uint256" }, { "name": "awayScore", "type": "uint256" }, { "name": "matchId", "type": "uint256" }, { "name": "owner", "type": "address" }, { "name": "score", "type": "uint256" }, { "name": "prize", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ended", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "betId", "type": "uint256" } ], "name": "getBet", "outputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "address" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" }, { "name": "matchId", "type": "uint256" } ], "name": "getBetForMatch", "outputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "address" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getJackpot", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getMatchesCnt", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "participant", "type": "address" } ], "name": "getNick", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getParticipants", "outputs": [ { "name": "", "type": "address[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" } ], "name": "getUserBetsIds", "outputs": [ { "name": "", "type": "uint256[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" } ], "name": "getUserScore", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinDeadline", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "matches", "outputs": [ { "name": "id", "type": "uint256" }, { "name": "beginTime", "type": "uint256" }, { "name": "awayTeam", "type": "string" }, { "name": "homeTeam", "type": "string" }, { "name": "group", "type": "string" }, { "name": "awayScore", "type": "uint256" }, { "name": "homeScore", "type": "uint256" }, { "name": "ended", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "nick", "type": "string" } ], "name": "nickAlreadyExist", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "participants", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "scores", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalMatchesCnt", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "weiJoinCost", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]',
      description: 'Ekstraklasa sezon 2018 / 2019.',
      id: 0,
      name: "Ekstraklasa 2018/2019"
    }
  ];

  private localStorageService: LocalstorageService;
  private contractService: ContractsService;
  private tournaments: TournamentContract[];
  private currentTournament: CachedTournamentContract;

  constructor(localStorageService: LocalstorageService, contractService: ContractsService) {
    this.localStorageService = localStorageService;
    this.contractService = contractService;
    this.initTournamentsList();
    this.initSelectedTournament();
  }

  public refreshTournamentst() {
    this.initTournamentsList();
  }

  public getTournaments(): TournamentContract[] {
    return this.tournaments;
  };

  public selectTournament(tournament: CachedTournamentContract) {
    this.localStorageService.setItem(LocalstorageService.SELECTED_TOURNAMENT_KEY,
      tournament);
    this.currentTournament = tournament;
  }

  public getCurrentTournament(): CachedTournamentContract {
    return this.currentTournament;
  }

  private initTournamentsList() {
    let tournaments: TournamentContract[] =
      this.localStorageService.getItem(LocalstorageService.ALL_TOURNAMENTS_KEY);
    if ((tournaments != null) && (tournaments.length > 0)) {
      this.tournaments = tournaments;

      return;
    }
    this.tournaments = [];

    for (let i = 0; i < TournamentService.TOURNAMENT_CONTRACTS.length; i++) {
      let singleTournament: ContractMeta = TournamentService.TOURNAMENT_CONTRACTS[i];
      let contractInterface: any = this.contractService.parseContract(
        singleTournament.abi);
      let contractInstance: any = contractInterface.at(singleTournament.address);
      this.tournaments[i] = new CachedTournamentContract(contractInstance,
        singleTournament.id, singleTournament.name, singleTournament.description);
    }
  }

  private initSelectedTournament() {
    this.currentTournament = this.localStorageService.getItem(
      LocalstorageService.SELECTED_TOURNAMENT_KEY);
  }

}
