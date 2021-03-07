import React from "react";
import styled from "styled-components";
import {COLOR_1, COLOR_2, COLOR_4, COLOR_5} from "../../helpers/layout";
import {BoardBuilding} from "./BoardBuilding";
import Figure from "./Figure";
import DropTarget from "react-dnd/lib/cjs/DropTarget";

const Field = styled.div`
  width: 130px;
  height: 130px;
  border: 5px solid;
  border-color: ${COLOR_5};
  background-color: #37BD5A;
  box-sizing: border-box;
  position: relative;
  float: left;
`;

const Hover = styled.div`
 position: absolute;
 top: 0;
 left: 0;
 height: 100%;
 width: 100%;
 z-index: 1;
 opacity: 0.5;
 border: 20px solid;
 border-color: ${props => {
    switch(props.itemType){
        case 'initialFigure':
            return props.targetForInitialMove ? 'yellow' : 'red';
        case 'figure':
            return props.targetForMove ? 'yellow' : 'red';
        case 'building':
            return props.targetForBuild ? 'yellow' : 'red';
    }}}
`;

const HoverBuilding = styled(Hover)`
 border-color: ${props => props.targetForBuild ? 'yellow' : 'red'}
`;

const HoverInitialMove = styled(Hover)`
 border-color: ${props => props.targetForInitialMove ? 'yellow' : 'red'}
`;

const FieldTarget = {
    canDrop(props, monitor){
        switch(monitor.getItemType()){
            case 'initialFigure':
                return !!props.targetForInitialMove; //to be implemented still
            case 'figure':
                return !!props.targetForMove;
            case 'building': //check if dragged building has same z of possible build of drop target position
                return !!props.targetForBuild(
                    props.field_x_coordinate, props.field_y_coordinate, monitor.getItem().z
                );
        }

    },

    drop(props, monitor){

        switch(monitor.getItemType()){
            case 'initialFigure':
                props.updateInitialFigure(
                    monitor.getItem(),
                    props.field_x_coordinate,
                    props.field_y_coordinate,
                    0
                );
                break;
            case 'figure':
                props.updateFigure(
                    monitor.getItem(),
                    props.field_x_coordinate,
                    props.field_y_coordinate,
                    (props.building ? props.building.position.z+1 : 0)
                );
                break;
            case 'building':
                props.updateBuilding(props.field_x_coordinate, props.field_y_coordinate, monitor.getItem().z);
                break;

        }
    }
};

function collect(connect, monitor){
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        item: monitor.getItem(),
        itemLevel: monitor.getItemType() === 'building' ? monitor.getItem().z : '',
        itemType: monitor.getItemType(),
    }
}

class BoardField extends React.Component{ //use "isOver" to highlight field when hovering over it
    constructor(props){
        super(props);
        this.state = {
            refreshFigures: this.props.refreshFigures
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({refreshFigures:nextProps.refreshFigures})
    }

    render = () => {
        const {connectDropTarget, isOver, itemType, itemLevel} = this.props;
        let validBuild = this.props.targetForBuild(this.props.field_x_coordinate, this.props.field_y_coordinate, itemLevel);

        return (
            <Field ref={instance => connectDropTarget(instance)} targetForMove={this.props.targetForMove} targetForBuild={this.props.targetForBuild}>
                {(this.props.building != null)?(
                    <BoardBuilding
                        level={this.props.building.position.z}
                    />):''}
                {(this.props.figure != null)?(
                    <Figure
                        figure={this.props.figure}
                        activateFigure={this.props.activateFigure}
                        deactivateFigure={this.props.deactivateFigure}
                        refreshFigures={this.state.refreshFigures}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getPossibleMoves={this.props.getPossibleMoves}/>):''}
                {isOver && (
                    <Hover
                        itemType={itemType}
                        targetForMove={this.props.targetForMove}
                        targetForBuild={this.props.targetForBuild(this.props.field_x_coordinate, this.props.field_y_coordinate, itemLevel)}
                        targetForInitialMove={this.props.targetForInitialMove}
                    />)}
            </Field>
        );
    };
}

export default DropTarget(['figure', 'building', 'initialFigure'], FieldTarget, collect)(BoardField)