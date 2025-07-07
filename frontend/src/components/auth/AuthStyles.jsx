import styled from "styled-components";
import { createGlobalStyle } from 'styled-components';

// Container for the whole page
export const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f5f7;
`;

export const PageCenter = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f5f7;
`;

export const FormContainer = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 6px 32px rgba(255,65,108,0.10), 0 0 0 4px rgba(255,75,43,0.08);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44px 36px 36px 36px;
  margin: 0 auto;
  border: 2px solid transparent;
  box-shadow: 0 8px 40px 0 rgba(255,65,108,0.13), 0 1.5px 8px 0 rgba(255,75,43,0.10);
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 12px 48px 0 rgba(255,65,108,0.18), 0 2px 12px 0 rgba(255,75,43,0.13);
    border-color: #36AE9A;
  }
  @media (max-width: 480px) {
    max-width: 98vw;
    padding: 24px 8px;
    border-radius: 0;
    box-shadow: none;
  }
`;

export const Form = styled.form`
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 340px;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 2.1rem;
  font-weight: bold;
  margin: 0 0 12px 0;
  background: linear-gradient(90deg, #36AE9A 0%, #36AE9A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 1px;
`;

export const InputStyled = styled.input`
  background-color: #f7f7fa;
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 13px 16px;
  margin: 10px 0;
  width: 100%;
  max-width: 500px;
  color: #222;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 2px solid #ff416c;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,65,108,0.10);
  }
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
  width: 100%;
  max-width: 100%;
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 12px 0;
  }
`;

export const Paragraph = styled.p`
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 0.2px;
  margin: 12px 0 18px 0;
  color: #555;
`;

export const ErrorMessageDiv = styled.div`
  color: #D8000C;
  background: #FFD2D2;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  text-align: center;
  font-size: 1rem;
`;

export const ErrorMessage = styled.p`
  color: #D8000C;
  background-color: #FFD2D2;
  border: 1px solid #D8000C;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 13px;
  margin-top: 5px;
  font-weight: bold;
`;

export const LargeButton = styled.button`
  border-radius: 24px;
  border: none;
  background: linear-gradient(90deg, #36AE9A 0%, #36AE9A 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 16px 0;
  width: 100%;
  margin-top: 18px;
  letter-spacing: 1px;
  transition: background 0.2s, box-shadow 0.2s;
  text-transform: uppercase;
  box-shadow: 0 2px 12px rgba(255,65,108,0.10);
  cursor: pointer;
  &:hover {
    background: linear-gradient(90deg,rgb(17, 90, 78) 0%,rgb(20, 80, 70) 100%);
    box-shadow: 0 4px 20px rgba(255,65,108,0.18);
    filter: brightness(1.08);
  }
`;

export const MobileSwitchButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: block;
    background: none;
    border: none;
    color: #ff4b2b;
    font-weight: bold;
    margin-top: 16px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: underline;
  }
    
`;

export const FullScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff512f 0%, #dd2476 100%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

export const CenteredBox = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 48px 32px 32px 32px;
  min-width: 340px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (max-width: 480px) {
    min-width: unset;
    max-width: 95vw;
    padding: 24px 8px;
    border-radius: 0;
    box-shadow: none;
  }
`;