import Web3 from "web3";

export const isMetamaskConnected = () => {
    return window.ethereum !== undefined && window.ethereum._metamask.isEnabled();
}

export const getAccount = async () => {
    return (await window.web3.eth.getAccounts())[0]
}

export const loadWeb3 = async() =>{
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
    }else if (window.web3){
        window.web3 = new Web3(window.web3.currentProvider)
    }else{
        window.alert("Non eth browser detected")
    }
}

export const getWeb3 = () => {
    let web3
    if (window.ethereum) {
        web3 = new Web3(window.ethereum)
        window.web3 = web3
        return web3
    } else if (window.web3){
        web3 = new Web3(window.ethereum.currentProvider)
        window.web3 = web3
        return web3
    }
};