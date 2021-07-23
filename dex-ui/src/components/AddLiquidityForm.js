import * as React from "react";
import {Button, Form} from "react-bootstrap";
import erc20 from "../contracts/USDT";
import dex from "../contracts/DEX"
import constants from "../constants";

class AddLiquidityForm extends React.Component{

    tokenSC=new this.props.web3.eth.Contract(erc20.abi);
    dex  = new this.props.web3.eth.Contract(dex.abi);

    async handleChange(event){
        let token = event.target.value;
        if(token==='ETH'){
            this.setState({exchangeAddress:''});
            let balance = await this.props.web3.eth.getBalance(this.props.account).then((r)=>{
                return r;
            });
            let balanceBN = this.props.web3.utils.fromWei(balance.toString(), 'ether');
            this.setState({tokenBalance: balanceBN})
        } else if(token.toString().length > 3){
            let exchanges = await this.props.factory.methods.getExchangesByTicker(token).call({from:this.props.account});
            if(exchanges.length === 0){
                this.setState({exchangeAddress:'No exchange found'})
            }else{
                let tokenAddress = await this.props.factory.methods.getTickerTokenAddress(token).call({from:this.props.account});
                this.setState({exchangeAddress: exchanges, tokenAddress:tokenAddress});
                this.dex = new this.props.web3.eth.Contract(dex.abi, exchanges[0]);
                this.tokenSC = new this.props.web3.eth.Contract(erc20.abi, tokenAddress);
                let balanceInWei = await this.tokenSC.methods.balanceOf(this.props.account).call();
                let balance = this.props.web3.utils.fromWei(balanceInWei.toString(),'ether');
                this.setState({tokenBalance: balance, tokenToDepositOriginal:balanceInWei});
            }
        }
    }

    async handleChangeAmount(event){
        let amount = event.target.value;
        let amountWei = this.props.web3.utils.toWei(amount.toString(),'ether');
        let tokenToDeposit = await this.dex.methods.depositTokenCalculator(amountWei).call();
        let tokenToDepositBN = this.props.web3.utils.fromWei(tokenToDeposit.toString(), 'ether');
        this.setState({etherAmount:amountWei, tokenToDeposit:tokenToDepositBN.toString()})

    }

    renderTokenToDeposit(){
        if(this.state.tokenToDeposit!== ''){
            return "    Token to deposit: "+ this.state.tokenToDeposit
        }
    }

    async addLiquidity(){
        await this.tokenSC.methods.approve(this.state.exchangeAddress[0], this.state.tokenToDepositOriginal).send({from:this.props.account});
        await this.dex.methods.deposit().send({from:this.props.account, value:this.state.etherAmount})
    }

    constructor(props) {
        super(props);
        this.state = { exchangeAddress: '', tokenAddress:'', tokenBalance: '', etherAmount:'', tokenToDeposit:'', tokenToDepositOriginal:''};
    }

    render() {
        return(
            <Form.Group controlId="formTokenId">
                <Form.Label>Add Liquidity To Exchange</Form.Label>
                <Form.Control placeholder="Enter Ticker Pair" onChange={this.handleChange.bind(this)}/>
                <Form.Control placeholder="Enter Ether Amount" onChange={this.handleChangeAmount.bind(this)}/>
                <Form.Row>
                    <Form.Label> {this.renderTokenToDeposit()}</Form.Label>
                </Form.Row>
                <br></br>
                <Button variant="success" onClick={this.addLiquidity.bind(this)} >
                    Add Liquidity
                </Button>
            </Form.Group>

        );
    }
}

export default AddLiquidityForm;
