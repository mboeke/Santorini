import React from "react";
import styled from "styled-components";
import { DragSource } from 'react-dnd'

const BoardItem = styled.div`
 float: left;
`;

const Building_0_Component = styled(BoardItem)`
  display: ${props => props.show ? 'block' : 'none'};
  width: 55px;
  height: 55px;
  background-color: #ddd;
  border: 0.5px black solid;
  z-index: 1;
  margin-right: 10px;
`;

const BuildingSource = {
    canDrag(props){ //allow dragging only if currentUser === currentTurn
        return props.currentUser === props.currentTurn;
    },

    beginDrag(props){
        props.building.z = 0;
        return props.building;
    }
};

function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

function Building_0 (props) {
    const {isDragging, connectDragSource, building, currentUser, currentTurn} = props;
    return (
        <Building_0_Component
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

export default DragSource('building', BuildingSource, collect)(Building_0)