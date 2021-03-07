import React from "react";
import { DragSource } from 'react-dnd'
import styled from "styled-components";
import {COLOR_1, COLOR_2, COLOR_4, COLOR_5} from "../../helpers/layout";

const BoardItem = styled.div`
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const BoardFigure = styled(BoardItem)`
  width: 30px;
  height: 30px;
  background-color: ${props => props.currentUser === props.figureOwner ? COLOR_2 : COLOR_4};
  border: 3px solid ${props => props.active ? 'yellow':'grey'};
  box-sizing: border-box;
  border-radius: 30px;
  z-index: 5;
`;

const FigureSource = {
    canDrag(props){
        //making figure only draggable if belonging to owner and figure has not yet been moved
        //don't block dragging if figure already moved as Aphrodite god card allows multiple move
        return props.currentUser === props.currentTurn &&
            props.currentUser === props.figure.owner
    },

    beginDrag(props) { //returning only figure as to only item to be dropped
        return props.figure;
    }
};

function collect(connect, monitor){
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

class Figure extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            active: false,
        }
    }
    render() {
        const {isDragging, connectDragSource, figure, currentUser, currentTurn} = this.props;
        return (
            <BoardFigure
                ref={(instance => connectDragSource(instance))}
                id={figure.id}
                figureOwner={figure.owner}
                currentUser={currentUser}
                active={this.state.active}
                onDragStart={() => {
                    //highlighting figure yellow once dragging visually indicating figure is active
                    //activating figure only if figure belongs to currentUser & figure is not active yet
                    //check if a figure has been moved yet not necessary as there exist god cards that allow multiple moves, and drop only possible if move valid through possibleMoves
                    //only get possibleMoves when above applies
                    if(currentUser === figure.owner
                        && currentUser === currentTurn
                        && !this.state.active){
                        this.setState({active: true});
                        this.props.activateFigure(figure.id);
                        this.props.getPossibleMoves();
                    }
                }}
                onDragEnd={() => {
                    //deactivating figure once figure released
                    //but figure has to be deactivated within in figures object and visually
                    this.setState({active: false});
                    this.props.deactivateFigure(figure.id);
                }}
            />
        )
    }
}

export default DragSource('figure', FigureSource, collect)(Figure)