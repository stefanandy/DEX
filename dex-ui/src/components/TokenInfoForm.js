import * as React from "react";
import {Form} from "react-bootstrap";
import erc20 from "../contracts/USDT";
import constants from "../constants";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class TokenInfoForm extends  React.Component{

    tokenSC= new this.props.web3.eth.Contract(erc20.abi);


    async handleAmountChange(event){
        let amount = event.target.value;
        let amountBN = this.props.web3.utils.toWei(amount.toString(), 'ether');
        this.setState({tokenAmount:amountBN})
    }

    async handleChange(event){
        let token = event.target.value;
        if(token==='ETH'){
            this.setState({exchangeAddress:''});
            let balance = await this.props.web3.eth.getBalance(this.props.account).then((r)=>{
                return r;
            });
            let balanceBN = this.props.web3.utils.fromWei(balance.toString(), 'ether');
            this.setState({tokenBalance: balanceBN})
        } else if(token.length === 0) {
            this.setState({exchangeAddress:'', tokenBalance:'', tokenAddress:''});
        } else if(token.toString().length > 3){
            let exchanges = await this.props.factory.methods.getExchangesByTicker(token).call({from:this.props.account});
            if(exchanges.length === 0){
                this.setState({exchangeAddress:''})
            }else{
                let tokenAddress = await this.props.factory.methods.getTickerTokenAddress(token).call({from:this.props.account});
                this.setState({exchangeAddress:exchanges, tokenAddress:tokenAddress});
                this.tokenSC = new this.props.web3.eth.Contract(erc20.abi, tokenAddress);
                let balanceInWei = await this.tokenSC.methods.balanceOf(this.props.account).call();
                let balance = this.props.web3.utils.fromWei(balanceInWei.toString(),'ether');
                this.setState({tokenBalance: balance});
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = { exchangeAddress: '', tokenAddress:'', tokenBalance: '', tokenAmount:''};
    }

    renderExchangeAddress(){
        if(this.state.exchangeAddress!== ''){
            return "    Exchange Address: "+ this.state.exchangeAddress
        }
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
            <Form.Group controlId="formTokenId" className="rounded-xl">
                <Row>
                    <Col md={{span:5, offset:3}}>
                        <div className="shadow-3xl rounded-xl text-white-50">
                        <Form.Label>Token</Form.Label>
                        <Form.Control placeholder="Enter Token" onChange={this.handleChange.bind(this)}/>
                        <Form.Control className='input-sm' placeholder="Enter Token amount" onChange={this.handleAmountChange.bind(this)}/>
                        <Form.Label> {this.renderExchangeAddress()}</Form.Label>
                        <Form.Label> {this.renderTokenAddress()}</Form.Label>
                        <Form.Label> {this.renderTokenBalance()} </Form.Label>
                        </div>
                    </Col>
                </Row>
            </Form.Group>
        )
    }

}

export default TokenInfoForm;
