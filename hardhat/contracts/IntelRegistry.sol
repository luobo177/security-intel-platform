// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IntelRegistry {
    address public owner;

    struct Intel {
        address sender;
        uint256 timestamp;
    }

    constructor(){
        owner = msg.sender;
        roles[msg.sender] = 1;
    }
    modifier onlyOwner(){
        require(msg.sender == owner,"not owner");
        _;
    }

    mapping(string => Intel) public intels;
    mapping(address => uint256)public banTime;
    mapping(address=>uint8)public roles;


//角色权限设置，0为未注册，1为管理员，2为普通成员
    function setRole(address user,uint8 role)public onlyOwner{
        require(user!=address(0),"invalid address");
        roles[user]=role;
    }

    function banUser(address user)public onlyOwner {
        require(user != address(0), "invalid address");
        require(user!=owner,"cannot ban owner");
        banTime[user] = block.timestamp;
    }
    function unbanUser(address user) public onlyOwner{
        require(user != address(0), "invalid address");
        require(banTime[user]!=0,"user not banned");
        banTime[user]=0;
    }

    function getUserStatus(address user) public view returns (uint8, uint256) {
        return (roles[user], banTime[user]);
    }


//提交函数
    function submitIntel(string memory _hash) public {
        //判断提交者是否为注册用户
        require(roles[msg.sender]!=0,"not registered");
        //检查参数是否是正常的
        require(bytes(_hash).length > 0, "empty hash");
        //检查链上是否已经有这条记录
        require(intels[_hash].timestamp == 0, "hash already exists");
        //检查发送者是否已经被封禁
        require(banTime[msg.sender]==0,"you are banned");

        intels[_hash] = Intel(
            msg.sender,
            block.timestamp
        );
    }

//检测函数，只检测这条记录是否合法有效，输入参数为hash
    function verifyIntel(string memory _hash) public view returns (bool) {
        Intel memory i = intels[_hash];
        if(i.timestamp==0){
            return false;
        }
        uint256 bannedAt = banTime[i.sender];
        if(bannedAt==0){
            return true;
        }
        if (i.timestamp<bannedAt){
            return true;
        }
        return false;
    }

//查询函数，输入参数为hash，输出结果为创建者，创建时间，记录状态（是否有效）
    function getIntel(string memory _hash) public view returns (
        address,
        uint256,
        bool
    ) {
        Intel memory i = intels[_hash];
        bool status = verifyIntel(_hash);
        return (i.sender, i.timestamp,status);
    }
}