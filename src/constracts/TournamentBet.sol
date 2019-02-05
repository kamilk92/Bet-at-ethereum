pragma solidity ^0.4.7;

contract TournamentBet{
    struct Match {
        uint id;
        uint beginMinute;
        uint beginHour;
        uint beginDayInMonth;
        uint beginMonth;
        uint beginYear;
        string awayTeam;
        string homeTeam;
        uint awayScore;
        uint homeScore;
        bool ended;
    }
    
    struct Bet{
        uint homeScore;
        uint awayScore;
        uint matchId;
        address owner;
    }
    
    address public arbiter;
    address[] participants;
    Match[] public matches;
    mapping(uint => Match) matchesMap;
    Bet[] public bets;
    uint idMatchSeq;
    uint joinDeadline;
    
    constructor(uint _joinDeadline) public {
        arbiter = msg.sender;
        idMatchSeq = 0;
        
        joinDeadline = _joinDeadline;
    }
    
    function addMatch(uint _beginMinute, uint _beginHour, uint _beginDayInMonth,
        uint _beginMonth, uint _beginYear,  string _awayTeam, 
        string _homeTeam) public returns(uint _id){
        
        require(
            msg.sender == arbiter,
            "Only arbiter can add match."
        );
        
        require(
            (_beginMinute >= 0) && (_beginMinute <= 60),
            "Begin match minute value must between 0 and 60"
        );
        
        require(
            (_beginHour >= 0) && (_beginHour <= 23),
            "Begin match hour value must be between 0 and 23"
        );
        
        require(
            (_beginDayInMonth >= 1) && (_beginDayInMonth <= 31),
            "Begin match day value must be between 1 and 31"
        );
        
        require(
            (_beginMonth >= 1) && (_beginMonth <= 12),
            "Begin match month must be between 1 and 12"
        );
        
        require(
            !isMatchExist(_beginDayInMonth, _beginMonth, _beginYear, _awayTeam,
                          _homeTeam),
            "This match already exist"
        );
        
        idMatchSeq += 1;
        _id = idMatchSeq;
        matches.push(Match({
            id: _id,
            beginMinute: _beginMinute,
            beginHour: _beginHour,
            beginDayInMonth: _beginDayInMonth,
            beginMonth: _beginMonth,
            beginYear: _beginYear,
            awayTeam: _awayTeam,
            homeTeam: _homeTeam,
            awayScore: 0,
            homeScore: 0,
            ended: false
        }));
        matchesMap[idMatchSeq] = matches[matches.length - 1];
    }
    
    function joinToTournament() public{
        require(
            joinDeadline > now,
            "Tournament is already closed."
        );
        
        require(
            !isAlreadyParticipnat(msg.sender),
            "User is already tournament participant"
        );
        
        participants.push(msg.sender);
    }
    
    function makeBet(uint matchId, uint homeScore, uint awayScore) public {
        require(
            homeScore >= 0,
            "Home score must be greater or equal 0."
        );
        require(
            awayScore >= 0,
            "Away score must be greater or equal 0."
        );
        require(
            matchesMap[matchId].id == matchId,
            "Match with given id doesnt exist."
        );
        require(
            isAlreadyParticipnat(msg.sender),
            "You aren't tournament participant."
        );
        
        (bool betExist, uint betIdx) = findBet(matchId, msg.sender);
        if (betExist){
            Bet storage _bet = bets[betIdx];
            _bet.homeScore = homeScore;
            _bet.awayScore = awayScore;
            
            return;
        }
        
        bets.push(Bet(homeScore, awayScore, matchId, msg.sender));
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
    
    function isMatchExist(uint _beginDayInMonth, uint _beginMonth, 
                          uint _beginYear, string _awayTeam, string _homeTeam
                          ) private view returns(bool _matchExist){
        _matchExist = false;
        for (uint i=0; i<matches.length; i++){
            Match storage _match = matches[i];
            if((_match.beginDayInMonth == _beginDayInMonth) &&
              (_match.beginMonth == _beginMonth) &&
              (_match.beginYear == _beginYear) &&
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
