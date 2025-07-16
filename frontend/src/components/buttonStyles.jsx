import styled from "styled-components";
import { Button } from "@mui/material";

export const RedButton = styled(Button)`
    && {
        background-color: #f00;
        color: white;
        margin-left: 4px;
        &:hover {
            background-color: #eb7979;
            border-color: #f26767;
            box-shadow: none;
        }
    }
`;

export const BlackButton = styled(Button)`
    && {
        background-color: #000000;
        color: white;
        margin-left: 4px;
        &:hover {
            background-color: #212020;
            border-color: #212020;
            box-shadow: none;
        }
    }
`;

export const DarkRedButton = styled(Button)`
    && {
        background-color: #650909;
        color: white;
        &:hover {
            background-color: #eb7979;
            border-color: #f26767;
            box-shadow: none;
        }
    }
`;

export const BlueButton = styled(Button)`
    && {
        background-color: #080a43;
        color: #fff;
        &:hover {
            background-color: #0a1e82;
        }
    }
`;

export const PurpleButton = styled(Button)`
    && {
        background-color: #270843;
        color: #fff;
        &:hover {
            background-color: #3f1068;
        }
    }
`;

export const LightPurpleButton = styled(Button)`
    && {
        background-color: #7f56da;
        color: #fff;
        &:hover {
            background-color: #7a1ccb;
        }
    }
`;

export const GreenButton = styled(Button)`
    && {
        background-color: #133104;
        color: #fff;
        &:hover {
            background-color: #266810;
        }
    }
`;

export const BrownButton = styled(Button)`
    && {
        background-color: #2c1006;
        color: white;
        &:hover {
            background-color: #40220c;
            border-color: #40220c;
            box-shadow: none;
        }
    }
`;

export const IndigoButton = styled(Button)`
    && {
        background-color: #2f2b80;
        color: white;
        &:hover {
            background-color: #534ea6;
            border-color: #473d90;
            box-shadow: none;
        }
    }
`;

export const PrimaryButton = styled(Button)`
    && {
        background-color: #36ae9a;
        color: #fff;
        margin-left: 4px;
        &:hover {
            background-color: #2a8a7a;
            border-color: #2a8a7a;
            box-shadow: none;
        }
    }
`;

export const SecondaryButton = styled(Button)`
    && {
        background-color: #ade9dc;
        color: #36ae9a;
        margin-left: 4px;
        &:hover {
            background-color: #7fdac2;
            border-color: #7fdac2;
            box-shadow: none;
        }
    }
`;

export const DangerButton = styled(Button)`
    && {
        background-color: #ff4b2b;
        color: #fff;
        margin-left: 4px;
        &:hover {
            background-color: #d43a1a;
            border-color: #d43a1a;
            box-shadow: none;
        }
    }
`;

export const SuccessButton = styled(Button)`
    && {
        background-color: #36ae9a;
        color: #fff;
        margin-left: 4px;
        &:hover {
            background-color: #267e6e;
            border-color: #267e6e;
            box-shadow: none;
        }
    }
`;

export const InfoButton = styled(Button)`
    && {
        background-color: #4facfe;
        color: #fff;
        margin-left: 4px;
        &:hover {
            background-color: #00f2fe;
            border-color: #00f2fe;
            box-shadow: none;
        }
    }
`;
