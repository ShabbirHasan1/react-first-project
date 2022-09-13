import React, {Component} from 'react';

import logo from './logo.svg';
import './App.css';
import Counter from './components/Counter';
import Websocket_cli from './components/Websocket_cli';

class App extends Component {
  render() {
    return (
      <div className="App">

        <Websocket_cli/>
      </div>
    );
  }
}

export default App;
