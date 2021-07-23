pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";


contract USDT is ERC20PresetMinterPauser {

    constructor() ERC20PresetMinterPauser("Tether", "USDT"){
        _mint(msg.sender, 100000000000000000000000000);
    }

}