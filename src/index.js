import React from "react";
import ReactDOM from 'react-dom';
import './index.css';

function Flag(props) {
    return (
        <img className="flag" src={props.url} height={200}></img>
    );
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            points: 0,
            flagsRemaining: null,
            totalFlags: null,
            currentFlagIndex: null,
            currentFlag: null,
            flags: null,
            history: [],
            offerChoises: false,
            choises: ["", "", ""],
            allCountries: null,
            gameOver: false
        };
    }
    //vaikeamman pelitilan vastauksen tarkistus
    checkAnswer = (event) => {
        event.preventDefault();
        var input = this.guess.value;

        this.guess.value = null;

        var answers = [this.state.flags[this.state.currentFlagIndex].names.official, this.state.flags[this.state.currentFlagIndex].names.common];

        var array = this.state.flags;

        array.splice(this.state.currentFlagIndex, 1);

        var flagIndex = Math.floor(Math.random() * array.length);

        var correct = answers.includes(input);

        var history = this.state.history;

        history.unshift({
            correctly: correct,
            name: answers[1],
            url: this.state.currentFlag
        });
        
        if(this.state.flagsRemaining <= 1){
            this.setState({
                points: correct ? this.state.points + 1 : this.state.points,
                flagsRemaining: 0,
                history: history,
                gameOver: true
            });

            return;
        }

        this.setState({
            flags: array,
            points: correct ? this.state.points + 1 : this.state.points,
            currentFlagIndex: flagIndex,
            currentFlag: array[flagIndex].flag,
            flagsRemaining: this.state.flagsRemaining - 1,
            history: history
        });
    }

    //helpomman pelitilan vastauksen tarkistus
    checkMultiAnswer(button) {
        var input = this.state.choises[button]["name"];

        var answers = [this.state.flags[this.state.currentFlagIndex].names.official, this.state.flags[this.state.currentFlagIndex].names.common];

        var array = this.state.flags;

        array.splice(this.state.currentFlagIndex, 1);

        var flagIndex = Math.floor(Math.random() * array.length);

        var correct = answers.includes(input);

        var choises = [];

        if (this.state.offerChoises && this.state.flagsRemaining > 1) {
            var correctChoise = Math.floor(Math.random() * 3);

            var countriesCopy = this.state.allCountries.slice();

            countriesCopy.splice(countriesCopy.find(o => o.name === array[flagIndex].names.common), 1)

            for (var i = 0; i < 4; i++) {
                if (i === correctChoise) {
                    choises.push({
                        "name":array[flagIndex].names.common
                    });
                }
                else {
                    var num = Math.floor(Math.random() * countriesCopy.length);
                    choises.push(countriesCopy[num]);
                    countriesCopy.splice(num, 1);
                }
            }
        }
        

        var history = this.state.history;

        history.unshift({
            correctly: correct,
            name: answers[1],
            url: this.state.currentFlag
        });

        if(this.state.flagsRemaining <= 1){
            this.setState({
                points: correct ? this.state.points + 1 : this.state.points,
                flagsRemaining: 0,
                history: history,
                gameOver: true
            });

            return;
        }

        this.setState({
            flags: array,
            points: correct ? this.state.points + 1 : this.state.points,
            currentFlagIndex: flagIndex,
            currentFlag: array[flagIndex].flag,
            flagsRemaining: this.state.flagsRemaining - 1,
            history: history,
            choises: choises
        });
    }

    //Hankkii listan lipuista, jotka ovat YK:n jäseniä. 
    getFlags() {
        var list = [];
        const Http = new XMLHttpRequest();
        Http.open("GET", "https://restcountries.com/v3.1/all?fields=flags,name,unMember,translations");
        Http.send();

        Http.onreadystatechange = (event) => {
            if (Http.readyState === 4 && Http.status === 200) {
                var response = JSON.parse(Http.responseText);

                var countries = [];

                for (const item in response) {
                    var country = response[item];
                    if (country.unMember) {
                        var flagUrl = country.flags.svg;
                        var names = country.translations.fin;

                        countries.push({
                            'name': names["common"],
                        });

                        list.push({
                            'names': names,
                            'flag': flagUrl
                        });
                    }
                }

                var nextFlag = Math.floor(Math.random() * list.length);

                var choises = []

                if (this.state.offerChoises) {
                    var correctChoise = Math.floor(Math.random() * 2);

                    var countriesCopy = countries;

                    countriesCopy.splice(nextFlag, 1)

                    for (var i = 0; i < 4; i++) {
                        if (i === correctChoise) {
                            choises.push(countries[nextFlag]);
                        }
                        else {
                            var num = Math.floor(Math.random() * countriesCopy.length);
                            choises.push(countriesCopy[num]);
                            countriesCopy.splice(num, 1);
                        }
                    }
                }

                this.setState({
                    flags: list,
                    flagsRemaining: list.length,
                    currentFlag: list[nextFlag].flag,
                    currentFlagIndex: nextFlag,
                    totalFlags: list.length,
                    allCountries: countries,
                    choises: choises,
                    history: [],
                    gameOver: false,
                    points: 0
                });
            }
        }
    }

    //Palauttaa oikean inputin riippuen pelataanko vaikeaa vaiko helpompaa pelitilaa.
    getInput() {
        if (this.state.offerChoises) {
            return (
                <div>
                    <button name="option1" onClick={() => this.checkMultiAnswer(0)}>{this.state.choises[0].name}</button>
                    <button name="option2" onClick={() => this.checkMultiAnswer(1)}>{this.state.choises[1].name}</button>
                    <button name="option3" onClick={() => this.checkMultiAnswer(2)}>{this.state.choises[2].name}</button>
                </div>
            );
        }
        else {
            return (
                <form onSubmit={this.checkAnswer}>
                    <input type="text" name="guess" autoComplete="off" ref={guess => { this.guess = guess }}></input>
                    <button type="submit">Arvaa</button>
                </form>
            );
        }
    }

    render() {

        const history = this.state.history;

        const correct = this.state.points;
        const losses = this.state.totalFlags - this.state.points - this.state.flagsRemaining;

        const pastFlags = history.map((data, index) => {
            const className = data.correctly ? "correct" : "wrong";

            return (
                <div key={data.url} className={className}>
                    <p>{data.name}</p>
                    <img src={data.url} height="40"></img>
                </div>
            );
        })

        if(this.state.gameOver){
            return(
                <div className="game">
                    <h2>Peli loppu!</h2>
                    
                    <button onClick={() => {
                        this.setState({
                            offerChoises: false,
                        });

                        this.getFlags()
                    }}>Uusi "Vaikea" Peli</button>

                    <button onClick={() => {
                        this.setState({
                            offerChoises: true,
                        });

                        this.getFlags();
                    }}>Uusi "Helppo" Peli</button>

                    <div className="stats">
                        <div className="statsRow">
                            <p>{"Oikein : " + correct}</p>
                            <p>{"Väärin : " + losses}</p>
                        </div>
                        
                    </div>
                    <div className="history">{pastFlags}</div>
                </div>
            );
        }

        if (this.state.flags) {
            return (
                <div className="game">
                    <h2>Minkä maan lippu?</h2>
                    <Flag url={this.state.currentFlag} />

                    {this.getInput()}

                    <div className="stats">
                        <div className="statsRow">
                            <p>{"Oikein : " + correct}</p>
                            <p>{"Väärin : " + losses}</p>
                            <p>{"Jäljellä : " + (this.state.flagsRemaining - 1).toString()}</p>
                        </div>
                        
                    </div>
                    <ol>{pastFlags}</ol>
                </div>
            );
        }
        else {
            return (
                <div className="game">
                    <button onClick={() => this.getFlags()}>Vaikea peli</button>

                    <button onClick={() => {
                        this.setState({
                            offerChoises: true,
                        });

                        this.getFlags();
                    }}>Helppo peli</button>
                </div>
            );
        }

    }
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);