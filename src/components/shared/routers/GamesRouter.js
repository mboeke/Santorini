import React from "react";
import styled from "styled-components";
import {Route, Switch} from "react-router-dom";
import Lobby from "../../game/Lobby";
import {ProfileGuard} from "../routeProtectors/ProfileGuard";
import {BaseContainer} from "../../../helpers/layout";
import Profile from "../../user/Profile";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Login from "./AppRouter";
import Games from "../../game/Games";
import {GameGuard} from "../routeProtectors/GameGuard";

const GameContainer = styled(BaseContainer)`
  padding: 0 20px;
  height: 100%;
  max-width: 95%;
  margin-bottom: 0;
`;

class GamesRouter extends React.Component {
  render() {
    return (
      <GameContainer>
        <Route
          exact
          path={`${this.props.base}/:gamesId`}
          render={() =>
              <GameGuard>
                <Games />
              </GameGuard>}
        />
      </GameContainer>
    );
  }
}
/*
* Don't forget to export your component!
 */
export default GamesRouter;
