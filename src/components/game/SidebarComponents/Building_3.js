import React from "react";
import styled from "styled-components";
import { DragSource } from 'react-dnd'
import {COLOR_3, COLOR_4, COLOR_5} from "../../../helpers/layout";

const BoardItem = styled.div`
  float: left;
`;

const Building_3_Component = styled(BoardItem)`
  display: ${props => props.show ? 'block' : 'none'};
  width: 25px;
  height: 25px;
  border-radius: 40px;
  background-color: ${COLOR_3}; 
  border: 0.5px solid black; 
  z-index: 4; 
`;

const BuildingSource = {
    canDrag(props){ //allow dragging only if currentUser === currentTurn
        return props.currentUser === props.currentTurn;
    },

    beginDrag(props){
        props.building.z = 3;
        return props.building;
    }
};

function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

function Building_3 (props) {
    const {isDragging, connectDragSource, building, currentUser, currentTurn} = props;
    return (
        <Building_3_Component
            show={props.show}
            ref={instance => connectDragSource(instance)}
            onDragStart={() =>{
                //fetch possibleBuilds only when dragging building part started
                if(currentUser === currentTurn){
                    props.getPossibleBuilds();
                }

            }}
        />
    )
}

export default DragSource('building', BuildingSource, collect)(Building_3)