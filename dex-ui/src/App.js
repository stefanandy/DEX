import React, {Component, createRef} from 'react'
import Web3 from 'web3'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import {Form, Button} from 'react-bootstrap'
import factoryJSON from "./contracts/Factory.json"
import dexJSON from "./contracts/DEX"
import erc20 from "./contracts/USDT.json"
import constants from "./constants"
import TokenInfoForm from "./components/TokenInfoForm";
import TokenOutputForm from "./components/TokenOutputForm";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import AddLiquidityView from "./components/Views/AddLiquidityView";
import CreateExchangeView from "./components/Views/CreateExchangeView";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class App extends Component {

    web3=new Web3();
    factory = new this.web3.eth.Contract(factoryJSON.abi);
    dex = new this.web3.eth.Contract(dexJSON.abi);
    tokenSC = new this.web3.eth.Contract(erc20.abi);

    async loadBlockchainData() {
        this.web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
        const accounts = await this.web3.eth.getAccounts();
        this.factory = new this.web3.eth.Contract(factoryJSON.abi, constants.Factory);
        this.setState({ account: accounts[0] });
        sessionStorage.setItem('account', accounts[0]);
    }

    async renderBalance(){
        this.setState({renderBalance: true});
        let balance = await this.web3.eth.getBalance(this.state.account).then((r)=>{
            return r;
        });
        this.setState({balance: balance});
    }

    constructor(props) {
        super(props);
        this.state = {
            account: 'CONNECT' ,
            balance: 0,
            renderBalance: false,
            tokenA: '',
            tokenAbalance: '',
            tokenAInfo:'',
            tokenBAddress:'',
            tokenBBalance:"",
            outputTokens:''
        };
        this.TokenAInfo = React.createRef();
        this.TokenBInfo = React.createRef();
    }

    renderBalanceIfCliked() {
        if (this.state.renderBalance === true){
            return <h4>Balance is {this.state.balance}</h4>
        }
    }

    componentDidMount() {
        console.log(this.TokenAInfo.current)
        if(sessionStorage.getItem('account')!==undefined){
            this.loadBlockchainData();
        }
    }

    async swapButton() {
        const tokenAinfo = this.TokenAInfo.current;
        const tokenBinfo = this.TokenBInfo.current;
        if(tokenAinfo.state.exchangeAddress!==''){
            this.dex = new this.web3.eth.Contract(dexJSON.abi, tokenAinfo.state.exchangeAddress[0]);
            const accounts = await this.web3.eth.getAccounts();
            this.tokenSC = tokenAinfo.tokenSC;
            this.setState({tokenA:tokenAinfo.state.tokenAmount});
            await tokenAinfo.tokenSC.methods.approve(tokenAinfo.state.exchangeAddress[0], tokenAinfo.state.tokenAmount).send({from:accounts[0]});
            await this.dex.methods.tokenToEth(tokenAinfo.state.tokenAmount)
                .send({from:accounts[0]});
            if(this.state.tokenBAddress===''){
                let tokenBBalance = await this.web3.eth.getBalance(this.state.account);
                let tokenBalanceBN = this.web3.utils.fromWei(tokenBBalance, 'ether');
                this.setState({tokenBBalance:tokenBalanceBN});
            }
        }
    }

    async calculateBought(){
        const tokenAinfo = this.TokenAInfo.current;
        if(tokenAinfo!==null) {
            this.dex = new this.web3.eth.Contract(dexJSON.abi, tokenAinfo.state.exchangeAddress[0]);
            this.tokenSC = tokenAinfo.tokenSC;
            let tokenReserve = await this.tokenSC.methods.balanceOf(tokenAinfo.state.exchangeAddress[0]).call();
            let tokenBBalance = await this.web3.eth.getBalance(tokenAinfo.state.exchangeAddress[0]);
            let outputAmount = await this.dex.methods.price(tokenAinfo.state.tokenAmount, tokenReserve, tokenBBalance).call();
            console.log(outputAmount);
            let outputBN = this.web3.utils.fromWei(outputAmount.toString(), 'ether');
            this.setState({outputTokens: outputBN})
        }
    }

    async handleBChange(event){
        let token = event.target.value;
        if(token==='ETH'){
            this.setState({tokenBAddress:''});
            let balance = await this.web3.eth.getBalance(this.state.account).then((r)=>{
                return r;
            });
            let balanceBN = this.web3.utils.fromWei(balance.toString(), 'ether');
            this.setState({tokenBBalance: balanceBN});
            await this.calculateBought();
        } else if(token.toString().length > 3){
            let arr = await this.factory.methods.getTickerTokenAddress(token).call({from:this.props.account});
            if(arr.length === 0){
                this.setState({tokenBAddress:''})
            }else{
                this.setState({tokenBAddress:arr});
                this.tokenSC = new this.web3.eth.Contract(erc20.abi, constants.USDT);
                let balanceInWei = await this.tokenSC.methods.balanceOf(this.props.account).call();
                let balance = this.props.web3.utils.fromWei(balanceInWei.toString(),'ether');
                this.setState({tokenBBalance: balance});
            }
        }
    }

    renderBought(){
        if(this.state.outputTokens!==''){
            return '    Token bought:   '+this.state.outputTokens;
        }
    }

    renderBTokenAddress() {
        if(this.state.tokenBAddress!==''){
            return '    Token Address:  '+this.state.tokenBAddress;
        }
    }

    renderBTokenBalance() {
        if(this.state.tokenBBalance!==''){
            return '    Token Balance:  '+this.state.tokenBBalance;
        }
    }


    render() {
        return (
            <Router>
            <div className="container mx-auto px-4">
                {this.renderBalanceIfCliked()}
                <Navbar bg="primary" variant="dark" className="bkg2 rounded-xl">
                    <Nav className="mr-auto">
                        <Nav.Link href="/swap">SWAP</Nav.Link>
                        <Nav.Link href="/createExchange">Create Exchange</Nav.Link>
                        <Nav.Link href="/addLiquidity">Add Liquidity</Nav.Link>
                    </Nav>
                    <Form inline>
                        <Button variant="outline-light" onClick={() => this.loadBlockchainData()}>{this.state.account}</Button>
                    </Form>
                </Navbar>
                <br></br>
                <br></br>
                <Switch>
                    <div className="container-sm text-grey-50">
                    <Route path="/swap">
                    <Form>
                        <TokenInfoForm
                            factory={this.factory}
                            web3={this.web3}
                            account={this.state.account}
                            ref={this.TokenAInfo}
                            className='object-scale-down'
                        />

                        <Form.Group controlId="formTokenOutputId">
                            <Row>
                                <Col md={{span:5, offset:3}}>
                                    <div className="shadow-2xl text-white-50">
                                        <Form.Label>Token</Form.Label>
                                        <Form.Control placeholder="Enter Token" className='bg-gray-200 focus:bg-white' onChange={this.handleBChange.bind(this)}/>
                                        <Form.Label> {this.renderBTokenAddress()} </Form.Label>
                                        <Form.Label> {this.renderBTokenBalance()} </Form.Label>
                                        <Form.Label>{this.renderBought()}</Form.Label>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={{span:5, offset:3}}>
                                    <Button variant="success" className="transition duration-500 ease-in-out bg-blue-600 hover:bg-red-600 transform hover:-translate-y-1 hover:scale-110" onClick={this.swapButton.bind(this)}>
                                        SWAP
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>
                    </Form>
                    </Route>
                    <Route path="/createExchange">
                        <CreateExchangeView
                            factory={this.factory}
                            web3={this.web3}
                            account={this.state.account}
                        />
                    </Route>
                    <Route path="/addLiquidity">
                        <AddLiquidityView
                            factory={this.factory}
                            web3={this.web3}
                            account={this.state.account}
                        />
                    </Route>
                    </div>
                    </Switch>
            </div>
            </Router>
        );
    }
}

export default App;
