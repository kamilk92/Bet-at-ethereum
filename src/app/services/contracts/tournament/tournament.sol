pragma solidity ^0.4.7;

contract TournamentBet{
    
    struct Bet{
        uint id;
        uint homeScore;
        uint awayScore;
        uint matchId;
        address owner;        
        uint score;
        uint prize; 
    }
    
    struct Match {
        uint id;
        uint beginTime;
        string awayTeam;
        string homeTeam;
        string group;
        uint awayScore;
        uint homeScore;
        bool ended;
    }
    
    address public arbiter;
    address[] public participants;
    Bet[] public bets;
    bool public ended;
    Match[] public matches;
    uint public joinDeadline;
    uint public weiJoinCost;
    uint public totalMatchesCnt;
    mapping(address => uint) public scores;
    mapping(address => string) nicksMap;
    uint maxScore;
    
    constructor(uint joinDeadline_, uint weiJoinCost_, uint totalMatchesCnt_) public{
        arbiter = msg.sender;
        joinDeadline = joinDeadline_;
        weiJoinCost = weiJoinCost_;
        totalMatchesCnt = totalMatchesCnt_;
    }
    
    function addMatch(uint _beginTime, string _awayTeam, string _homeTeam, 
                      string group) public returns(uint _id){
        
        require(
            msg.sender == arbiter,
            "Only arbiter can add match."
        );
        
        require(
            now < _beginTime,
            "Match begin time must be date in future"
        );
        
        require(
            !isMatchExist(_beginTime, _awayTeam, _homeTeam),
            "This match already exist"
        );
        
        _id = matches.length;
        matches.push(Match({
            id: _id,
            beginTime: _beginTime,
            awayTeam: _awayTeam,
            homeTeam: _homeTeam,
            group: group,
            awayScore: 0,
            homeScore: 0,
            ended: false
        }));
    }
    
    function joinToTournament(string nick) public payable{
        require(
            !ended,
            "Tournament already ended."
        );
        
        require(
            joinDeadline > now,
            "Tournament is already closed."
        );
        
        require(
            !isAlreadyParticipnat(msg.sender),
            "User is already tournament participant"
        );
        
        require(
            bytes(nick).length > 0,
            "Empty nick."
        );
        
        require(
            !nickAlreadyExist(nick),
            "Nick is already reserved."
        );
        
        require(
            msg.value >= weiJoinCost,
            "You don't have enough funds"
        );
        
        participants.push(msg.sender);
        nicksMap[msg.sender] = nick;
    }
    
    function makeBet(uint matchId, uint homeScore, uint awayScore) public {
        require(
            (homeScore >= 0) && (awayScore >= 0),
            "Scores must be greater or equal 0."
        );
        require(
            awayScore >= 0,
            "Away score must be greater or equal 0."
        );
        require(
            matches[matchId].id == matchId,
            "Match with given id doesnt exist."
        );
        require(
            isAlreadyParticipnat(msg.sender),
            "You aren't tournament participant."
        );
        require(
            matches[matchId].beginTime > now,
            "Match already began."
        );
        require(
            matches[matchId].ended == false,
            "Match ended."
        );
        
        (bool betExist, uint betIdx) = findBet(matchId, msg.sender);
        if (betExist){
            Bet storage _bet = bets[betIdx];
            _bet.homeScore = homeScore;
            _bet.awayScore = awayScore;
            
            return;
        }
        
        bets.push(Bet(bets.length, homeScore, awayScore, matchId, msg.sender, 0, 0));
    }
    
    function getUserBetsIds(address userAddr) public view returns(uint[]){
        uint userBetsCnt = countUserBets(userAddr); 
        uint[] memory userBetsIds = new uint[](userBetsCnt);
        uint idx = 0;
        for (uint i=0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if((bet.owner == userAddr) && 
               ((msg.sender == userAddr) || (msg.sender == arbiter))){
                userBetsIds[idx++] = bet.id;
            }
        }
        
        return userBetsIds;
    }
    
    function getBet(uint betId) public view returns(uint, uint, uint, uint, address, uint){
        for(uint i = 0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if(bet.id != betId){
                continue;
            }
            require(
                (bet.owner == msg.sender) || (msg.sender == arbiter),
                "Bet stus can get get only his owner or tournament arbiter."
            );
            
            return (bet.id, bet.homeScore, bet.awayScore, bet.matchId, bet.owner, bet.score);
        }
        
        return;
    }
    
    function getParticipants() public view returns(address[]){
        return participants;
    }
    
    function getNick(address participant) public view returns(string){
        return nicksMap[participant];
    }
    
    function getMatchesCnt() public view returns(uint){
        return matches.length;
    }
    
    function resolveMatch(uint matchId, uint homeScore, uint awayScore) public{
        Match storage _match = matches[matchId];
        require(
            !_match.ended,
            "Match already resolved."
        );
    
        _match.homeScore = homeScore;
        _match.awayScore = awayScore;
        _match.ended = true;
        
        resolveBets(_match);
    }
    
    function getUserScore(address userAddr) public view returns(uint){
        uint score = 0;
        for (uint i = 0; i < bets.length; i++){
            Bet storage bet_ = bets[i];
            if (bet_.owner != userAddr){
                continue;
            }
            score += bet_.score;
        }
        
        return score;
    }
    
    function getJackpot() public view returns(uint){
        return address(this).balance;
    }
    
    function resolveTournament() public {
        require(
            msg.sender == arbiter,
            "Only arbiter can resolve tournament."
        );
        
        uint winnersCnt = countWinners();
        uint prize = address(this).balance / winnersCnt;
        for (uint i = 0; i < participants.length; i++){
            if (scores[participants[i]] == maxScore){
                participants[i].transfer(prize);
            }
        }
        
        ended = true;
    }
    
    function countWinners() private view returns(uint){
        uint winnersCnt = 0;
        for(uint i = 0; i < participants.length; i++){
            uint participantScore = scores[participants[i]];
            if (participantScore == maxScore){
                winnersCnt++;
            }
        }
        
        return winnersCnt;
    }
    
    function resolveBets(Match _match) private{
        require(
            msg.sender == arbiter,
            "Only arbiter can resolve match."
        );
        uint hits = countBetHits(_match);
        if (hits < 1){
            return;
        }
        payPrize(_match, hits);
        uint score = participants.length - hits + 1;
        addScore(_match, score);
    }
    
    function countBetHits(Match _match) private view returns (uint){
        uint hits = 0;
        for (uint i = 0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if(bet.matchId != _match.id){
                continue;
            }
            if((bet.homeScore == _match.homeScore) && (bet.awayScore == _match.awayScore)){
                hits++;
            }
        }
        
        return hits;
    }
    
    function payPrize(Match _match, uint hits) private{
        uint singleBetWin = calculateSingleBetWin(hits);
        for (uint i = 0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if(bet.matchId != _match.id){
                continue;
            }
            if((bet.homeScore == _match.homeScore) && (bet.awayScore == _match.awayScore)){
                bet.owner.transfer(singleBetWin);
                bet.prize = singleBetWin;
            }
        }
    }
    
    function calculateSingleBetWin(uint hits) private view returns(uint){
        uint betForMatch = address(this).balance / totalMatchesCnt;
        
        return betForMatch / hits;
    }
    
    function addScore(Match _match, uint matchScore) private {
        for(uint i = 0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if(bet.matchId != _match.id){
                continue;
            }
            if((bet.homeScore == _match.homeScore) && (bet.awayScore == _match.awayScore)){
                bet.score = matchScore;
                scores[bet.owner] += bet.score;
            }
            if (scores[bet.owner] > maxScore){
                maxScore = scores[bet.owner];
            } 
        }
    }
    
    function countUserBets(address userAddr) private view returns(uint){
        uint matchCnt = 0;
        for (uint i=0; i < bets.length; i++){
            Bet storage bet = bets[i];
            if((bet.owner == userAddr) && 
               ((msg.sender == userAddr) || (msg.sender == arbiter))){
                matchCnt++;
            }
        }
        
        return matchCnt;
    }
    
    function isAlreadyParticipnat(address _candidate) private view returns(
        bool _isParticipant){
        _isParticipant = false;
        for (uint i = 0; i < participants.length; i++){
            if (participants[i] == _candidate){
                _isParticipant = true;
                break;
            }
        }
    }
    
    function isMatchExist(uint beginTime, string _awayTeam, string _homeTeam) 
                          private view returns(bool _matchExist){
        _matchExist = false;
        for (uint i=0; i<matches.length; i++){
            Match storage _match = matches[i];
            if(_match.beginTime == beginTime &&
              (compareStrings(_match.homeTeam, _homeTeam)) &&
              (compareStrings(_match.awayTeam, _awayTeam))){
                _matchExist = true;
                break;
            }
        }
    }
    
    function findBet(uint matchId, address owner) private view returns(
        bool, uint){
        for (uint i = 0; i < bets.length; i++){
            Bet storage _bet = bets[i];
            if ((_bet.owner == owner) && (_bet.matchId == matchId)){
                return (true, i);
            }
        }
        
        return (false, bets.length);
    }
    
        
    function nickAlreadyExist(string nick) public view returns (bool){
        for(uint i = 0; i < participants.length; i++){
            string storage participantNick = nicksMap[participants[i]];
            if (compareStrings(participantNick, nick)){
                return true;
            }
        }
        
        return false;
    }
    
    function compareStrings(string str1, string str2) private view returns(bool){
        bytes memory bytesStr1 = bytes(str1);
        bytes memory bytesStr2 = bytes(str2);
        
        if (bytesStr1.length != bytesStr2.length){
            return false;
        } 
        
        for (uint i=0; i<bytesStr1.length; i++){
            if (bytesStr1[i] != bytesStr2[i]){
                return false;
            } 
        }
        
        return true;
    }

}