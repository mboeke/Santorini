import React from "react";
import styled from "styled-components";
import {BaseContainer, ButtonContainer, COLOR_1, COLOR_3, COLOR_5, DESKTOP_WIDTH} from "../../helpers/layout";
import {Button} from "../../views/design/Button";
import {getDomain} from "../../helpers/getDomain";
import {handleError} from "../../helpers/handleError";
import {catchError} from "../../helpers/catchError";
import Error from "../../helpers/Error";
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 40px;
  width: 500px;
  color: ${COLOR_1};
  border-radius: 4px;
  background-color: ${COLOR_5};
  z-index: 2;
  padding: 40px;
  box-shadow: 0 0 5px 0 rgba(143,143,143,1);
`;

const Invite_ButtonContainer = styled(ButtonContainer)`
  
`;

const Invite_Button = styled(Button)`
  margin-left: 10px;
`;

const GodCardWrapper = styled.div`
  margin-top: 10px;
`;

const GodCard = styled.img`
  border: 3px solid;
  width: 30%;
  margin: 0 .5%;
  border-color: ${props => props.selected?'yellow':'grey'};
`;

//only show if games not empty, if not then show first game object of list once accepted update game status and delete remaining games if there still exist any
//if accepted redirect user to "/games/{id}", if denied update server and delete game
class InvitationNote extends React.Component{
    constructor(){
        super();
        this.state = {
            show: false,
            inviting_user: null,
            invited_game: null,
            godCards: [],
            selectedGodCard: null,
            declinedByChallenger:false,
            gameId: false,
            error: [],
        };
        this._isMounted = false;
        this.checkInvitationInterval = 0;
        this.closeTimeout = null;
    }

    //only open notification pop-up if user actually invited to game (games is not empty) and the invited participant is the currently logged in user
    componentDidMount() {
        this._isMounted = true;
            }

    componentWillReceiveProps(nextProps) {
        if(this._isMounted && nextProps.open) { //length cannot be checked for if empty
            if(nextProps.games.length > 0) {
                let invited_game = nextProps.games.find((game) => game.user2 === Number(localStorage.getItem("user_id")));
                if (Number(invited_game.user2) === Number(localStorage.getItem("user_id"))) {
                    this.setState({show: true});
                    this.setState({inviting_user: this.props.users.map((user) => {return user.username})
                            [(this.props.users.map((user) => {return user.id}).indexOf(invited_game.user1))],
                        godCards: invited_game.godPowers,
                        gameId: invited_game.id
                    });
                }
                this.checkInvitationInterval = setInterval(this.checkInvitation,2000);
            }
        }else{
            this.setState({show: false,
                inviting_user: null,
                invited_game: null,
                godCards: [],
                selectedGodCard: null,
                declinedByChallenger:false,
                gameId: false,});
        }
    }

    checkInvitation = () => {
        if(this.state.gameId){
            fetch(`${getDomain()}/games/`+this.state.gameId, {
                method: "GET",
                headers: new Headers({
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                })
            })
                .then(handleError)
                .then(game => {
                    if(game.status === 'CANCELED'){
                        this.setState({
                            declinedByChallenger:true,

                        });
                        clearInterval(this.checkInvitationInterval);
                        this.closeTimeout = setTimeout(()=>{
                            this.setState({show: false,
                                inviting_user: null,
                                invited_game: null,
                                godCards: [],
                                selectedGodCard: null,
                                declinedByChallenger:false,
                                gameId: false,});
                            this.props.closeInvitationNote();
                        },4000);
                    }
                })
                .catch((err) => {catchError(err,this)})
        }
    };

    chooseGodCard = (name) => {
        this.setState({selectedGodCard:name});
    };

    render = () => { //indicate data about game in here as well as provide accept and deny button in here
        return(
            <PopupContainer show={this.state.show}>
                <Popup>
                    {this.state.declinedByChallenger?(
                        <h2>The game has been canceled by the challenger!</h2>
                    ):(
                        <div>
                            <h2>You have been invited to a game!</h2>
                            <div>
                            Inviting user: {this.state.inviting_user}
                            </div>
                            <div>
                            Game mode: {!this.props.isGodPower && this.props.demoMode ? "Demo Mode" : (this.props.isGodPower ? "Involving god powers" : "Without god powers")}
                        {this.props.isGodPower?(
                            <div>
                            <b>Choose your god card!</b>
                            <GodCardWrapper>
                            {this.state.godCards.map((godcard)=>(
                                <GodCard
                                    src={process.env.PUBLIC_URL+"/assets/godcards/"+godcard+".png"}
                                    selected={this.state.selectedGodCard === godcard}
                                    key={godcard}
                                    onClick={()=>{this.chooseGodCard(godcard)}}
                                    title={godCards[godcard]}
                                />
                            ))}
                            </GodCardWrapper>
                            </div>
                            ):('')}
                            </div>
                            <Invite_ButtonContainer>
                            <Invite_Button
                            color={"#37BD5A"}
                            disabled={this.props.isGodPower && this.state.selectedGodCard == null}
                            onClick={() => {
                            this.setState({show:false});
                            this.props.acceptingInvitation(this.state.gameId,this.state.selectedGodCard) //return id of game to parent component so that Lobby can post correct API endpoint
                        }}
                            >Accept</Invite_Button>
                            <Invite_Button
                            onClick={() => {
                            this.setState({show:false});
                            clearInterval(this.checkInvitationInterval);
                            this.props.denyingInvitation(this.props.games.find((game) => game.user2 === Number(localStorage.getItem("user_id"))))
                        }}>Deny</Invite_Button>
                            </Invite_ButtonContainer>
                        </div>
                    )}
                </Popup>
                <Error  error={this.state.error}/>
            </PopupContainer>
        )
    };

    componentWillUnmount() {
        this._isMounted = false;
        this.setState({show: false,
            inviting_user: null,
            invited_game: null,
            godCards: [],
            selectedGodCard: null,
            declinedByChallenger:false,
            gameId: false,});
        clearInterval(this.checkInvitationInterval);
        clearTimeout(this.closeTimeout);
    }
}

export default InvitationNote;