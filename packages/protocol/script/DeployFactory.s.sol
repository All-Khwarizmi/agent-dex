// SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { ScaffoldETHDeploy } from "./DeployHelpers.s.sol";
import { Factory } from "../contracts/Factory.sol";

contract DeployFactory is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address factory = deployFactory();
        console.log("Factory deployed to:", address(factory));
    }

    function deployFactory() public returns (address) {
        vm.startBroadcast();
        Factory factory = new Factory();
        vm.stopBroadcast();
        console.log("Factory deployed to:", address(factory));
        return address(factory);
    }
}
