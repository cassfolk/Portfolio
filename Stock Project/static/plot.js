// import {apiKey} from './config.js';

// Submit Button handler
function handleSubmit() {
    // Prevent the page from refreshing
    d3.event.preventDefault();
  
    // Select the input value from the form
    var stock = d3.select("#stockInput").node().value;
    console.log(stock);
  
    // clear the input value
    d3.select("#stockInput").node().value = "";
  
    // Build the plot with the new stock
    buildPlot(stock);
  }
  
  function buildPlot(stock) {
    var url = "https://uci-project3.herokuapp.com/"

    d3.json(url).then(function(data) {
      // var closingPrices = data.map(row => row['symbol']);

      var info = data['All'];
      // console.log(info);

      for (i=0; i < info.length; i++) {
        var name = info[i].symbol;
        // console.log(info);
        // if stock ticker entered = stock ticker in json
        if (stock === name) {

          //variables from historical array
          var dates = info[i].historical.map(row=>row['date']);
          // console.log(dates);
          var closingPrices = info[i].historical.map(row=>row['close']);
          // console.log(closingPrices);

          // variables from predictive array
          var predictionDates = info[i].prediction[0].prediction_data['Date'];
          var predictionPrice = info[i].prediction[0].prediction_data['Predictions'];
          // console.log(predictionDates);
          // console.log(predictionPrice);

        // // converting historical dates/prices for predictive chart
        var dateLength = predictionDates.length;
        // console.log(dateLength);
        var predictChartDates = predictionDates.slice(Math.max(dateLength - 90, 0));
        console.log(predictChartDates);
        var priceLength = predictionPrice.length;
        var predictChartPries = predictionPrice.slice(Math.max(priceLength - 90, 0));
        console.log(predictChartPries);
        }
      }

      // get dates for stock chart
      var startDate = dates[0];
      // console.log(startDate);
      var endDate = dates[dates.length - 1];
      // console.log(endDate);

      
      // get and format today's date as yyyy-mm-dd
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      today = yyyy + '-' + mm + '-' + dd;
      // console.log(today);

      // get and format prediction chart's date as yyyy-mm-dd
      var startPredict = new Date(today);
      startPredict.setDate(startPredict.getDate() - 60);
      var ddP = startPredict.getDate();
      var mmP = startPredict.getMonth() + 1;
      var yyyyP = startPredict.getFullYear();

      var startPredictFormat = yyyyP + '-' + mmP + '-' + ddP;
      // console.log(startPredictFormat);

      var endPredict = new Date(today);
      endPredict.setDate(endPredict.getDate());
      var ddE = endPredict.getDate();
      var mmE = endPredict.getMonth() + 1;
      var yyyyE = endPredict.getFullYear();
      var endPredictFormat = yyyyE + '-' + mmE + '-' + ddE;
      // console.log(endPredictFormat)

      var trace1 = {
        type: "scatter",
        mode: "lines",
        name: "Actual",
        x: dates,
        y: closingPrices,
        line: {
          color: "#17BECF"
        }
      };

      var trace2 = {
        type: "scatter",
        mode: "lines",
        name: "Predictions",
        x: predictChartDates,
        y: predictChartPries,
        line: {
            color: "#f08080"
        }
      }

      // var trace3 = {
      //   type: "scatter",
      //   mode: "lines",
      //   name: "Actual",
      //   x: predictChartDates,
      //   y: predictChartPries,
      //   line: {
      //     color: "#17BECF"
      //   }
      // };

      var data1 = [trace1];

      var layout1 = {
        title: `${stock} Closing Prices`,
        xaxis: {
          range: [startDate, endDate],
          type: "date"
        },
        yaxis: {
          autorange: true,
          type: "linear"
        },
        showlegend: true    
      };

      var data2 = [trace1, trace2];

      var layout2 = {
        title: `${stock} Predictive Chart Last 90 Days`,
        xaxis: {
          range: [startPredictFormat, endDate], //endPredictFormat
          type: "date"
        },
        yaxis: {
          autorange: true,
          type: "linear"
        },
        showlegend: true
      };

      Plotly.newPlot("plot", data1, layout1);
      Plotly.newPlot("plot2", data2, layout2);
    });

    // News code below: 

    const newsList = document.querySelector('.news');    

    //show 'error' message box when input field is empty 
    if (stock == ''){
        alert('Input field is empty')
        return
    }

    //clears the previous search results
    newsList.innerHTML ='';

    const apiKey2 = '96b47c522f00a29fe1b11cfd2b0b02d9'; 

    let url2 ='https://financialmodelingprep.com/api/v3/stock_news?tickers='+ stock + '&limit=5&apikey=' + apiKey2;

    fetch(url2).then((res) => {
        return res.json();
    }).then((data) => {
        // console.log(data);
        
        data.forEach(data =>{
            let li=document.createElement('li');
            let a = document.createElement('a');
            a.setAttribute('href', data.url);
            a.setAttribute('target','_blank'); //opens another tab
            a.textContent = data.title;
            li.appendChild(a);
            newsList.appendChild(li);
        })
    });

  }
  
  // Add event listener for submit button
  d3.select("#submit").on("click", handleSubmit);
  