import React, { Component } from "react";
import GoogleMapsLoader from "google-maps";

class Maps extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = { map: false, marker: false, google: false };
  }

  componentDidMount() {}

  componentDidUpdate() {
    if (this.state.map) {
      this.state.google.maps.event.trigger(this.state.map,"resize");
      this.state.map.panTo(
        new this.state.google.maps.LatLng(this.props.lat, this.props.lng)
      );
      this.state.marker.setPosition(
        new this.state.google.maps.LatLng(this.props.lat, this.props.lng)
      );
    } else {
      GoogleMapsLoader.KEY = "AIzaSyBY7aNNYzRD0Kv_Ykc2zjwPjr4QLhwFEvc";
      var rScope = this;
      var { lat, lng } = this.props;
      GoogleMapsLoader.load(function(google) {
        var options = { zoom: 8, center: { lat: lat, lng: lng } };
        var map = new google.maps.Map(rScope.map.current, options);
        rScope.setState({
          map: map,
          marker: new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            draggable : false
          }),
          google: google
        });
      });
    }
  }
  render() {
    return (
      <div
        style={{width: "99%"}}
        className={this.props.loaded ? "map showMap" : "map"}
        ref={this.map}
      />
    );
  }
}

export default Maps;
