import * as React from "react";
import {Button, Form} from "react-bootstrap";
import erc20 from "../contracts/USDT";
import factory from "../contracts/Factory";
import dex from "../contracts/DEX";
import constants from "../constants"
import Modal from 'react-awesome-modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class CreateExchangeForm extends React.Component{

    tokenSC= new this.props.web3.eth.Contract(erc20.abi);
    factory = new this.props.web3.eth.Contract(factory.abi);

    async handleChange(event){
        let tokenAddress = event.target.value;
        if(tokenAddress.length>=42) {
            try {
                this.tokenSC = new this.props.web3.eth.Contract(erc20.abi, tokenAddress);
                this.factory = new this.props.web3.eth.Contract(factory.abi, constants.Factory);
                let balanceWei = await this.tokenSC.methods.balanceOf(this.props.account).call();
                let balance = this.props.web3.utils.fromWei(balanceWei.toString(), 'ether');
                let name = await this.tokenSC.methods.name().call();
                let symbol = await this.tokenSC.methods.symbol().call();
                this.setState({
                    tokenAddress: tokenAddress,
                    tokenName: name,
                    tokenSymbol: symbol,
                    tokenBalance: balance,
                    validAddress: true,
                    notERC20:false,
                });
            }catch (e) {
                console.log(e);
                this.setState({notERC20:true})
            }

        } else if(tokenAddress.length===0){
            this.setState({validAddress:'', notERC20:''})
        }else{
            this.setState({validAddress:false, notERC20:''})
        }
    }

    async initialTokenAmount(event){
        let amount = event.target.value;
        let amountInWei = this.props.web3.utils.toWei(amount.toString(), 'ether');
        this.setState({initialTokenAmount:amountInWei})
    }

    async initialEtherAmount(event){
        let amount = event.target.value;
        let amountInWei = this.props.web3.utils.toWei(amount.toString(), 'ether');
        this.setState({initialEtherAmount:amountInWei})

    }

    async provideLiquidity(){
        await this.tokenSC.methods.approve(this.state.dexAddress, this.state.initialTokenAmount).send({from:this.props.account});
        let dexSC = new this.props.web3.eth.Contract(dex.abi, this.state.dexAddress);
        await dexSC.methods.init(this.state.initialTokenAmount).send({from:this.props.account, value:this.state.initialEtherAmount})
        this.setState({visible:false});
    }

    async createExchange(){
        let result = await this.factory.methods.createExchange(this.state.tokenAddress).send({from:this.props.account});
        console.log(result);
        let dexAddress = result.events.NewExchange.returnValues.exchange;
        console.log(dexAddress);
        if (dexAddress!==null ){
            this.setState({ dexAddress: dexAddress,visible:true});
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            tokenAddress:'',
            tokenSymbol:'',
            tokenBalance: '',
            tokenName:'',
            validAddress:'',
            notERC20:'',
            dexAddress:'',
            visible:false,
            initialTokenAmount: '',
            initialEtherAmount: ''
        };

    }

    renderNotERC20(){
        if(this.state.notERC20===''){
            return '';
        }else if (this.state.notERC20===true){
            return ' Addres is not from an ERC20';
        }
    }

    renderInvalidAddress(){
        if(this.state.validAddress===''){
            return ''
        }
        else if(this.state.validAddress===false){
            return ' Address is not valid';
        }
    }

    renderTokenName(){
        if(this.state.validAddress===true && this.state.tokenName!=='') {
            return '    Token Name: ' + this.state.tokenName
        }
    }

    renderTokenSymbol() {
        if (this.state.validAddress===true && this.state.tokenSymbol !== '') {
            return '    Token Symbol: ' + this.state.tokenSymbol
        }
    }

    renderTokenBalance(){
        if (this.state.validAddress===true && this.state.tokenBalance!=='') {
            return '    Token Balance: ' + this.state.tokenBalance
        }
    }

    render() {
        return(
            <Form.Group controlId="formTokenId">
                <Row>
                    <Col md={{span:6, offset:3}}>
                        <div className="text-white-50">
                            <Form.Label>Create Exchange Liquidity Pool</Form.Label>
                            <Form.Control placeholder="Enter Token Address" onChange={this.handleChange.bind(this)}/>
                            <Form.Label>{this.renderNotERC20()}</Form.Label>
                            <Form.Label color="RED">{this.renderInvalidAddress()}</Form.Label>
                            <Form.Label>{this.renderTokenName()}</Form.Label>
                            <Form.Label>{this.renderTokenSymbol()}</Form.Label>
                            <Form.Label>{this.renderTokenBalance()}</Form.Label>
                        </div>
                    </Col>
                </Row>
                <br></br>
                <Row>
                    <Col md={{span:5, offset:5}}>
                        <Button variant="success" onClick={this.createExchange.bind(this)} >
                            Create Exchange
                        </Button>
                    </Col>
                </Row>

                <Modal visible={this.state.visible} width="500" height="200" effect="fadeInUp" onClickAway={() => this.closeModal()}>
                    <Form.Group>
                        <Row>
                            <Col>
                                <Form.Label>Provide Exchange Initial Liquidity</Form.Label>
                                <br></br>
                                <Form.Control placeholder="Enter Token Amount" onChange={this.initialTokenAmount.bind(this)}/>
                                <br></br>
                                <Form.Control placeholder="Enter Ether Amount" onChange={this.initialEtherAmount.bind(this)}/>
                                <br></br>
                                <Button variant="success" onClick={this.provideLiquidity.bind(this)} >
                                    Provide Liquidity
                                </Button>
                            </Col>
                        </Row>

                    </Form.Group>
                </Modal>
            </Form.Group>
        )
    }

    closeModal() {
        this.setState({visible:false})
    }
}

export default CreateExchangeForm;
