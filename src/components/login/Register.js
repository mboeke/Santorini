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
import {Button, ButtonSecondary} from "../../views/design/Button";
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
class Register extends React.Component {
  /**
   * If you don’t initialize the state and you don’t bind methods, you don’t need to implement a constructor for your React component.
   * The constructor for a React component is called before it is mounted (rendered).
   * In this case the initial state is defined in the constructor. The state is a JS object containing two fields: username and password
   * These fields are then handled in the onChange() methods in the resp. InputFields
   */
  constructor() {
    super();
    this.state = {
      name: null,
      username: null,
      password: null,
      error: [],
    };
  }
  /**
   * HTTP POST request is sent to the backend.
   * If the request is successful, a new user is returned to the front-end and its token is stored in the localStorage.
   */
  register() {
    this.setState({error: []});
    fetch(`${getDomain()}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: this.state.name,
        username: this.state.username,
        password: this.state.password
      })
    })
        .then(handleError)
        .then(response =>{
            this.props.history.push("/login");
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
            <Heading1>Register</Heading1>
            <Label>Name *</Label>
            <InputField
                id="name"
                placeholder="Enter here.."
                onChange={e => {
                this.handleInputChange("name", e.target.value);
              }}
            />
            <Label>Username *</Label>
            <InputField
                id="username"
                placeholder="Enter here.."
                onChange={e => {
                this.handleInputChange("username", e.target.value);
              }}
            />
            <Label>Password *</Label>
            <InputField
                id="password"
                type="password"
                placeholder="Enter here.."
                onChange={e => {
                this.handleInputChange("password", e.target.value);
              }}
            />
            <ButtonContainer>
              <Button
                disabled={!this.state.password || !this.state.username || !this.state.name}
                width="50%"
                onClick={() => {
                  this.register();
                }}
              >
                Register
              </Button>
            </ButtonContainer>
            <ButtonContainer>
              <ButtonSecondary
                  width="50%"
                  onClick={() => {
                    this.props.history.push("/login");

                  }}
              >
                Back to Login
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
export default withRouter(Register);
