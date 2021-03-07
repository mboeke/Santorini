import React from "react";
import "./spinner.css";
import styled from "styled-components";
import {COLOR_5} from "../../helpers/layout";

const SpinnerBullet = styled.div`
  background-color: ${props => props.color?props.color:COLOR_5};
`;

export const Spinner = (props) => {
  return (
    <div className="lds-ellipsis">
      <SpinnerBullet color={props.color}/>
      <SpinnerBullet color={props.color}/>
      <SpinnerBullet color={props.color}/>
      <SpinnerBullet color={props.color}/>
    </div>
  );
};
