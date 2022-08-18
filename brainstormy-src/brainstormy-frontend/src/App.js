import { Switch, Route, BrowserRouter } from "react-router-dom";
import React, { useState } from 'react'
import "./App.css";
import LoginPage from "./components/LoginPage";
import firebase from 'firebase/app';
import Google from "./components/Google";
import CanvasContainer from "./components/CanvasContainer";
import Store from './Store'
import Navbar from './components/NavBar'
import Gallery from './components/Gallery'

function App() {
  return (
    <Store>
    <BrowserRouter>
    <Navbar />
      <div className="App">
        <header className="App-header">
            <Switch>
              <Route
                path="/"
                exact
                component={() => (
                  <LoginPage>   
                    <Google />
                  </LoginPage>
                )}
              />
              <Route path="/draw" exact component={CanvasContainer} />
              <Route path="/gallery" exact component={Gallery} />
            </Switch>
        </header>
      </div>
    </BrowserRouter>
    </Store>
  );
}

export default App;
