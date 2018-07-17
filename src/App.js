import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { StitchClientFactory } from "mongodb-stitch";
import Dropdown from "./components/Dropdown";
import Provinces from "./components/Provinces";
import { Circle2 } from "react-preloaders";
import Charts from "./components/Charts";
import Preloader from "./components/Preloader";
import "./App.css";

import Maps from "./components/Maps";
class App extends Component {
  constructor(props) {
    super(props);
    var clientPromisee = StitchClientFactory.create("weathertest-urceu");
    this.state = {
      ctx: false,
      myChart: false,
      client: false,
      db: false,
      myLatLng: { lat: 54.4167, lng: -110.767 },
      first: true,
      clientPromise: clientPromisee,
      selectedProvince: false,
      provinceList: false,
      connected: false,
      comment: false,
      station: false,
      maxDate: false,
      isLoading: false,
      loaded : false
    };
    this.handleProvinceChange = this.handleProvinceChange.bind(this);
  }

  componentDidMount() {
    this.displayCommentsOnLoad();
  }

  displayCommentsOnLoad() {
    var client, db;
    this.state.clientPromise.then(stitchClient => {
      client = stitchClient;
      db = client.service("mongodb", "mongodb-atlas").db("canada");
      this.setState({
        db: db,
        client: client
      });
    });
  }

  handleClientConnection() {
    this.setState({ connected: true });
  }

  handleProvinceChange(province) {
    this.setState({ selectedProvince: province });
  }

  componentWillUpdate(nextProps, nextState) {
    //check if the connection to stitch will be made
    if (nextState.client !== this.state.client) {
      nextState.client
        .login()
        .then(() => {
          this.handleClientConnection();
          this.displayStationData("CA003010232", false);
        })
        .catch(err => {
          console.error("failed to log in anonymously:", err);
        });
    }
    //check on update if its necessary to load other province areas
    if (nextState.selectedProvince !== this.state.selectedProvince) {
      this.displayProvinceData(nextState.selectedProvince);
    }
  }

  displayProvinceData(p) {
    this.setState({ provinceList: "loading" });
    this.state.client.executeFunction("searchStationCache", p).then(result => {
      var html = result.map((c, index) => (
        <small key={index}>
          <a
            onClick={() => {
              this.displayStationData(c.station,true);
            }}
            className="list-group-item"
          >
            {c.name} {c.minYear} - {c.maxYear}{" "}
          </a>
        </small>
      ));
      this.setState({
        provinceList: html
      });
    });
  }

  displayStationData(s,first) {
    this.setState({
      isLoading: true
    });
    this.state.client.executeFunction("stationDetail", s).then(c => {
      this.setState({
        comment: (
          <h6>
            <center>
              {c.province} Station: {c.station} {c.name}
              ({c.minimumDate} to {c.maximumDate})
            </center>
          </h6>
        ),
        myLatLng: {
          lat: Number(c.lat),
          lng: Number(c.lon)
        },
        station: c.station,
        maxDate: c.maximumDate,
        isLoading: false,
        loaded : first ? true : false
      });
      //displayCharts(c.station, c.maximumDate);
    });
  }

  render() {
    if (!this.state.connected) {
      return <Circle2 />;
    } else {
      return (
        <div className="App container-fluid">
          <Circle2 />
          <h2 className="text-center ">
            Canadian Historical Weather Data
          </h2>

          <hr />
          <div className="row">
            <div className="col-4">
            <Dropdown onSelectedOption={this.handleProvinceChange} />
          <br/>
              <Provinces list={this.state.provinceList} />
            </div>
            <div  className={this.state.loaded ? "col-8" : "col-8 d-none"}>
              <div className={this.state.isLoading ? "" : "d-none"}>
                <Preloader />
              </div>
              <div className={this.state.isLoading ? "d-none" : ""}>
                <div>
                  {this.state.comment}
                  <Charts
                    client={this.state.client}
                    station={this.state.station}
                    maxDate={this.state.maxDate}
                  />
                  <Maps loaded={this.state.loaded} lat={this.state.myLatLng.lat} lng={this.state.myLatLng.lng} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default App;
