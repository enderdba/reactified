//MAIN APP COMPONENT
//This component is the father of all other components we use in the app, from here, it makes the most API calls
//for all the components, serves as a data provider for all the other components, and other components will receive the data as props whenever
//its rendered and updated. It has an initial state so it builds up the component and all the dependencies needed, such as google maps, stitch client and everything else.
// It has a preloader that finishes whenever the component is rendered for the first time, after all libraries are loaded and running.
// The componen uses its state to mantain and keep the workflow going, since some components share their state with this component. (See Dropdown.js)
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { StitchClientFactory } from "mongodb-stitch";
import Dropdown from "./components/Dropdown";
import Provinces from "./components/Provinces";
import { Circle2 } from "react-preloaders";
import Charts from "./components/Charts";
import "./App.css";
import Maps from "./components/Maps";

//Main component constructor, where i make the one and only client promise to check the stitch status after the component mounts.
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
      loaded: false
    };
    this.handleProvinceChange = this.handleProvinceChange.bind(this);
  }

  //Prepare the first state of the component when the component mounts and loads for the first time
  componentDidMount() {
    this.displayCommentsOnLoad();
  }


  //Saves after a promise is made the connection between the app and stitch, so i can run queries and searches.
  displayCommentsOnLoad() {
    var client, db;
   // console.log("gonna start the thing");
    this.state.clientPromise.then(stitchClient => {
      client = stitchClient;
      client.authenticate('apiKey', 'IjJKAehxDRcOWyuH1qsESuiWJS4AJU0JeIy9TRUNfADnlSKSMnB12dZcwFpQYbTs').then(userId => {
        //console.log("completely authed " + userId);
        db = client.service("mongodb", "mongodb-atlas").db("canada");
        this.setState({
          db: db,
          client: client
        });
      });
      }).catch((err) => {
        console.error('Error authenticating: ' + err);
      });
  }

  //Function that is called to set up the connection flag whenever its ready
  handleClientConnection() {
    this.setState({ connected: true });
    //console.log("FIRST! true");
    this.displayProvinceData("AB");
    this.displayStationData("CA003010232",true); 
    this.setState({first : false});
  }

  //Function that is called to set up a flag whenever the province is changed. It's triggered after a function in the Dropdown component is called.
  handleProvinceChange(province) {
    this.setState({ selectedProvince: province });
  }

  //Function that triggers after the state of the component is changed. 
  //Uses the nextState property to validate if some properties are still the same, so it won't re-render
  componentWillUpdate(nextProps, nextState) {
    //check if the connection to stitch will be made
    if (nextState.client !== this.state.client) {
      nextState.client
        .login()
        .then(() => {
          this.handleClientConnection();
        })
        .catch(err => {
          //console.error("failed to log in anonymously:", err);
        });
    }
    //check on update if its necessary to load other province areas
    if (nextState.selectedProvince !== this.state.selectedProvince) {
      this.displayProvinceData(nextState.selectedProvince);
    }
  }

  //Called after a province has been clicked,
  //creating a list of JSX elements which are passed as a list of props in the provinces component.
  displayProvinceData(p) {
    this.setState({ provinceList: "loading" });
    this.state.client.executeFunction("searchStationCache", p).then(result => {
      var html = result.map((c, index) => (
        <small key={index}>
          <a
            onClick={() => {
              this.displayStationData(c.station, true);
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

  //Creates and renders some information about the station thas has been clicked, changing the actual state and serving as a point of data retrieval for some components.
  displayStationData(s, first) {
    if (this.state.station !== s) {
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
          loaded: first ? true : false
        });
        //displayCharts(c.station, c.maximumDate);
      });
    }
  }

  render() {
      return (
        <div className="App container-fluid">
          <Circle2/>
          <h2 className="text-center ">Canadian Historical Weather Data</h2>
          <hr />
          <div className="row">
            <div className="col-4">
              <Dropdown onSelectedOption={this.handleProvinceChange} />
              <br />
              <Provinces list={this.state.provinceList} />
            </div>
            <div className={this.state.loaded ? "col-8" : "col-8 d-none"}>
              <div>
                {this.state.comment}
                <Charts
                  client={this.state.client}
                  station={this.state.station}
                  maxDate={this.state.maxDate}
                />
                <Maps
                  loaded={this.state.loaded}
                  lat={this.state.myLatLng.lat}
                  lng={this.state.myLatLng.lng}
                />
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export default App;
