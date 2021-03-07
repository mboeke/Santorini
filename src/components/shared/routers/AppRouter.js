import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { GameGuard } from "../routeProtectors/GameGuard";
import UsersRouter from "./UsersRouter";
import { LoginGuard } from "../routeProtectors/LoginGuard";
import Login from "../../login/Login";
import Register from "../../login/Register";
import Profile from "../../user/Profile";
import {ProfileGuard} from "../routeProtectors/ProfileGuard";
import GameInvite from "../../game/GameInvite";
import GamesRouter from "./GamesRouter";
import Header from "../../../views/Header";


/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reacttraining.com/react-router/web/guides/quick-start
 */
class AppRouter extends React.Component {
  render() {
    return (
      <BrowserRouter>
          <Switch>
              <Route
                  path="/users"
                  render={() => (
                      <GameGuard>
                          <div>
                          <Header height={"200"} />
                          <UsersRouter base={"/users"}/>
                          </div>
                      </GameGuard>
                  )}
              />
              <Route
                  path="/login"
                  exact
                  render={() => (
                      <LoginGuard>
                          <div>
                          <Header height={"200"} />
                          <Login/>
                          </div>
                      </LoginGuard>
                  )}
              />
              <Route
                  path="/register"
                  exact
                  render={() => (
                      <div>
                      <Header height={"200"} />
                      <Register/>
                      </div>
                  )}
              />
              <Route
                  path="/games"
                  render={() => (
                      <GameGuard>
                          <GamesRouter base={"/games"}/>
                      </GameGuard>
                  )}
              />
              <Route path="/" exact render={() => <Redirect to={"/users"}/>}/>
          </Switch>
      </BrowserRouter>
    );
  }
}
/*
* Don't forget to export your component!
 */
export default AppRouter;
