//Preloader component makes easier to render a preloading gif whenever necessary, using state updating in all components.
//It receives props type to render different GIFs
import React, { Component } from "react";

class Preloader extends Component {
  render() {
    switch(this.props.type){
      case "bars":
      return (
        <div className="text-center">
        <img alt="Loading..." src="https://loading.io/spinners/bar-chart/lg.bar-chart-preloader.gif"/>
        <br/> Loading... Please Wait
        </div>
    );
    default:
    return (
      <div className="text-center">
      <img alt="Loading..." src="https://loading.io/spinners/wave/lg.wave-ball-preloader.gif"/>
      <br/> Loading... Please Wait
      </div>
  );
  }
  }
}

export default Preloader;
