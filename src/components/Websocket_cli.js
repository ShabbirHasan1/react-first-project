import React, { Component } from "react";
import { connect } from "react-redux";
// const wss = new WebSocket('ws://localhost:8080');

class WebSocket_cli extends Component {
  // this.ws_ = new WebSocket('ws://localhost:8080');

  constructor(props) {
    super(props);
    this.messageList = [];
    this.ws_ = new WebSocket("ws://localhost:8080");
    // Connection opened
    this.ws_.addEventListener("open", (event) => {
      // this.ws_.send(JSON.stringify({ add_coin: "ETHUSDT" }));
      console.log(this.props.messges);
      setTimeout(() => {
        console.log(this.props.messges);
        this.props.messges.map((item) => {
          console.log(item.text);
          this.messageList.push(item);
        });
      }, 1000);
    });

    // Listen for messages
    this.ws_.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      this.add(event.data, "admin");
      try {
        
        let jsd = JSON.parse(event.data);
        this.props.coins.map((item, k) => {
          if (jsd['symbol'] == item['symbol']) {
            if (item['type'] == 'up' && jsd['coin_price'] > item['value']){
              this.props.dispatch({
                type: "del_coin",
                body: {
                  symbol: item['symbol'],
                  time_in: new Date().getTime(),
                },
              });
              alert(`Coin: ${jsd['symbol']} upper than ${item['value']}`);
            }

            if (item['type'] == 'dn' && jsd['coin_price'] < item['value']){
              this.props.dispatch({
                type: "del_coin",
                body: {
                  symbol: item['symbol'],
                  time_in: new Date().getTime(),
                },
              });
              alert(`Coin: ${jsd['symbol']} downer than ${item['value']}`);
            }
          }
        });
      } catch (error) {
        
      }
    });
  }

  send = () => {
    let input = document.getElementById("inputMessage");
    let input2 = document.getElementById("inputMessage2");
    let input3 = document.getElementById("inputMessage3");
    this.ws_.send(JSON.stringify({ add_coin: input.value }));
    this.props.dispatch({
      type: "new_coin",
      body: {
        type: input3.value,
        value: input2.value,
        symbol: input.value,
        time_in: new Date().getTime(),
      },
    });

    // this.add(input.value, "self");

    input.value = "";
  };

  add = (m, from) => {
    console.log(this.props);
    this.messageList.push({
      text: m,
      from: from,
      time_in: new Date().getTime(),
    });

    this.props.dispatch({
      type: "new_messages",
      body: {
        text: m,
        from: from,
        time_in: new Date().getTime(),
      },
    });
  };

  create = () => {
    let htmll;

    try {
      console.log(this.props.messges);

      this.messageList.map((item, k) => {
        try {
          console.log(item);
          htmll += `<h1>HI</h1>`;
          console.log("=======");
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }

    console.log(htmll);
    return (
      <div className="chatBox">
        <div className="messageBox">
          <span className="float-right">test self</span>
        </div>
        <div className="messageBox">
          <span className="float-left">test admin</span>
        </div>
        {htmll}
      </div>
    );
  };

  render() {
    return (
      <div className="center">
        <input
          type="text"
          id="inputMessage"
          placeholder="enter coin name"
        ></input>
        <input
          type="text"
          id="inputMessage2"
          placeholder="enter coin price"
        ></input>
        <select name="" id="inputMessage3" form="">
          <option value="up" selected>Upper</option>
          <option value="dn">Downer</option>
        </select>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={this.send}
        >
          ADD +
        </button>
        <h1>message : {this.props.lastMessage}</h1>
      </div>
    );
  }
}
//connects component with redux store state
const mapStateToProps = (state) => ({
  lastMessage: state.counterApp.lastm,
  messges: [...state.counterApp.messages],
  coins: [...state.counterApp.coins],
});

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(WebSocket_cli);
