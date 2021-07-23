import * as React from "react";
import AddLiquidityView from "./AddLiquidityView";
import CreateExchangeForm from "../CreateExchangeForm";


class CreateExchangeView extends React.Component{
    render() {
        return(
            <CreateExchangeForm
                factory={this.props.factory}
                web3={this.props.web3}
                account={this.props.account}
            />
        );
    }
}
export default CreateExchangeView;
