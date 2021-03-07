import React from "react";


export const catchError = (err, that) => {
    if(err.status === 401){//Unauthorized
        //kill all timeouts
        var killId = setTimeout(function() {
            for (var i = killId; i > 0; i--) clearInterval(i)
        }, 10);
        localStorage.clear();
        if(window.location.pathname !== '/login') setTimeout(() => {that.props.history.push('/login');},4000);
    }
    console.error(err);
    let error = that.state.error;
    error.push(err.message);
    that.setState({error : error});
};
