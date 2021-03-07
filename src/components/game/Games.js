import React from "react";
import styled from "styled-components";
import { getDomain } from "../../helpers/getDomain";
import { withRouter } from "react-router-dom";
import { handleError } from "../../helpers/handleError";
import Error from "../../helpers/Error";
import {catchError} from "../../helpers/catchError";
import GameHeader from "../../views/GameHeader";
import {COLOR_4, COLOR_5} from "../../helpers/layout";
import BoardField from "./BoardField";
import HTML5Backend from 'react-dnd-html5-backend'
import {DragDropContext, DragDropContextProvider} from 'react-dnd'
import PlayerSidebar from "./PlayerSidebar";
import {OpponentSidebar} from "./OpponentSidebar";
import WinNotification from "./WinNotification";
import LoseNotification from "./LoseNotification";
import {godCards} from "../../helpers/godCards";

const GameWrapper = styled.div`
  overflow: hidden;
`;
const MainGame = styled.div`
  overflow: hidden;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
`;
const GameBoard = styled.div`
  background-color: ${COLOR_5};
  height: calc(130px * 5);
`;

const BoardRow = styled.div`
  overflow: hidden;
`;

class Games extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            game: null,
            gameId: null,
            currentUser: Number(localStorage.getItem("user_id")),
            currentUserToken: localStorage.getItem("token"),
            currentTurn: null,
            opponentUser: null,
            winner: null,
            loser: null,

            initialPossibleMoves: [],
            firstInitialFigPlaced: false,
            secondInitialFigPlaced: false,
            initialFigure: {x: null, y: null, z: null, type: null},
            refreshFigures: false,
            isGodPower: null,
            canFinishTurn: false,

            players: [],
            figures:[],
            possibleMoves: [],

            buildings:[],
            possibleBuilds: [],
            newBuilding: {x: null, y: null, z: null},

            error: [],
        };
        this.intervalGameState = 0;
        this.intervalFigures = 0;
        this.intervalBuildings = 0;
        this.updateInterval = 1000;
    }

    getInitialMoves = () => {
        //check if game has just been setup, respectively no figures or buildings on board
        //that doesn't work if first player already placed figures because figures no longer is empty, but game hasn't completely started yet
        //player with current turn should start to place his figures

        if (this.state.figures.length < 4 && this.state.buildings.length === 0) {
            fetch(`${getDomain()}/games/${this.props.match.params.gamesId}/figures/possiblePosts`, {
                method: "GET",
                headers: new Headers({
                    'Authorization': this.state.currentUserToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
                .then(handleError)
                .then(initialPossibleMoves => {
                    this.setState({initialPossibleMoves: initialPossibleMoves})
                })
                .catch(err => {
                    catchError(err, this);
                });
        }
    };

    //fetch game state: at 2 s interval if not currently user's turn, otherwise fetch only once
    getGameState = () => {
        fetch(`${getDomain()}/games/${this.props.match.params.gamesId}`, {
            method: "GET",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            .then(game => {
                if(game !== null){ //should actually be game.length > 0
                    this.setState({game: game, currentTurn: Number(game.currentTurn), gameId: game.id, isGodPower: game.isGodPower});
                }
                if(Number(game.currentTurn) !== this.state.currentUser){ //if the current user has the current turn no board updating needed
                    if(this.intervalFigures === 0 && this.intervalBuildings === 0) {
                        this.intervalFigures = setInterval(this.getFigures, this.updateInterval);
                        this.intervalBuildings = setInterval(this.getBuildings, this.updateInterval);
                    }
                }
                if(game.winner !== 0){ //if winner attribute exists the game has been won / lost, consequently assign winner / loser
                    this.clearingIntervalsAsGameFinished();
                    this.setState({winner: game.winner, loser: game.winner === game.user1 ? game.user2 : game.user1})
                }
                if(this.state.players.length === 0){
                    let opponentUserId = game.user1;
                    if(opponentUserId === this.state.currentUser) opponentUserId = game.user2; this.setState({opponentUser: opponentUserId});
                    fetch(`${getDomain()}/users/`+this.state.currentUser, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': localStorage.getItem("token"),
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }),
                    })
                        .then(handleError)
                        .then((player) => {
                            let players = this.state.players.slice();
                            player.role = 'me';
                            player.isChallenger = Number(player.id) === Number(game.user1);
                            players.push(player);
                            this.setState({players:players});
                        })
                        .then(()=>{
                            fetch(`${getDomain()}/users/`+opponentUserId, {
                                method: "GET",
                                headers: new Headers({
                                    'Authorization': localStorage.getItem("token"),
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }),
                            })
                                .then(handleError)
                                .then((player) => {
                                    let players = this.state.players.slice();
                                    player.role = 'opponent';
                                    player.isChallenger = Number(player.id) === Number(game.user1);
                                    players.push(player);
                                    this.setState({players:players});
                                })
                                .catch(err => {
                                    catchError(err, this);
                                });
                        })
                        .catch(err => {
                            catchError(err, this);
                        });
                }
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    //fetch all figures: at 2 s interval if not currently user's turn, otherwise fetch only once
    getFigures = () => {
        fetch(`${getDomain()}/games/${this.state.gameId}/figures`, {
            method: "GET",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            //should any interval be reestablished to call get fetches to update game board
            .then(figures => {
                if(figures.length > 0){ //add active flag to all figures on game board
                    for(let i=0; i < figures.length; i ++){
                        figures[i] = {id: figures[i].id, position: figures[i].position, owner: figures[i].owner, active: false}; // how to add active:false to the figure? I have to find correct index of concerned figure
                    }
                    this.setState({figures: figures});
                    if(figures.length >= 4){
                        this.setState({firstInitialFigPlaced: true, secondInitialFigPlaced: true});
                    }
                }
                if(this.state.currentTurn === this.state.currentUser){
                    clearInterval(this.intervalFigures);
                    this.intervalFigures = 0;
                }
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    //fetch all buildings: at 2 s interval if not currently user's turn, otherwise fetch only once
    getBuildings = () => {
        fetch(`${getDomain()}/games/${this.state.gameId}/buildings`, {
            method: "GET",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            //should any interval be reestablished to call get fetches to update game board
            .then(buildings => {
                if(buildings.length > 0){
                    this.setState({buildings: buildings});
                }
                if(this.state.currentTurn === this.state.currentUser){
                    clearInterval(this.intervalBuildings);
                    this.intervalBuildings = 0;
                }
            })
            .catch(err => {
                catchError(err, this);
            });

    };

    //fetch possible moves for only the figure that is active, activate figure once clicked on by user
    //getPossibleMoves gets called when figure activated/clicked on
    //initialize fetch when figure clicked on
    //checking if figureMoved not necessary as backend only returns values when figure has not yet been moved
    getPossibleMoves = () => {
        let activeFigure = this.getActiveFigure();
        fetch(`${getDomain()}/games/${this.state.gameId}/figures/${activeFigure.id}/possibleMoves`, {
            method: "GET",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            .then(possibleMoves => {
                this.setState({possibleMoves: possibleMoves});
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    getPossibleBuilds = () => {
        //only fetch for that figure that is active
        //check for figureMoved not necessary as possibleMoves will be empty plus there exist god cards allowing multiple moves
        fetch(`${getDomain()}/games/${this.state.gameId}/buildings/possibleBuilds`, {
            method: "GET",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            .then(possibleBuilds => {
                this.setState({possibleBuilds: possibleBuilds});
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    getBuilding = (x,y) => {
        if (this.state.buildings.length > 0) {
            let filteredBuildings = this.state.buildings.filter((building) => {
                return (building.position.x === x && building.position.y === y)
            });
            if (filteredBuildings.length > 0){
                if(filteredBuildings.length > 1){
                    filteredBuildings.sort((building_a, building_b) => building_b.position.z > building_a.position.z ? 1 : -1);
                }return filteredBuildings[0];
            }
            return null;
        }
    };

    getFigure = (x,y) => {
        if (this.state.figures.length > 0) {
            let filteredFigures = this.state.figures.filter((figure) => {
                return figure.position.x === x && figure.position.y === y
            });
            if (filteredFigures.length > 0) return filteredFigures[0];
            return null;
        }
    };

    getFigureById = (id) => {
        let filteredFigures = this.state.figures.filter((figure) => {return figure.id === id});
        if(filteredFigures.length > 0) return filteredFigures[0];
        return null;
    };

    getActiveFigure = () => {
        let filteredFigures = this.state.figures.filter((figure) => {
            return figure.active;
        });
        if(filteredFigures.length > 0) return filteredFigures[0];
        return null;
    };

    activateFigure = (id) => {
        //figure needs to be activated so that getPossibleMoves knows for which figure to fetch the possible moves
        //check if figureMoved not necessary, as figures will only be droppable if valid move through possibleMoves
        let figure = this.getFigureById(id);
        if(this.getActiveFigure() == null && figure != null
            && Number(figure.owner) === Number(this.state.currentTurn) && Number(figure.owner) === Number(this.state.currentUser)){
            let newFigures = this.state.figures.slice();
            figure.active = true;
            newFigures[newFigures.indexOf(figure)] = figure;
            this.setState({ figures: newFigures, refreshFigures: !this.state.refreshFigures }); //remove refreshFigures
        }
    };

    deactivateFigure = (id) => {
        //figure has to be deactivated within figures object as getPossibleMoves always gets the possible moves for the active figure
        //check that figure to be deactivated (specified by id) is actually active
        let figure = this.getFigureById(id);
        if(this.getActiveFigure() === figure && figure !== null
            && Number(figure.owner) === Number(this.state.currentTurn) && Number(figure.owner) === Number(this.state.currentUser)){
            let newFigures = this.state.figures.slice();
            figure.active = false;
            newFigures[newFigures.indexOf(figure)] = figure;
            this.setState({figures: newFigures});
        }
    };

    isTargetForInitialMove = (x,y) => {
        let initialFigures = this.state.initialPossibleMoves;
        if(initialFigures){
            let filteredInitialPossibleMoves = initialFigures.filter((move) => {return move.x === x && move.y === y});
            return filteredInitialPossibleMoves.length > 0;
        }
    };

    isTargetForMove = (x,y,z) => {
        let figure = this.getActiveFigure();
        let possibleMoves = this.state.possibleMoves;
        if(figure != null && possibleMoves.length !== 0){ //update possibleMoves according to new data structure
            if(z){
                let possibleMoveValueSet = possibleMoves.filter((possibleValueSet) => {
                    if(possibleValueSet.x === x && possibleValueSet.y === y && possibleValueSet.z === z){
                            return possibleValueSet;
                    }});
                return possibleMoveValueSet.length > 0;
            }else{
                let filteredMoves = possibleMoves.filter((move) => {return move.x === x && move.y === y});
                return filteredMoves.length > 0;
            }
        }
        return false;
    };

    isTargetForBuild = (x,y,z) => {//get x, y of position dragging to and z of building to be dragged
        let possibleBuilds = this.state.possibleBuilds;
        if(possibleBuilds.length !== 0){
            let filteredBuilds = possibleBuilds.filter((build) => {return build.x === x && build.y === y && build.z === z});
            return filteredBuilds.length > 0;
        }
        return false;
    };

    updateInitialFigure = (updating_fig, new_x, new_y, new_z) => {
        const figures = this.state.figures.slice();
        figures.push({position: {x: new_x, y: new_y, z:new_z}, active:false});
        this.setState({figures: figures});
        //these flags shall activate the tower parts, they shall only be selectable from sidebar if all initial figures have been placed
        this.state.firstInitialFigPlaced ? this.setState({secondInitialFigPlaced: true}) : this.setState({firstInitialFigPlaced: true});

        fetch(`${getDomain()}/games/${this.state.gameId}/figures`, {
            method: "POST",
            headers: new Headers({
                'Authorization': this.state.currentUserToken,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(({
                x: new_x,
                y: new_y,
                z: new_z,
            })),
        })
            .then(handleError)
            //should any interval be reestablished to call get fetches to update game board
            .then(() => {
                //update game board
                this.updateBoard();
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    updateFigure = (figure, new_x, new_y, new_z) => {
        //update figure position
        let figure_idx = figure.id-1; //figure.id has to be minimized by 1 as otherwise incorrect indexing within figures
        const newFigures = this.state.figures;
        newFigures[figure_idx] = {id: figure.id, position: {x: new_x, y: new_y, z: new_z}, owner: figure.owner, active: false};
        this.setState({figures: newFigures, refreshFigures: !this.state.refreshFigures}); //remove refreshFigures

        if(this.isTargetForMove(new_x, new_y, new_z)){
            fetch(`${getDomain()}/games/${this.state.gameId}/figures/${figure.id}`, {
                method: "PUT",
                headers: new Headers({
                    'Authorization': this.state.currentUserToken,
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(({
                    x: new_x,
                    y: new_y,
                    z: new_z,
                })),
            })
                .then(handleError)
                //should any interval be reestablished to call get fetches to update game board
                .then(() => {
                    //update game board
                    this.updateBoard();
                })
                .catch(err => {
                    catchError(err, this);
                });
        }
    };

    updateBuilding = (new_x, new_y, new_z) => { // update building setting according to new data structure from backend
        //updating current game board indication
        const newBuildings = this.state.buildings;
        let building_ids = newBuildings.map((building) => {return building.id});

        //update existing Building
        if(this.getBuilding(new_x, new_y, new_z) != null){
            let building = this.getBuilding(new_x, new_y, new_z);
            let correctBuildingIdx = building_ids.indexOf(building.id);
            newBuildings[correctBuildingIdx] = {id: building.id, position: {x: new_x, y: new_y, z: new_z}, owner: building.owner}
        }else{//create new building
            newBuildings.push({position: {x: new_x, y: new_y, z: new_z}});
        }
        this.setState({buildings: newBuildings});

        //posting request to Backend with new building
        if(this.isTargetForBuild(new_x, new_y, new_z)){
            fetch(`${getDomain()}/games/${this.state.gameId}/buildings`, {
                method: "POST",
                headers: new Headers({
                    'Authorization': this.state.currentUserToken,
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(({
                    x: new_x,
                    y: new_y,
                    z: new_z,
                })),
            })
                .then(handleError)
                .then(() => {
                    this.updateBoard();
                })
                .catch(err => {
                    catchError(err, this);
                });
        }
    };

    getPlayerName = (role) => {
        let filtered = this.state.players.filter((player) => { return player.role === role});
        return filtered.length > 0? filtered[0].username:'';
    };

    isPlayerChallenger = (role) => {
        let filtered = this.state.players.filter((player) => { return player.role === role});
        return filtered.length > 0? filtered[0].isChallenger:false;
    };

    getPlayerId = (role) => {
        let filtered = this.state.players.filter((player) => { return player.role === role});
        return filtered.length > 0? filtered[0].id:'';
    };

    createBoard = () => {
        let board = [];

        for (let y = 0; y < 5; y++) {
            let row = [];
            for (let x = 0; x < 5; x++) {
                row.push(<BoardField key={x} //can this be made easier, nicer???
                                     field_x_coordinate = {x}
                                     field_y_coordinate = {y}
                                     building={this.getBuilding(x,y)}
                                     figure={this.getFigure(x,y)}
                                     targetForMove={this.isTargetForMove(x,y)}
                                     targetForBuild={this.isTargetForBuild}
                                     targetForInitialMove={this.isTargetForInitialMove(x,y)}
                                     updateInitialFigure={this.updateInitialFigure}
                                     updateFigure={this.updateFigure}
                                     activateFigure={this.activateFigure}
                                     deactivateFigure={this.deactivateFigure}
                                     updateBuilding={this.updateBuilding}
                                     refreshFigures={this.state.refreshFigures} //refreshFigures can be removed
                                     currentUser={this.state.currentUser}
                                     currentTurn={this.state.currentTurn}
                                     getPossibleMoves={this.getPossibleMoves}
                />);
            }
            board.push(<BoardRow key={y}>{row}</BoardRow>);
        }
        return board.reverse();
    };

    updateBoard = () => {
        this.getGameState();
        this.getFigures();
        this.getBuildings();
    };

    componentDidMount() {
        this.setState({gameId: this.props.match.params.gamesId});
        this.intervalGameState = setInterval(this.getGameState, this.updateInterval);
        this.intervalFigures = setInterval(this.getFigures, this.updateInterval);
        this.intervalBuildings = setInterval(this.getBuildings, this.updateInterval);
    }

    componentWillUnmount() {
        this.clearingIntervalsAsGameFinished();
    }

    clearingIntervalsAsGameFinished() {
        clearInterval(this.intervalGameState);
        clearInterval(this.intervalFigures);
        this.intervalFigures = 0;
        clearInterval(this.intervalBuildings);
        this.intervalBuildings = 0;
    }

    surrenderGame = () => {
        fetch(`${getDomain()}/games/`+this.state.gameId+'/reject', {
            method: "POST",
            headers: new Headers({
                'Authorization': localStorage.getItem("token"),
                'Content-Type': 'application/x-www-form-urlencoded'
            })

        })
            .then(handleError)
            .then(() => {
                this.clearingIntervalsAsGameFinished();
                clearInterval(this.intervalUsers);
                clearInterval(this.intervalNotification);
                this.setState({loser: this.state.currentUser});
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    finishTurn = () =>{
        fetch(`${getDomain()}/games/`+this.state.gameId+'/finishTurn', {
            method: "POST",
            headers: new Headers({
                'Authorization': localStorage.getItem("token"),
                'Content-Type': 'application/x-www-form-urlencoded'
            })

        })
            .then(handleError)
            .then(() => {
                this.updateBoard();
            })
            .catch(err => {
                catchError(err, this);
            });

    };

    render() {
        return (
            <GameWrapper>
                <GameHeader currentTurn={Number(this.state.currentTurn)} surrenderGame={this.surrenderGame}/>
                <MainGame>
                    <PlayerSidebar
                        showInitialFig1={!this.state.firstInitialFigPlaced} //if complete no longer show initialFigures
                        showInitialFig2={!this.state.secondInitialFigPlaced}
                        figure={this.state.initialFigure}
                        getInitialMoves={this.getInitialMoves}
                        showBuildingParts={this.state.firstInitialFigPlaced && this.state.secondInitialFigPlaced}
                        building={this.state.newBuilding}
                        getPossibleBuilds={this.getPossibleBuilds}
                        refreshFigures={this.state.refreshFigures} //refreshFigures can be removed
                        currentUser={this.state.currentUser}
                        currentTurn={this.state.currentTurn}
                        name={this.getPlayerName('me')}
                        godcard={this.state.isGodPower?(this.isPlayerChallenger('me')?this.state.game.god1:this.state.game.god2):(this.isPlayerChallenger('me')?'god1':'god2')}
                        godcardDescription={this.state.isGodPower?godCards[this.isPlayerChallenger('me')?this.state.game.god1:this.state.game.god2]:''}
                        showFinishTurnButton={this.state.currentUser === this.state.currentTurn ? this.state.game.canFinishTurn : false}
                        finishTurn={this.finishTurn}
                    />
                        <GameBoard>
                            {this.createBoard()}
                        </GameBoard>
                <OpponentSidebar
                    name={this.getPlayerName('opponent')}
                    godcard={this.state.isGodPower?(this.isPlayerChallenger('opponent')?this.state.game.god1:this.state.game.god2):(this.isPlayerChallenger('opponent')?'god1':'god2')}
                    godcardDescription={this.state.isGodPower?godCards[this.isPlayerChallenger('opponent')?this.state.game.god1:this.state.game.god2]:''}
                />

                <WinNotification open={this.state.winner !== null} winner={this.state.winner}/>
                <LoseNotification open={this.state.loser !== null} loser={this.state.loser}/>
                </MainGame>
                <Error error={this.state.error}/>
            </GameWrapper>
        );
    }
}

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */

export default withRouter(DragDropContext(HTML5Backend)(Games));
