import React from "react";
import styled from "styled-components";
import {ButtonContainer, COLOR_1, COLOR_2, COLOR_3, COLOR_5, InputField} from "../../helpers/layout";
import {Button} from "../../views/design/Button";
import {getDomain} from "../../helpers/getDomain";
import {handleError} from "../../helpers/handleError";
import {catchError} from "../../helpers/catchError";
import {Spinner} from "../../views/design/Spinner";
import Error from "../../helpers/Error";
import {withRouter} from "react-router-dom";
import {godCards} from "../../helpers/godCards";

const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: ${props => props.show?'block':'none'};
  background-color: rgba(50,50,50,0.5);
`;

const Popup = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-height: 40px;
  width: 600px;
  color: ${COLOR_1};
  border-radius: 4px;
  background-color: ${COLOR_5};
  z-index: 2;
  padding: 40px;
  box-shadow: 0 0 5px 0 rgba(143,143,143,1);
`;

const Button_MargRight = styled(Button)`
  margin-right: 10px;
`;

const GodCardWrapper = styled.div`
  margin-top: 10px;
`;

const GodCard = styled.img`
  border: 3px solid;
  width: 19%;
  margin: 0 .5%;
  border-color: ${props => props.selected?'yellow':'grey'};
`;

class GameInvite extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            show:false,
            isGodPower:false,
            showSpinner: false,
            invitationStatus: 'OPEN',
            error: [],
            waitingInfo: 'Waiting for player to accept invitation',
            godCards: [
                {name: 'apollo', selected:false, user: null},
                {name: 'artemis', selected:false, user: null},
                {name: 'athena', selected:false, user: null},
                {name: 'atlas', selected:false, user: null},
                {name: 'demeter', selected:false, user: null},
                {name: 'hephaestus', selected:false, user: null},
                {name: 'hermes', selected:false, user: null},
                {name: 'minotaur', selected:false, user: null},
                {name: 'pan', selected:false, user: null},
                {name: 'prometheus', selected:false, user: null},
            ]
        };
        this._isMounted = false;
        this.checkInvitationInterval = null;
        this.startedTimeout = null;
        this.canceledTimeout = null;

    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillReceiveProps(nextProps) {
        if(this._isMounted){
            if(nextProps.userId !== null && (nextProps.userId !== this.props.userId)){
                this.setState({show:true});
            }
        }
    }

    sendInvitation = () => {//send accepting request to backend
        fetch(`${getDomain()}/games/`, {
            method: "POST",
            headers: new Headers({
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                user1: localStorage.getItem('user_id'),
                user2: this.props.userId,
                isGodPower: this.state.isGodPower,
                godCards: this.getSelectedGodCards(),
            })
        })
            .then(handleError)
            .then( game => {
                this.setState({
                    invitationStatus: 'SENT',
                    showSpinner:true,
                });
                localStorage.setItem('gamePath',game.path);
                clearInterval(this.checkInvitationInterval);
                this.checkInvitationInterval = setInterval(this.checkInvitation,2000);
            })
            .catch(err => {
                catchError(err, this);
            });
    };

    sendGameDemoInvitation = () => {
        fetch(`${getDomain()}/games/demoXWins`, {
            method: "POST",
            headers: new Headers({
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                user1: localStorage.getItem('user_id'),
                user2: this.props.userId,
                isGodPower: false,
                godCards: this.getSelectedGodCards(),
            })
        })
            .then(handleError)
            .then( game => {
                this.setState({
                    invitationStatus: 'SENT',
                    showSpinner:true,
                });
                localStorage.setItem('gamePath', 'games/'+game.id);
                clearInterval(this.checkInvitationInterval);
                this.checkInvitationInterval = setInterval(this.checkInvitation,2000);
            })
            .catch(err => {
                catchError(err, this);
            });

    };

    closePopup = () => {
        if(this.state.invitationStatus === 'SENT'){
            fetch(`${getDomain()}/`+localStorage.getItem('gamePath')+'/reject', {
                method: "POST",
                headers: new Headers({
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                })
            })
                .then(handleError)
                .then(()=>{
                   this.cleanup();
                })
                .catch(err => {catchError(err,this)})
        }
        this.setState({
            isGodPower:false,
            showSpinner: false,
            invitationStatus: 'OPEN',
            error: [],
            show:false,
            waitingInfo: 'Waiting for player to accept invitation',
        });
        localStorage.removeItem('gamePath');
        this.cleanup();
        this.props.closePopup();
    };

    checkInvitation = () => {
        fetch(`${getDomain()}/`+localStorage.getItem('gamePath'), {
            method: "GET",
            headers: new Headers({
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            })
        })
                .then(handleError)
                .then(game => {
                    if(game.status === 'STARTED'){
                        this.setState({
                            waitingInfo:'The User accepted your Invitation. Enjoy Santorini!',
                            invitationStatus: 'ACCEPTED'
                        });
                        clearInterval(this.checkInvitationInterval);
                        this.startedTimeout = setTimeout(()=>{
                            this.props.history.push('/' + localStorage.getItem('gamePath'));
                            //this.props.history.push('/'+localStorage.getItem('gamePath'))
                        },4000);
                    }
                    if(game.status === 'CANCELED'){
                        this.setState({
                            waitingInfo:'The User declined your Invitation. Sorry!',
                            invitationStatus: 'OPEN'

                        });
                        clearInterval(this.checkInvitationInterval);
                        this.canceledTimeout = setTimeout(()=>{
                            this.closePopup();
                            },4000);
                    }
                })
                .catch((err) => {catchError(err,this)})
        };

    getSelectedGodCards = () => {
        return  this.state.godCards.filter((card) => {return card.selected});
    };

    handleGodCardSelect = (name) => {
        let changedCard = this.state.godCards.filter((card) => {return card.name === name})[0];
        let selectedCards = this.getSelectedGodCards();
        let newCards = this.state.godCards.slice();
        let index = newCards.indexOf(changedCard);
        changedCard.selected = !changedCard.selected && selectedCards.length < 2;
        newCards[index] = changedCard;
        this.setState({godCards: newCards});
    };

    render = () => {
        return(
            <PopupContainer show={this.state.show}>
                <Popup>
                    {this.state.showSpinner ?(
                        <div>
                            <h2>{this.state.waitingInfo}</h2>
                            <Spinner color={COLOR_2}/>
                        </div>
                    ):(
                        <div>
                            <h2>Challenge user</h2>
                            <select onChange={e => {this.setState({"isGodPower": e.target.value === 'true', demoMode: e.target.value === 'gameDemo'});}}>
                                <option value={false}>Without Godcards</option>
                                <option value={true}>With Godcards</option>
                                <option value={'gameDemo'}>Game Demo - fast forward</option>
                            </select>
                            {this.state.isGodPower?(
                                <GodCardWrapper>
                                    {this.state.godCards.map((godcard)=>(
                                        <GodCard
                                            src={process.env.PUBLIC_URL+"/assets/godcards/"+godcard.name+".png"}
                                            selected={godcard.selected}
                                            user={godcard.user}
                                            name={godcard.name}
                                            key={godcard.name}
                                            onClick={()=>{this.handleGodCardSelect(godcard.name)}}
                                            title={godCards[godcard.name]}
                                        />
                                    ))}
                                </GodCardWrapper>
                            ):('')}
                        </div>
                    )}
                    <ButtonContainer>
                    {this.state.showSpinner? (""):(
                        <Button_MargRight
                            disabled={this.state.isGodPower && this.getSelectedGodCards().length  !== 2}
                            color={"#37BD5A"}
                            onClick={()=>{this.state.demoMode ? this.sendGameDemoInvitation() : this.sendInvitation()}}
                        >Challenge</Button_MargRight>
                    )}
                    <Button disabled={this.state.invitationStatus === 'ACCEPTED'} onClick={()=>{this.closePopup()}}>Close</Button>
                    </ButtonContainer>
                </Popup>
                <Error  error={this.state.error}/>
            </PopupContainer>
        )
    };

    cleanup = () => {
        clearInterval(this.checkInvitationInterval);
        clearTimeout(this.startedTimeout);
        clearTimeout(this.canceledTimeout);
    };

    componentWillUnmount() {
        this._isMounted = false;
        this.cleanup();
    }
}

export default withRouter(GameInvite);