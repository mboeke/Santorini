import React from "react";
import styled from "styled-components";

const Popup = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  min-height: 20px;
  color: white;
  border-radius: 4px;
  background-color: red;
  z-index: 200;
  padding: 3px 10px 5px;
  box-shadow: 0 0 5px 0 rgba(143,143,143,1);
  opacity: ${props => props.show?1:0};
  visibility: ${props => props.show?1:0};
  transition: all 200ms ease-in-out;
`;

class Error extends React.Component{
    constructor(props){
        super(props);
        this.state = {show:false,errorCount:0};
        this._isMounted = false;
        this.timeoutId = 0;

    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillReceiveProps(nextProps) {
        if(this._isMounted){
            if(nextProps.error !== null && (nextProps.error.length > this.state.errorCount)){
                clearTimeout(this.timeoutId);
                this.setState({show:true, errorCount: nextProps.error.length});
                this.timeoutId = setTimeout(()=>{this.setState({show:false})},4000);
            }
        }
    }

    render = () => {
            return(
                <Popup show={this.state.show}>{this.props.error? this.props.error[this.props.error.length - 1]: ''}</Popup>
            )
    };

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
        this._isMounted = false;
    }
}

export default Error;