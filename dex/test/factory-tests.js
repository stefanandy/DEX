const Factory = artifacts.require('Factory.sol')
const USDT = artifacts.require("USDT.sol")
const DEX = artifacts.require("DEX.sol")

contract("Factory", async (accounts)=>{
   it("Deploy smart contracts", async ()=>{
       const factory = await Factory.deployed();
       console.log(factory.addres)
       assert(factory.address !== "")

       const usdt = await USDT.deployed();

       let name = await usdt.name();
       console.log(name)
       assert(name === "Tether")

       let symbol = await usdt.symbol()
       console.log(symbol)
       assert(symbol === "USDT")
   })

   it("Create a DEX for usdt and put liquidity", async ()=>{
       const factory =await Factory.deployed();
       const usdt = await USDT.deployed();

       await factory.createExchange(usdt.address)

       let dexAddress = await factory.getExchange(usdt.address);

       console.log("This is the address: "+dexAddress);

       await usdt.approve(dexAddress,3000);
       
    })
});