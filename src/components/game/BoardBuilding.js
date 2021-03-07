import React from "react";
import styled from "styled-components";
import {COLOR_1, COLOR_3, COLOR_4, COLOR_5} from "../../helpers/layout";

const BoardItem = styled.div`
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Building_3 = styled(BoardItem)`
  width: 50px;
  height: 50px;
  border-radius: 40px;
  background-color: ${COLOR_3};
  border: 0.2px solid black; 
  z-index: 4;
`;
const Building_2 = styled(BoardItem)`
  width: 60px;
  height:60px;
  background-color: #fff;
  border: 0.2px solid black; 
  z-index: 3;  
`;
const Building_1 = styled(BoardItem)`
  width: 100px;
  height: 100px;
  border-radius: 70px;
  background-color: #eee;  
  border: 0.2px solid black; 
  z-index: 2;
`;
const Building_0 = styled(BoardItem)`
  width: 110px;
  height: 110px;
  background-color: #ddd;
  border: 0.2px solid black; 
  z-index: 1;
`;

export const BoardBuilding = (props) => {
    let buildings =[];
    switch(props.level){
        case 3:
            buildings.push(<Building_3 key={3}/>);
        case 2:
            buildings.push(<Building_2 key={2}/>);
        case 1:
            buildings.push(<Building_1 key={1}/>);
        case 0:
            buildings.push(<Building_0 key={0}/>);
            break;
    }
    return (
        <div>
            {buildings}
        </div>
    );
};
