import React from "react";
import styled from "styled-components";
import { Heading1, Main, MainContainer} from "../../helpers/layout";
import { getDomain } from "../../helpers/getDomain";
import Player from "../../views/Player";
import { Spinner } from "../../views/design/Spinner";
import {Button, ButtonSecondary} from "../../views/design/Button";
import {Link, Redirect, withRouter} from "react-router-dom";
import {handleError} from "../../helpers/handleError";
import {catchError} from "../../helpers/catchError";
import Error from "../../helpers/Error";
import GameInvite from "./GameInvite";
import InvitationNote from "./InvitationNote";
import Games from "./Games";

const Users = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const PlayerContainer = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HeaderContainer = styled.div`
  display: flex;
  position: relative;
`;

const LobbyHeading = styled(Heading1)`
  padding-left: 40px;
  padding-right: 40px;
  width: 100%;
`;

const UserProfileButton = styled(Button)`
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
`;

const CenteredDiv = styled.div`
  text-align: center;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
`;

class Lobby extends React.Component {
  constructor() {
    super();
    this.state = {
      current_user: Number(localStorage.getItem("user_id")),
      current_user_token: localStorage.getItem("token"),
      users: null,
      error: [],
      GameInviteUserId: null,
      invited_games: null,
      isGodPower:false,
      openInvitationNotification: false,
        demoMode: false,
    };
    this.intervalUsers = 0;
    this.intervalNotification = 0;
    this.updateInterval = 2000;
  }

  setUpdateIntervals = () => {
      clearInterval(this.intervalUsers);
      clearInterval(this.intervalNotification);
      this.intervalUsers = setInterval(this.fetchUsers, this.updateInterval);
      this.intervalNotification = setInterval(this.getNotification, this.updateInterval);
  };

