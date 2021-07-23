import * as React from "react";
import AddLiquidityForm from "../AddLiquidityForm";
import TokenInfoForm from "../TokenInfoForm";

class AddLiquidityView extends React.Component{
    render() {
        return(
            <div className="container">
                <AddLiquidityForm
                    factory={this.props.factory}
                    web3={this.props.web3}
                    account={this.props.account}
                />
            </div>
        );
    }
}

export default AddLiquidityView;
