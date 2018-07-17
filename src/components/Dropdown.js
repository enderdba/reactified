import React, { Component } from "react";

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      provinces: [
        "AB",
        "BC",
        "MB",
        "NB",
        "NL",
        "NS",
        "NT",
        "NU",
        "ON",
        "PE",
        "QC",
        "SK",
        "YT"
      ],
      toPush: false,
      selected: false
    };
    this.setSelectedOption = this.setSelectedOption.bind(this);
  }

  setSelectedOption(opt){
      this.props.onSelectedOption(opt);
      this.changeDropState();
  }

  componentDidMount() {
    var toPush = [];
    this.state.provinces.forEach(function(word) {
      toPush.push(
        <a key={word} className="dropdown-item" onClick={() => this.setSelectedOption(word)} name={word}>
          {word}
        </a>
      );
    }, this);
    this.setState({
      toPush: toPush
    });
  }

  changeDropState() {
    if (this.state.shown) {
      this.setState({ shown: false });
    } else {
      this.setState({ shown: true });
    }
  }

  render() {
    const { toPush } = this.state;
    return (
      <div className="text-center dropdown">
        <button
          type="button"
          onClick={this.changeDropState.bind(this)}
          className="btn btn-primary dropdown-toggle"
          data-toggle="dropdown"
        >
          Provinces
        </button>
        <div
          id="provinces"
          className={"dropdown-menu " + (this.state.shown ? "show" : "")}
        >
          {toPush}
        </div>
      </div>
      
    );
  }
}

export default Dropdown;
