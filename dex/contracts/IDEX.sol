pragma solidity ^0.8.0;

interface IDEX {
  function init(uint256 tokens) external payable returns(uint256);

  function price(uint256 input_amount, uint256 input_reserve, uint256 output_reserve) external view returns (uint256);

  function ethToToken() external payable returns (uint256);

  function tokenToEth(uint256 tokens) external returns (uint256);

  function deposit() external payable returns (uint256);

  function withdraw(uint256 amount) external returns (uint256, uint256);
}
