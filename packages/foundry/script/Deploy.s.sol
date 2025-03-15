// SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { ScaffoldETHDeploy } from "./DeployHelpers.s.sol";
import { Factory } from "../contracts/Factory.sol";

contract Deploy is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        Factory factory = new Factory();
        console.log("Factory deployed to:", address(factory));
    }
}
