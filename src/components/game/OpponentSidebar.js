import React from "react";
import styled from "styled-components";
import {COLOR_5} from "../../helpers/layout";
import {GodCard, SidebarHeader} from "./PlayerSidebar";

const Sidebar = styled.div`
  width: 270px;
  margin-left: 20px;
  background-color: ${COLOR_5};
`;
export const OpponentSidebar = (props) => {
    return(
        <Sidebar>
            <SidebarHeader>
                <h2>{props.name}</h2>
                <GodCard src={process.env.PUBLIC_URL+"/assets/godcards/"+props.godcard+".png"} title={props.godcardDescription}/>
            </SidebarHeader>
        </Sidebar>
    );
};

