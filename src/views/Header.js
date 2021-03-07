import React from "react";
import styled from "styled-components";

const Container = styled.div`
  height: ${props => props.height}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const Header = props => {
  return (
    <Container height={props.height}>
      <img src={process.env.PUBLIC_URL+"/assets/images/santorini_banner_logo.png"} alt="Logo"/>
    </Container>
  );
};

/**
 * Don't forget to export your component!
 */
export default Header;
