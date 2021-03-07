import React, { Component } from "react";
import Header from "./views/Header";
import AppRouter from "./components/shared/routers/AppRouter";
import styled from "styled-components";

const Wrapper = styled.div`
  height: inherit;
  background-image: url(${process.env.PUBLIC_URL+"/assets/images/santorini_background.jpg"});
  background-size: 120% auto;
  background-position: 50% 20%;
  overflow-y: scroll;
  overflow-x: hidden;
`;
/**
 * Happy coding!
 * React Template by Lucas Pelloni
 */
class App extends Component {
  render() {
    return (
      <Wrapper>
        <AppRouter />
      </Wrapper>
    );
  }
}

export default App;
