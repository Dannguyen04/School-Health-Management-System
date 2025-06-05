import styled from "styled-components";

// Container for the whole page
export const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f5f7;
`;

export const FormContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 1200px;
  max-width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: row;
  // hidden form sign up
  &.signin-active .sign-up-container {
    transform: translateX(0);
    opacity: 0;
    z-index: 1;
  }

  &.signin-active .sign-in-container {
    transform: translateX(0);
    opacity: 1;
    z-index: 5;
  }

  &.signin-active .overlay-container {
    transform: translateX(0);
  }

  &.signin-active .overlay {
    left: -100%;
    transform: translateX(50%);
  }

  // hidden form sign in
  &.signup-active .sign-in-container {
    transform: translateX(100%);
    opacity: 0;
    z-index: 1;
  }

  &.signup-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  }

  &.signup-active .overlay-container {
    transform: translateX(-100%);
  }

  &.signup-active .overlay {
    left: 0%;
    transform: translateX(0);
  }
`;

export const SignUpContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  width: 50%;
  max-width: 600px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0 50px;
  transition: all 0.5s ease-in-out;
`;

export const SignInContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  width: 50%;
  max-width: 600px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0 50px;
  transition: all 0.5s ease-in-out;
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.5s ease-in-out;
  z-index: 100;
`;

export const Overlay = styled.div`
  background: #ff416c;
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  height: 100%;
  width: 200%;
  transition: transform 0.5s ease-in-out;
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.5s ease-in-out;
  z-index: 101;
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  max-width: 520px;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 2.5vw;
  font-weight: bold;
  margin: 0;
`;

export const InputStyled = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  max-width: 500px;
  color: #000;
`;

export const Button = styled.button`
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  margin-top: 10px;
  &:hover {
    background-color: #ff3a2b;
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: #ffffff;
`;

export const SocialContainer = styled.div`
  margin: 20px 0;
`;

export const SocialButton = styled.a`
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
  color: #333333;
`;

export const Paragraph = styled.p`
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.5px;
  margin: 20px 0 10px;
`;

export const ErrorMessage = styled.span`
  color: red;
  font-size: 12px;
`;
