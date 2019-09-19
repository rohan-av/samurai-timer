import React from "react";
import ReactDOM from "react-dom";
import Timer from "react-compound-timer";
import KeyboardEventHandler from "react-keyboard-event-handler";
import "./styles.css";

let players = [];
let lives = [];
let duration = -1;
let turn = 0;
let playerPointer = 0;

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.stage = -1;
    this.finished = false;
    this.noOfPlayers = -1;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextInput = "Enter Duration: ";
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    //alert("A name was submitted: " + this.state.value);
    if (this.stage === -1) {
      duration = parseInt(this.state.value);
      this.stage += 1;
      console.log(duration);
      this.nextInput = "Enter No. of Players: ";
    } else if (this.stage === 0) {
      this.noOfPlayers = parseInt(this.state.value);
      console.log(this.noOfPlayers);
      this.stage += 1;
      this.nextInput = "Enter Player Names: ";
    } else if (this.noOfPlayers !== 0 && this.stage === 1) {
      players.push(this.state.value);
      lives.push(5);
      console.log(players.toString());
      this.noOfPlayers -= 1;
      if (this.noOfPlayers === 0) {
        turn = 0;
        playerPointer = -1;
        this.finished = true;
        this.stage++;
      }
    }
    this.setState({ value: "" });
    event.preventDefault();
  }

  render() {
    let list = players;
    const style = this.finished ? { display: "none" } : {};
    const style_alt = this.finished ? {} : { display: "none" };

    return (
      <form onSubmit={this.handleSubmit}>
        <div style={style}>
          <label>
            {this.nextInput}
            <input
              type="text"
              value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </div>
        <br />
        <div style={style_alt}>
          <PlayerList list={list} />
          <TimerWrapper duration={duration} />
        </div>
      </form>
    );
  }
}

function formatPlayerList(array) {
  let result = "";
  for (let i = 0; i < array.length; i++) {
    result += array[i];
    if (i !== array.length - 1) result += ", ";
  }
  return result;
}

class PlayerList extends React.Component {
  render() {
    return (
      <div>
        <h3>Players: </h3>
        <p>{formatPlayerList(this.props.list)}</p>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super();
    this.state = { finalized: false };
  }

  render() {
    return (
      <div>
        <NameForm />
      </div>
    );
  }
}

function incrementPointer() {
  do {
    playerPointer = playerPointer >= players.length - 1 ? 0 : playerPointer + 1;
    turn = turn + 1;
  } while (lives[playerPointer] === 0);
  console.log(playerPointer, turn);
}

function TimerWrapper(props) {
  if (props.duration === -1) {
    return null;
  } else {
    return (
      <Timer
        initialTime={props.duration * 1000}
        startImmediately={false}
        direction="backward"
        timeToUpdate={10}
        onReset={incrementPointer()}
        onStart={() => {
          turn--;
          playerPointer--;
          console.log("Start");
        }}
        onPause={() => {
          turn--;
          playerPointer--;
          console.log("Pause");
        }}
      >
        {({
          start,
          resume,
          pause,
          stop,
          reset,
          timerState,
          setTime,
          setCheckpoints
        }) => {
          setCheckpoints([
            {
              time: 0,
              callback: () => {
                lives[playerPointer]--;
                //playerPointer--;
                if (lives[playerPointer] === 0) {
                  console.log("Game over!");
                } else {
                  setTime(props.duration * 1000);
                  reset();
                  start();
                  turn++;
                  playerPointer++;
                }
              }
            }
          ]);
          return (
            <React.Fragment>
              <KeyboardEventHandler
                handleKeys={["n"]}
                onKeyEvent={() => {
                  reset();
                  incrementPointer();
                }}
              />
              <div className="timer">
                <span className="info">
                  <span className="infotag">Turn </span>
                  <span className="bold">
                    {Math.floor((turn - 1) / players.length) + 1}
                  </span>
                </span>
                <br />
                <span className="info">
                  <span className="infotag">Player </span>
                  <span className="bold">{players[playerPointer]}</span>
                </span>
                <br />
                <span className="info">
                  <span className="infotag">Lives</span>{" "}
                  <span className="bold">{lives[playerPointer]}</span>
                </span>
                <br />
                <div className="time">
                  <Timer.Seconds />.<Timer.Milliseconds /> s
                </div>
              </div>
              <br />
              <div className="buttons">
                <button className="start" onClick={start}>
                  Start
                </button>
                <button className="pause" onClick={pause}>
                  Pause
                </button>
                <br />
                <button className="np" onClick={reset}>
                  Next Player
                </button>
              </div>
            </React.Fragment>
          );
        }}
      </Timer>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
