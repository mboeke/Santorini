import React from "react";
import styled from "styled-components";
import {withRouter} from "react-router-dom";
import {COLOR_3, COLOR_4, COLOR_5} from "../../helpers/layout";
import Building_0 from "./SidebarComponents/Building_0";
import Building_1 from "./SidebarComponents/Building_1";
import Building_2 from "./SidebarComponents/Building_2";
import Building_3 from "./SidebarComponents/Building_3";
import Figure_1 from "./SidebarComponents/Figure_1";
import Figure_2 from "./SidebarComponents/Figure_2";
import {Button} from "../../views/design/Button";
import {getDomain} from "../../helpers/getDomain";
import {handleError} from "../../helpers/handleError";
import {catchError} from "../../helpers/catchError";

const Sidebar = styled.div`
  width: 270px;
  margin-right: 20px;
  background-color: ${COLOR_5};
`;

export const SidebarHeader = styled.div`
  height: 200px;
  text-align: center;
  margin-bottom: 20px;
`;

export const GodCard = styled.img`
  margin: 0 auto;
  height: 150px;
`;

const Container = styled.div`
  background-color: ${COLOR_4};
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EndTurnHigherContainer = styled.div`
  display: ${props => props.show ? 'block' : 'none'}
`;

const EndTurnContainer = styled.div`
  display: flex;
  height: 100px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const FinishTurnButton = styled(Button)`
  width: auto;
`;

const Hint = styled.h3`
  text-align: center;
`;

class PlayerSidebar extends React.Component {

    render() {
        return (
            <Sidebar>
                <SidebarHeader>
                    <h2>{this.props.name}</h2>
                    <GodCard src={process.env.PUBLIC_URL+"/assets/godcards/"+this.props.godcard+".png"}  title={this.props.godcardDescription}/>
                </SidebarHeader>
                <Hint>
                    {this.props.showBuildingParts?'Please select a figure, move it and then place a building:':
                        (this.props.showInitalFig1 || this.props.showInitialFig2)?'Please place your figures:':'Please wait...'}
                </Hint>
                <Container>
                    <Figure_1
                        show={this.props.showInitialFig1}
                        figure={this.props.figure}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getInitialMoves={this.props.getInitialMoves}
                    />
                    <Figure_2
                        show={this.props.showInitialFig2}
                        figure={this.props.figure}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getInitialMoves={this.props.getInitialMoves}
                    />
                    <Building_0
                        show={this.props.showBuildingParts}
                        building={this.props.building}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getPossibleBuilds={this.props.getPossibleBuilds}
                    />
                    <Building_1
                        show={this.props.showBuildingParts}
                        building={this.props.building}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getPossibleBuilds={this.props.getPossibleBuilds}
                    />
                    <Building_2
                        show={this.props.showBuildingParts}
                        building={this.props.building}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getPossibleBuilds={this.props.getPossibleBuilds}
                    />
                    <Building_3
                        show={this.props.showBuildingParts}
                        building={this.props.building}
                        currentUser={this.props.currentUser}
                        currentTurn={this.props.currentTurn}
                        getPossibleBuilds={this.props.getPossibleBuilds}
                    />
                </Container>
                <EndTurnHigherContainer show={this.props.showFinishTurnButton}>
                    <EndTurnContainer>
                        <Hint>Once you finished moving or building, click below:</Hint>
                        <FinishTurnButton
                            onClick={() => {
                                this.props.finishTurn();
                            }}
                        >
                            Finish Turn
                        </FinishTurnButton>
                    </EndTurnContainer>
                </EndTurnHigherContainer>
            </Sidebar>
        )
    }
}

export default withRouter(PlayerSidebar);