  logout() {
    fetch(`${getDomain()}/users/logout`, {
      method: "GET",
      headers: new Headers({
        'Authorization': this.state.current_user_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
    })
        .then(handleError)
        .then(() => {
            clearInterval(this.intervalUsers);
            clearInterval(this.intervalNotification);
            localStorage.clear();
            this.props.history.push("/login")
        })
        .catch(err => {
          catchError(err, this);
        });
  }

  componentDidMount() {
      this.setUpdateIntervals();
      fetch(`${getDomain()}/users/${localStorage.getItem('user_id')}/games`, {
          method: "GET",
          headers: new Headers({
              'Authorization': localStorage.getItem("token"),
              'Content-Type': 'application/x-www-form-urlencoded'
          }),
      })
      .then(handleError)
      .then(games => {
            if(games.length > 0){
                let startedGames = games.filter((game)=>{return game.status === 'STARTED'});
                if(startedGames.length > 0){
                    clearInterval(this.intervalUsers);
                    clearInterval(this.intervalNotification);
                    this.props.history.push("/games/"+startedGames[0].id);
                }
            }
      })
      .catch(err => {
          catchError(err,this);
      });
  }

  fetchUsers = () => {
    fetch(`${getDomain()}/users`, {
      method: "GET",
      headers: new Headers({
        'Authorization': this.state.current_user_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
    })
        .then(handleError)
        .then( users => {
          this.setState({ users: users });
          let activeUserID = this.state.current_user;
          let activeUser = users.filter(function(user){return user.id === activeUserID})[0];
          localStorage.setItem('userStatus',activeUser.status);

        })
        .catch(err => {
          catchError(err,this);
        });
  };

  sort_users(){ //sort all online users from A to Z, then all playing/challenged users from A to Z & then all offline users from A to Z; first status then name descending
      const data = [].concat(this.state.users);
      data.splice(data.map((user) => {return user.id}).indexOf(this.state.current_user),1);
      data.sort((user_a, user_b) => (user_a.username > user_b.username) ? 1 : -1);
      data.sort((user_a, user_b) => (user_b.status === 'PLAYING' || user_b.status === 'CHALLENGED') ? 1 : -1);
      data.sort((user_a, user_b) => ((user_b.status === 'OFFLINE') ? -1 : 1));
      data.sort((user_a, user_b) => (user_a.status === 'ONLINE' ? -1 : 1));
      return data;
  }

  getNotification = () => { //once notification received indicate notification pop-up; what happens if pop-up is already open or about to be opened
    fetch(`${getDomain()}/games/invitations`, {
      method: "GET",
      headers: new Headers({
        'Authorization': this.state.current_user_token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
    })
        .then(handleError)
        .then(games => {
          if(games.length > 0){ //if games has at least one element the following shall be performed
            clearInterval(this.intervalNotification);
            clearInterval(this.intervalUsers);
            this.setState({invited_games: games, openInvitationNotification: true, isGodPower: games[0].isGodPower, demoMode: games[0].demoMode === 1});
          } //Git change
        })
        .catch(err => {
          catchError(err,this);
        });
  };

  invitationAccepted = (id,selectedGodPower) => {
      if(this.state.demoMode){
          fetch(`${getDomain()}/games/demo/` + id + `/accept`, {
              method: "POST",
              headers: new Headers({
                  'Authorization': this.state.current_user_token,
                  'Content-Type': 'application/json'
              }),
          })
              .then(handleError)
              .then(game => {
                  clearInterval(this.intervalUsers);
                  clearInterval(this.intervalNotification);
                  this.setState({openInvitationNotification: false});
                  this.props.history.push({
                      pathname: '/games/' + id,
                      state: game,
                  })
              })
              .catch(err => {
                  catchError(err, this);
              });
      }else{
          fetch(`${getDomain()}/games/` + id + `/accept`, {
              method: "POST",
              headers: new Headers({
                  'Authorization': this.state.current_user_token,
                  'Content-Type': 'application/json'
              }),
              body:JSON.stringify({
                  selectedGodPower: selectedGodPower
              })
          })
              .then(handleError)
              .then(game => {
                  clearInterval(this.intervalUsers);
                  clearInterval(this.intervalNotification);
                  this.setState({openInvitationNotification: false});
                  this.props.history.push({
                      pathname: '/games/' + id,
                      state: game,
                  })
              })
              .catch(err => {
                  catchError(err, this);
              });
      }
  };

  //only needed if user denies invitation, then close notification of invitation & restart fetch-loops of getting users and notifications, send denial request to backend
  invitationDenied = (denied_game) => {
      fetch(`${getDomain()}/games/` + denied_game.id + `/reject`, {
          method: "POST",
          headers: new Headers({
              'Authorization': this.state.current_user_token,
              'Content-Type': 'application/x-www-form-urlencoded'
          }),
      })
          .then(handleError)
          .then( () => { //restarting fetch intervals
              this.closeInvitationNote()
          })
          .catch(err => {
              catchError(err, this);
          });
  };

  closeInvitationNote = () => {
      this.setState({invited_games: null, openInvitationNotification: false});
      this.setUpdateIntervals();
  };

  invite = (userId) =>{
    clearInterval(this.intervalUsers);
    clearInterval(this.intervalNotification);
    this.setState({
      GameInviteUserId: userId,
    });
  };

  closeInvite = () => {
    this.setState({
      GameInviteUserId: null,
    });
    this.setUpdateIntervals();
  };

  saveInvite = (isGodPower) => {//send accepting request to backend
    fetch(`${getDomain()}/games/`, {
      method: "POST",
      headers: new Headers({
        'Authorization': this.state.current_user_token,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        user1: this.state.current_user,
        user2: this.state.GameInviteUserId,
        isGodPower: isGodPower,
      })
    })
        .then(handleError)
        .then( game => {
          this.setState({
            GameInviteUserId: null,
          });
          this.setUpdateIntervals();
        })
        .catch(err => {
          catchError(err, this);
        });
  };

  invitationBlocked = (otherUserId) => {
      if(localStorage.getItem('userStatus') !== 'ONLINE') return true;
      return this.state.users.filter(function(user){return user.id === otherUserId})[0].status !== 'ONLINE';

  };

  componentWillUnmount() {
      clearInterval(this.intervalUsers);
      clearInterval(this.intervalNotification);
  }

    render() {
    return (
      <MainContainer>
        <Main>
          <HeaderContainer>
            <LobbyHeading>User Lobby</LobbyHeading>
            {this.state.users ? (
                <UserProfileButton
                    onClick={() => {
                        this.props.history.push("/users/" + this.state.current_user)
                    }}
                >{this.state.users.map((user) => {
                  return user.username
                })[(this.state.users.map((user) => {
                  return user.id
                }).indexOf(this.state.current_user))]}</UserProfileButton>
            ) : ("")}
          </HeaderContainer>
          {!this.state.users ? (
              <SpinnerContainer>
                <Spinner/>
              </SpinnerContainer>
          ) : (
            <CenteredDiv>
              <Users>
                {this.sort_users().map(user => {
                  return (
                    <PlayerContainer key={user.id}>
                      <Player user={user} invite={this.invite} invitationBlocked={this.invitationBlocked}/>
                    </PlayerContainer>
                  );
                })}
              </Users>
              <GameInvite userId={this.state.GameInviteUserId} closePopup={this.closeInvite} saveInvite={this.saveInvite}/>
              <InvitationNote
                  open={this.state.openInvitationNotification}
                  games={this.state.invited_games}
                  users={this.state.users}
                  isGodPower={this.state.isGodPower}
                  acceptingInvitation={this.invitationAccepted}
                  denyingInvitation={this.invitationDenied}
                  closeInvitationNote={this.closeInvitationNote}
                  demoMode={this.state.demoMode}
              />
              <ButtonSecondary
                width="50%"
                onClick={() => {
                  this.logout();
                }}
              >
                Logout
              </ButtonSecondary>
            </CenteredDiv>
          )}
          <Error error={this.state.error}/>
        </Main>
      </MainContainer>
    );
  }
}

export default withRouter(Lobby);
