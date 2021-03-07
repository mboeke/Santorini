import styled from "styled-components";
import DatePicker from "react-datepicker";
import {COLOR_3, COLOR_4, COLOR_5} from "../../helpers/layout";
export const CustomDatePicker = styled(DatePicker)`
  &::placeholder {
    color: ${COLOR_4};
  }
  height: 35px;
  width: 583px;
  padding-left: 15px;
  margin-left: -4px;
  border: none;
  border-radius: 20px;
  margin-bottom: 20px;
  background: ${COLOR_5};
  color: ${COLOR_3};
`;