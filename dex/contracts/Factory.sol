pragma solidity ^0.8.0;
import "./DEX.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Factory {

    mapping(address => address) pools;
    mapping(string => address[]) tickerPools;
    mapping(string => address) tickerAddress;

    event NewExchange(address token, address exchange);


    function createExchange(address token) public returns (address){
        require(token != address(0));
        require(pools[token] == address(0), "Pool is already initliazed");
        DEX dex = new DEX(token);
        pools[token]=address(dex);
        IERC20Metadata tokenMetadata = IERC20Metadata(token);
        tickerPools[tokenMetadata.symbol()].push(pools[token]);
        tickerAddress[tokenMetadata.symbol()] = token;
        emit NewExchange(token, address(dex));
        return address(dex);
    }


    function getExchange(address token) public view returns(address){
        require(pools[token]!=address(0),"No exchange for that token");
        return pools[token];
    }

    function getExchangesByTicker(string memory ticker) public view returns(address[] memory){
        return tickerPools[ticker];
    }

    function getTickerTokenAddress(string memory ticker) public view returns(address){
        return tickerAddress[ticker];
    }

}