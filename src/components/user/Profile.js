import React from "react";
import styled from "styled-components";
import { BaseContainer, MainContainer, Main, Label, ButtonContainer, InputField } from "../../helpers/layout";
import { getDomain } from "../../helpers/getDomain";
import { withRouter } from "react-router-dom";
import {Button, ButtonSecondary} from "../../views/design/Button";
import { handleError } from "../../helpers/handleError";
import {catchError} from "../../helpers/catchError";
import {CustomDatePicker} from "../../views/design/DatePicker";
import "react-datepicker/dist/react-datepicker.css";
import Error from "../../helpers/Error";

/**
 * Classes in React allow you to have an internal state within the class and to have the React life-cycle for your component.
 * You should have a class (instead of a functional component) when:
 * - You need an internal state that cannot be achieved via props from other parent components
 * - You fetch data from the server (e.g., in componentDidMount())
 * - You want to access the DOM via Refs
 * https://reactjs.org/docs/react-component.html
 * @Class
 */
class Profile extends React.Component {
  /**
   * If you don’t initialize the state and you don’t bind methods, you don’t need to implement a constructor for your React component.
   * The constructor for a React component is called before it is mounted (rendered).
   * In this case the initial state is defined in the constructor. The state is a JS object containing two fields: username and password
   * These fields are then handled in the onChange() methods in the resp. InputFields
   */
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      username: '',
      name: '',
      password: '',
      password_confirm: '',
      createdOn: new Date(),
      status: '',
      birthday: new Date(),
      error: [],
    };
  }

  /**
   * HTTP POST request is sent to the backend.
   * If the request is successful, a new user is returned to the front-end and its token is stored in the localStorage.
   */
  update() {
    this.setState({isUpdated: true});
    fetch(`${getDomain()}/users/${this.state.id}`, {
      method: "PUT",
      headers: new Headers({
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        name: this.state.name,
        username: this.state.username,
        password: this.state.password,
        birthday: this.state.birthday,
      })
    }).then(handleError)
        .catch(err => {catchError(err,this)})
  }

  /**
   *  Every time the user enters something in the input field, the state gets updated.
   * @param key (the key of the state for identifying the field that needs to be updated)
   * @param value (the value that gets assigned to the identified state key)
   */
  handleInputChange(key, value) {
    // Example: if the key is password, this statement is the equivalent to the following one:
    // this.setState({'password': value});
    this.setState({[key]: value});
  }

  isLoggedInUser() {
    return parseInt(this.state.id, 10) === parseInt(localStorage.getItem("user_id"), 10);
  }

  /**
   * componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
   * Initialization that requires DOM nodes should go here.
   * If you need to load data from a remote endpoint, this is a good place to instantiate the network request.
   * You may call setState() immediately in componentDidMount().
   * It will trigger an extra rendering, but it will happen before the browser updates the screen.
   */
  componentDidMount() {

    // we get the user Id from the url params
    var userId = this.props.match.params.userId;

    // fetch user details for specific user
    fetch(`${getDomain()}/users/${userId}`, {
      method: "GET",
      headers: new Headers({
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
    })
        .then(handleError)
        .then(returnedUser => {

          // set all key, value paris in state
          for (var key in returnedUser) {
            this.handleInputChange(key, returnedUser[key]);
          }
        })
        .catch(err => {catchError(err,this)});
  }


  render() {

      return <BaseContainer>
          <MainContainer>
              {}
              <Main>
                  <Label>Name *</Label>
                  <InputField
                      id="name"
                      disabled={!this.isLoggedInUser()}
                      value={this.state.name}
                      onChange={e => {
                          this.handleInputChange("name", e.target.value);
                      }}
                  />
                  <Label>Username *</Label>
                  <InputField
                      id="username"
                      disabled={!this.isLoggedInUser()}
                      value={this.state.username}
                      onChange={e => {
                          this.handleInputChange("username", e.target.value);
                      }}
                  />
                  <Label>Date of Birth</Label>
                  <CustomDatePicker
                      id="birthday"
                      disabled={!this.isLoggedInUser()}
                      selected={this.state.birthday}
                      dateFormat="dd.MM.yyyy"
                      onChange={e => {
                          this.handleInputChange("birthday", e)
                      }}
                  />
                  <Label>Created</Label>
                  <CustomDatePicker
                      id="createdOn"
                      selected={this.state.createdOn}
                      dateFormat="dd.MM.yyyy"
                      disabled
                  />
                  <Label>Status</Label>
                  <InputField
                      id="status"
                      value={this.state.status}
                      disabled
                  />
                  <Label style={{display: this.isLoggedInUser() ? 'block' : 'none'}}
                  >New Password</Label>
                  <InputField
                      id="password"
                      type="password"
                      style={{display: this.isLoggedInUser() ? 'block' : 'none'}}
                      value={this.state.password}
                      onChange={e => {
                          this.handleInputChange("password", e.target.value);
                      }}
                  />
                  <Label style={{display: this.isLoggedInUser() ? 'block' : 'none'}}>
                      Confirm new Password</Label>
                  <InputField
                      id="password_confirm"
                      type="password"
                      style={{display: this.isLoggedInUser() ? 'block' : 'none'}}
                      value={this.state.password_confirm}
                      onChange={e => {
                          this.handleInputChange("password_confirm", e.target.value);
                      }}
                  />
                  <ButtonContainer>
                      <Button
                          disabled={!this.state.username || !this.state.name || !(this.state.password === this.state.password_confirm)}
                          width="50%"
                          style={{display: this.isLoggedInUser() ? 'block' : 'none'}}
                          onClick={() => {
                              this.update();
                          }}
                      >
                          Save Changes
                      </Button>
                  </ButtonContainer>
                  <ButtonContainer>
                      <ButtonSecondary
                          width="50%"
                          onClick={() => {
                              this.props.history.push("/users");

                          }}
                      >
                          Back to Overview
                      </ButtonSecondary>
                  </ButtonContainer>
                  <Error error={this.state.error}/>
              </Main>
          </MainContainer>
      </BaseContainer>
  }
}

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default withRouter(Profile);