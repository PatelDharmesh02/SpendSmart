import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --font-manrope: 'Manrope', sans-serif;
    --transition: all 0.3s ease;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: var(--font-manrope);
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.textPrimary};
    transition: var(--transition);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;