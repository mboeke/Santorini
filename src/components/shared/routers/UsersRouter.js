import React from "react";
import {Route, Switch} from "react-router-dom";
import Lobby from "../../game/Lobby";
import {ProfileGuard} from "../routeProtectors/ProfileGuard";
import {BaseContainer} from "../../../helpers/layout";
import Profile from "../../user/Profile";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Login from "./AppRouter";


class UsersRouter extends React.Component {
  render() {
    /**
     * "this.props.base" is "/app" because as been passed as a prop in the parent of UsersRouter, i.e., App.js
     */
    return (
      <BaseContainer>
        <Route
          exact
          path={`${this.props.base}/`}
          render={() =>
              <ProfileGuard>
                <Lobby />
              </ProfileGuard>}
        />
          <Route
              path={`${this.props.base}/:userId`}
              exact
              render={() => (
                  <ProfileGuard>
                      <Profile />
                  </ProfileGuard>
              )}
          />
      </BaseContainer>
    );
  }
}
/*
* Don't forget to export your component!
 */
export default UsersRouter;
