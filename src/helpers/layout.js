import styled from "styled-components";

export const DESKTOP_WIDTH = 1160;
export const SMALL_LAPTOPS_WIDTH = 970;
export const TABLETS_WIDTH = 750;
export const SMALL_WIDTH = 768;

export const COLOR_1 = '#191F44';
export const COLOR_2 = '#183F8C';
export const COLOR_3 = '#1F82BF';
export const COLOR_4 = '#759CBF';
export const COLOR_5 = '#F2F1F0';
export const COLOR_6 = '#E2E1E0';

export const BaseContainer = styled.div`
  margin-left: auto;
  padding-left: 15px;
  margin-right: auto;
  padding-right: 15px;
  max-width: ${DESKTOP_WIDTH}px;
  margin-bottom: 40px;
`;

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 300px;
  justify-content: center;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 60%;
  height: auto;
  font-size: 16px;
  font-weight: 300;
  padding: 30px 40px 40px;
  border-radius: 5px;
  background: ${COLOR_4};
  transition: opacity 0.5s ease, transform 0.5s ease;
  color: ${COLOR_5};
`;

export const InputField = styled.input`
  &::placeholder {
    color: ${COLOR_4};
  }
  height: 35px;
  padding-left: 15px;
  margin-left: -4px;
  border: none;
  border-radius: 20px;
  margin-bottom: 20px;
  background: ${COLOR_5};
  color: ${COLOR_3};
`;

export const Label = styled.label`
  color: ${COLOR_5};
  margin-bottom: 10px;
  text-transform: uppercase;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const Heading1 = styled.h1`
  color: ${COLOR_1};
  margin: 0 0 20px;
  text-align: center;
`;