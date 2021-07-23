import * as React from "react";
import {Form} from "react-bootstrap";
import erc20 from "../contracts/USDT";
import constants from "../constants";


class TokenOutputForm extends  React.Component{

    tokenSC= new this.props.web3.eth.Contract(erc20.abi);


    async handleAmountChange(event){
        let amount = event.target.value;
        let amountBN = this.props.web3.utils.toWei(amount.toString(), 'ether');
        this.setState({tokenAmount:amountBN})
    }

    async handleChange(event){
        let token = event.target.value;
        if(token==='ETH'){
            this.setState({tokenAddress:''});
            let balance = await this.props.web3.eth.getBalance(this.props.account).then((r)=>{
                return r;
            });
            let balanceBN = this.props.web3.utils.fromWei(balance.toString(), 'ether');
            this.setState({tokenBalance: balanceBN});
            await this.props.calculateBought();
        } else if(token.toString().length > 3){
            let arr = await this.props.factory.methods.getTickerTokenAddress(token).call({from:this.props.account});
            if(arr.length === 0){
                this.setState({tokenAddress:''})
            }else{
                this.setState({tokenAddress:arr});
                this.tokenSC = new this.props.web3.eth.Contract(erc20.abi, constants.USDT);
                let balanceInWei = await this.tokenSC.methods.balanceOf(this.props.account).call();
                let balance = this.props.web3.utils.fromWei(balanceInWei.toString(),'ether');
                this.setState({tokenBalance: balance});
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = { tokenAddress: '', tokenBalance: '', outputAmount:''};
    }

    renderTokenAddress(){
        if(this.state.tokenAddress!== ''){
            return "    Token Address: "+ this.state.tokenAddress
        }
    }

    renderTokenBalance(){
        if(this.state.tokenBalance!==''){
            return "    Balance: " +this.state.tokenBalance
        }
    }

    render() {
        return(
            <Form.Group controlId="formTokenOutputId">
                <Form.Label>Token</Form.Label>
                <Form.Control placeholder="Enter Token" onChange={this.handleChange.bind(this)}/>
                <Form.Text placeholder={this.state.outputTokens} />
                <Form.Row>
                    <Form.Label> {this.renderTokenAddress()} </Form.Label>
                </Form.Row>
                <Form.Row>
                    <Form.Label> {this.renderTokenBalance()} </Form.Label>
                </Form.Row>
            </Form.Group>
        )
    }

}

export default TokenOutputForm;
