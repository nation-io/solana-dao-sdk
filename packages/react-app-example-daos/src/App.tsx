import React from "react";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DaoProvider } from "./providers/DaoProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Homepage } from "./components/HomePage";
import { DaoPage } from "./components/DaoPage";

const theme = createTheme();

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <DaoProvider>
        <BrowserRouter>
          <Container data-testId="container">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/daos/:id" element={<DaoPage />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </DaoProvider>
    </ThemeProvider>
  );
};

export default App;
