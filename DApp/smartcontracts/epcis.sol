pragma solidity >=0.4.22 <0.7.0;

contract EPCIS {
    struct Data {
        string eventType;
        string eventTime;
        uint256 GTIN;
        uint256 GLN;
        string why;
    }
    
    Data epcisData;
    
    funtion setEventType(string memory d) public{
        epcisData.eventType = d;
    }
    
    funtion setEventTime(string memory d) public{
        epcisData.eventTime = d;
    }
    funtion setWhat(uint256 d) public{
        epcisData.GTIN = d;
    }
    funtion setWhere(uint256 d) public{
        epcisData.GLN = d;
    }
    
    funtion setWhy(string memory d) public{
        epcisData.why = d;
    }
    
    function getEventType() public view returns (string memory){
        return epcisData.eventType;
    }
    
    function getEventTime() public view returns (string memory){
        return epcisData.eventTime;
    }
    
    function getWhat() public view returns (uint256){
        return epcisData.GTIN;
    }
    
    function getWhere() public view returns (uint256){
        return epcisData.GLN;
    }
    
    function getWhy() public view returns (string memory){
        return epcisData.why;
    }
}
