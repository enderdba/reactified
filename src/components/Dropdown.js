//Dropdown is the first component made that will render a hard-coded list from the initial state of the component.
//It shows a list of provinces that are selectable from the dropdown, since bootstrap only works with jQuery, a working solution was made
//It checks the state of the dropdown button, if clicked, it will become selected, rendering the list of hardcoded elements, and hiding when one is selected
//The list of all selected elements are binded with events that will call a function, which will be "heared" from the parent component, using prop sharing. (See handleProvince function)
//The clicked object is passes from the childrens prop, to the main app component.
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
      <div className="dropdown">
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
