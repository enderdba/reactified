import React, { Component } from "react";
import Preloader from "./Preloader";

import "../App.css";
class Provinces extends Component {

  render() {
    var { list } = this.props;

    if (!list) {
      return (
        <div className="text-center">
        <br/>
          <h4>Select a province first</h4>
        </div>
      );
    } else if (list === "loading") {
      return (
          <Preloader />
      );
    } else {
      return (
        <div className="anyClass">
          <div id="stations" className="list-group">
            {list}
          </div>
        </div>
      );
    }
  }
}

export default Provinces;
