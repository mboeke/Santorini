import React from "react";
import styled from "styled-components";
import { DragSource } from 'react-dnd'
import {COLOR_2, COLOR_4} from "../../../helpers/layout";

const BoardItem = styled.div`
  margin-right: 10px;
  float: left;
`;

const BoardFigure = styled(BoardItem)`
  display: ${props => props.show ? 'block' : 'none'};
  width: 30px;
  height: 30px;
  background-color: ${props => props.user === 1 ? COLOR_4 : COLOR_2};
  border: yellow 3px solid;
  box-sizing: border-box;
  border-radius: 30px;
  z-index: 5;
`;

const FigureSource = {
    canDrag(props){ //allow dragging of initial figures only if user has current turn
        return props.currentUser === props.currentTurn;
    },

    beginDrag(props){
        return props.figure;
    },
};

function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

function Figure_1 (props) {
    const {isDragging, connectDragSource, figure, currentUser, currentTurn} = props;
    figure.type = 'fig1';
    return (
        <BoardFigure
            show={props.show}
            ref={instance => connectDragSource(instance)}
            onDragStart={() => {
                //fetch possibleMoves only when initial figure dragged by user who has current turn
                if(currentUser === currentTurn){
                    props.getInitialMoves();
                }
            }}
        />
    )
}

export default DragSource('initialFigure', FigureSource, collect)(Figure_1)