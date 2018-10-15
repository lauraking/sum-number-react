import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// TARGET SUM - Starting Template
var _ = require('underscore');

const randomNumberBetween = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

class Number extends React.Component {
	handleClick = () => {
  	if (this.props.clickable) {
    	this.props.onClick(this.props.id);
    }

  }

	render() {
  	return (
    	<div className="number"
      style={{opacity: this.props.clickable ? 1: 0.3}}
      onClick={this.handleClick}

      >{this.props.value}</div>
    )
  }
}

class Game extends React.Component {

	componentDidMount() {
  	if (this.props.autoPlay) {
    	this.startGame();
    }
  }

	componentWillUnmount() {
  	clearInterval(this.intervalId);
  }
	selectNumber = numberIndex => {
    this.setState(
      prevState => {
        if (prevState.gameStatus !== 'playing') {
          return null;
        }
        const newSelectedIds =
          [ ...prevState.selectedIds, numberIndex ];
        return {
          selectedIds: newSelectedIds,
          gameStatus: this.calcGameStatus(newSelectedIds),
        };
      },
      () => {
        if (this.state.gameStatus !== 'playing') {
          clearInterval(this.intervalId);
        }
      }
    );
  };

    calcGameStatus = newSelectedIds => {
    const sumSelected = newSelectedIds.reduce(
      (acc, curr) => acc + this.challengeNumbers[curr],
      0
    );
    if (newSelectedIds.length !== this.props.answerSize) {
      return 'playing';
    }
    return sumSelected === this.target ? 'won' : 'lost';
  };

	startGame = () => {
    this.setState({ gameStatus: 'playing' }, () => {
      this.intervalId = setInterval(() => {
        this.setState(prevState => {
          const newRemainingSeconds =
            prevState.remainingSeconds - 1;
          if (newRemainingSeconds === 0) {
            clearInterval(this.intervalId);
            return { gameStatus: 'lost', remainingSeconds: 0 };
          }
          return { remainingSeconds: newRemainingSeconds };
        });
      }, 1000);
    });
  };


	isNumberAvailable = (numberIndex) => this.state.selectedIds.indexOf(numberIndex) === -1;

	static bgColors = {
  	playing: '#ccc',
    won: 'green',
    lost: 'red',
  };

	state = {
  	gameStatus: 'new', // new, playing, won, lost
    remainingSeconds: this.props.initialSeconds,
    selectedIds: [],
  };

	challengeNumbers = Array
    .from({ length: this.props.challengeSize })
    .map(() => randomNumberBetween(...this.props.challengeRange));

  target = _.sampleSize(
    this.challengeNumbers,
    this.props.challengeSize - 2
  ).reduce((acc, curr) => acc + curr, 0);

  render() {
  	const { gameStatus, remainingSeconds } = this.state;
    return (
      <div className="game">
        <div className="help">
          Pick 4 numbers that sum to the target in {this.props.initialSeconds} seconds
        </div>
        <div className="target"
        		style={{backgroundColor: Game.bgColors[this.state.gameStatus]}}
        >{this.state.gameStatus === 'new' ? 'TARGET' : this.target}</div>
        <div className="challenge-numbers">
          {this.challengeNumbers.map((value, index) =>
           <Number
           	key={index}
           	value={this.state.gameStatus ===
           	'new' ? '?' : value}
           	id={index}
            clickable={this.isNumberAvailable(index)}
            onClick={this.selectNumber}
          	/>
          )}
        </div>
        <div className="footer">
        	{this.state.gameStatus === 'new' ? (<button onClick={this.startGame}>Start</button>) :
          (<div className="timer-value">
          	{this.state.remainingSeconds}
            </div>
          )}
          {['won','lost'].includes(this.state.gameStatus) && ( <button onClick={this.props.onPlayAgain}>Play Again</button>)}
          </div>
      </div>
    );
  }
}

class App extends React.Component {
	state = {
  	gameId: 1,
  };

  resetGame = () =>
  	this.setState((prevState) => ({
    	gameId: prevState.gameId + 1,
    }));

  render() {
  	return (
    	<Game
      	key={this.state.gameId}
        autoPlay={this.state.gameId > 1}
        challengeSize={6}
        challengeRange={[2, 9]}
        initialSeconds={10}
        answerSize={4}
        onPlayAgain={this.resetGame}
      />
    );
  }

}

ReactDOM.render(<App />, document.getElementById('root'));
