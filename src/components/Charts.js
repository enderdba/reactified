import React, { Component } from "react";
import Chartjs from "chart.js";

class Charts extends Component {
  constructor(props) {
    super(props);
    this.checkChart = this.checkChart.bind(this);
    this.state = { isLoading: false, chartTemp: false, chartPrecip: false };
    this.tempChart = React.createRef();
    this.precipChart = React.createRef();
  }


  componentDidUpdate(pp, ps) {
    if (
      pp.station !== this.props.station &&
      pp.maxDate !== this.props.maxDate
    ) {
      if (this.props.station && this.props.maxDate) {
        //check if the charts are already made, otherwise make it
        if (!this.state.tempChart && !this.state.chartPrecip) {
          //chart has been not made first, we need to create it
          const ctxtemp = this.tempChart.current.getContext("2d");
          const ctxprecip = this.precipChart.current.getContext("2d");
          var chartyTemp = false;
          var chartyPrecip = false;
          chartyTemp = new Chartjs(ctxtemp, {
            type: "line",
            data: {
              labels: [],
              datasets: [
                {
                  fill: false,
                  borderColor: "hsla(200,100%,50%,0.8)",
                  borderWidth: 1,
                  pointRadius: 0,
                  data: []
                },
                {
                  fill: false,
                  borderColor: "hsla(0,0%,50%,0.8)",
                  borderWidth: 1,
                  pointRadius: 0,
                  data: []
                },
                {
                  fill: false,
                  borderColor: "hsla(0,100%,50%,0.8)",
                  borderWidth: 1,
                  pointRadius: 0,
                  data: []
                }
              ]
            },
            options: {
              legend: false,
              title: {
                display: true,
                text: "Last 12 Months Max/Avg/Min Temperatures"
              }
            }
          });
          chartyPrecip = new Chartjs(ctxprecip, {
            type: "bar",
            data: {
              labels: [],
              datasets: [
                {
                  label: "Rainfall",
                  fill: false,
                  backgroundColor: "hsla(200,100%,50%,0.5)",
                  data: []
                },
                {
                  label: "Snow",
                  fill: false,
                  backgroundColor: "hsla(0,100%,50%,0.5)",
                  data: []
                }
              ]
            },
            options: {
              scales: {
                xAxes: [{ stacked: true }],
                yAxes: [{ stacked: true }]
              }
            }
          });
          this.setState({
            chartTemp: chartyTemp,
            chartPrecip: chartyPrecip
          });
          this.checkChart(
            this.props.station,
            this.props.maxDate,
            chartyTemp,
            chartyPrecip
          );
        } else {
          this.checkChart(
            this.props.station,
            this.props.maxDate,
            this.state.chartTemp,
            this.state.chartPrecip
          );
        }
      }
    }
  }

  checkChart(s, d, c1, c2) {
    var tempChart = c1;
    var precipChart = c2;
    let m = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ]; // add leading "0"
    let parts = d.split("-");
    let I = parts.map(c => parseInt(c)); // avoid concatenation
    let YM = i => ({
      year: I[1] - 12 + i < 0 ? I[0] - 1 : I[0],
      month: (I[1] + i) % 12
    });
    let labels = [...Array(12)].map(
      (u, i) => `${YM(i).year}-${m[YM(i).month]}-${parts[2]}`
    );
    tempChart.data.labels = precipChart.data.labels = labels; // match format of DB date string
    this.setState({ isLoading: true });
    this.props.client
      .executeFunction("lastTwelveMonths", s, d)
      .then(records => {
        records.forEach(c => {
          // We don't need to sort, just insert in the right bin
          let which = labels.indexOf(c.date); // match date with pre-built array of dates
          tempChart.data.datasets[0].data[which] = Number(c.mintemp);
          tempChart.data.datasets[1].data[which] = Number(c.avgtemp);
          tempChart.data.datasets[2].data[which] = Number(c.maxtemp);
          let prcp = Number(c.precipitation);
          let snow = Number(c.snow / 10.0);
          let rainfall = Math.max(prcp - (snow, 0));
          precipChart.data.datasets[0].data[which] = rainfall;
          precipChart.data.datasets[1].data[which] = snow;
        });
        tempChart.update();
        precipChart.update();
        setTimeout(()=>{ this.props.toast.dismiss();},500);
        this.setState({ isLoading: false });
      });
  }

  render() {
    return (
      <div className="text-center">
        <div>
          <canvas id="color-strip" ref={this.tempChart} />
          <canvas id="color-strip" ref={this.precipChart} />
        </div>
      </div>
    );
  }
}

export default Charts;
