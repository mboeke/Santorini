import React from "react";
import {
    BaseContainer,
    InputField,
    Label,
    ButtonContainer,
    Heading1, Main, MainContainer
} from "../../helpers/layout";
import { getDomain } from "../../helpers/getDomain";
import { withRouter } from "react-router-dom";
import { Button } from "../../views/design/Button";
import { ButtonSecondary } from "../../views/design/Button";
import { handleError } from "../../helpers/handleError";
import Error from "../../helpers/Error";
import {catchError} from "../../helpers/catchError";
/**
 * Classes in React allow you to have an internal state within the class and to have the React life-cycle for your component.
 * You should have a class (instead of a functional component) when:
 * - You need an internal state that cannot be achieved via props from other parent components
 * - You fetch data from the server (e.g., in componentDidMount())
 * - You want to access the DOM via Refs
 * https://reactjs.org/docs/react-component.html
 * @Class
 */
class Login extends React.Component {
  /**
   * If you don’t initialize the state and you don’t bind methods, you don’t need to implement a constructor for your React component.
   * The constructor for a React component is called before it is mounted (rendered).
   * In this case the initial state is defined in the constructor. The state is a JS object containing two fields: username and password
   * These fields are then handled in the onChange() methods in the resp. InputFields
   */
  constructor() {
    super();
    this.state = {
      username: null,
      password: null,
      error: []
    };
  }
  /**
   * HTTP POST request is sent to the backend.
   * If the request is successful, a new user is returned to the front-end and its token is stored in the localStorage.
   */
  login() {
    this.setState({error: []});
    fetch(`${getDomain()}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: this.state.password,
        username: this.state.username,
      })
    })
    .then(handleError)
    .then(response => {

     // store the token in the localStorage of the browser. Token is used for authentication in every subsequent request.
     localStorage.setItem("token", response.token);

     // decode the returned token parse it to json and save user_id into localStorage
      var decodedToken = JSON.parse(atob(response.token));
     localStorage.setItem("user_id", decodedToken.user_id);
        fetch(`${getDomain()}/users/`+localStorage.getItem('user_id'), {
            method: "GET",
            headers: new Headers({
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(handleError)
            .then( user=> {
                localStorage.setItem('userStatus',user.status);
                this.props.history.push("/users");
            })
            .catch(err => {
                catchError(err,this);
            });
    })
    .catch(err => {
        catchError(err,this);
    });
  }

  /**
   *  Every time the user enters something in the input field, the state gets updated.
   * @param key (the key of the state for identifying the field that needs to be updated)
   * @param value (the value that gets assigned to the identified state key)
   */
  handleInputChange(key, value) {
    // Example: if the key is password, this statement is the equivalent to the following one:
    // this.setState({'password': value});
    this.setState({ [key]: value });
  }

  /**
   * componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
   * Initialization that requires DOM nodes should go here.
   * If you need to load data from a remote endpoint, this is a good place to instantiate the network request.
   * You may call setState() immediately in componentDidMount().
   * It will trigger an extra rendering, but it will happen before the browser updates the screen.
   */
  componentDidMount() {}

  render() {
    return (
      <BaseContainer>
        <MainContainer>
          <Main>
              <Heading1>Login</Heading1>
            <Label>Username</Label>
            <InputField id="username"
              placeholder="Enter here.."
              onChange={e => {
                this.handleInputChange("username", e.target.value);
              }}
            />
            <Label>Password</Label>
            <InputField  id="password"
              placeholder="Enter here.."
              type="password"
              onChange={e => {
                this.handleInputChange("password", e.target.value);
              }}
            />
            <ButtonContainer>
              <Button
                disabled={!this.state.password || !this.state.username}
                width="50%"
                onClick={() => {
                  this.login();
                }}
              >
                Login
              </Button>
            </ButtonContainer>
            <ButtonContainer>
              <ButtonSecondary
              width="50%"
              onClick={() => {
              this.props.history.push("/register");

            }}
              >
              Register new user
              </ButtonSecondary>
            </ButtonContainer>
            <Error error={this.state.error}/>
          </Main>
        </MainContainer>
      </BaseContainer>
    );
  }
}

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default withRouter(Login);
