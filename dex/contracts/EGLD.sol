pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";


contract EGLD is ERC20PresetMinterPauser {

    constructor() ERC20PresetMinterPauser("E-GOLD", "EGLD"){
        _mint(msg.sender, 20000000000000000000000000);
    }

}