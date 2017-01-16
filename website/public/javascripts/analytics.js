$(document).ready(function () {

    console.log("running the analytics ejs");
    var price_data = [];
    var product_name = "";
   
    // ajax call to gather product info for dropdown
    $.get('/get_product_names',function(data) {
        var dropdown = $("#dropdown_list");
        for (var i in data) {
          console.log(data[i]);
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.setAttribute('href','#');
            a.innerHTML = String(data[i]["Name"]);
            li.appendChild(a);
            dropdown.append(li);
        }

        // assigns the dropdown options their on-click method
        // for obtaining their value or text
        $(".dropdown-menu li a").click(function() {
            product_name = $(this).text();
            console.log(product_name);

            var data = {};
            data.Name = product_name;

            var minPrice = 1000000;
            var maxPrice = 0;
            var avgPrice = 0;
            var currentPrice = 0;
            var runSum = 0;
            var numPts = 0;

            // send the asin back to the server
            $.ajax({
                    url: "get_plot_Data",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(data),
                    contentType: "application/json",

                    complete: function() {
                      //called when complete
                      console.log('process complete');
                    },
                    success: function(data) {
                        price_data = [];
                        for (var elem in data) {
                            // add the data to the list of prices
                            price_data.push({
                                x : new Date(data[elem]['InsertionTime']),
                                y : data[elem]['Original_Price']
                            });

                            // get the current price
                            currentPrice = data[0]['Original_Price'];

                            // find the minimum price
                            if (data[elem]['Original_Price'] < minPrice) {
                              minPrice = data[elem]['Original_Price'];
                            }

                            // find the maximum price
                            if(data[elem]['Original_Price'] > maxPrice) {
                              maxPrice = data[elem]['Original_Price'];
                            }

                            // sum prices for the average calculation
                            runSum += data[elem]['Original_Price'];
                            numPts += 1;
                        }
                        // debug
                        console.log(price_data);

                        // calculating the average
                        avgPrice = runSum/numPts;

                        // creat the line plot to illustrate the product's price history
                        var chart = new CanvasJS.Chart("product_plot",
                        {
                          theme: "theme2",
                          title:{
                            text: product_name
                          },
                          animationEnabled: true,
                          axisX: {
                            labelFormatter: function (e) {
                                return CanvasJS.formatDate( e.value, "DD MMM YYYY");
                            } 
                          },
                          axisY:{
                            includeZero: false
                            
                          },
                          data: [
                          {        
                            type: "line",
                            lineThickness: 3,        
                            dataPoints: price_data
                          }
                          ]

                        });

                        // render the chart for viewing
                        chart.render(); 
                        
                        $("#current_chart").empty();
                        var current_chart = new JustGage({
                          id: "current_chart",
                          value: currentPrice.toFixed(2),
                          min: 0,
                          max: Math.ceil(maxPrice),
                          title: "Current Price",
                          levelColors: ["#3CCE57","#3CCE57","#3CCE57"],
                          gaugeWidthScale: 0.25,
                          pointer: true,
                          startAnimationTime: 5000,
                          symbol: "$",
                          decimals: 2
                        });

                        $("#avg_chart").empty();
                        var avg_chart = new JustGage({
                          id: "avg_chart",
                          value: avgPrice,
                          min: 0,
                          max: Math.ceil(maxPrice),
                          title: "Average Price",
                          levelColors: ["#3385ff","#3385ff","#3385ff"],
                          gaugeWidthScale: 0.25,
                          pointer: true,
                          symbol: "$",
                          decimals: 2,
                          startAnimationTime: 5000
                        });

                        $("#min_chart").empty();
                        var min_chart = new JustGage({
                          id: "min_chart",
                          value: minPrice,
                          min: 0,
                          max: Math.ceil(maxPrice),
                          title: "Minimum Price",
                          levelColors: ["#ff4d4d","#ff4d4d","#ff4d4d"],
                          gaugeWidthScale: 0.25,
                          pointer: true,
                          symbol: "$",
                          decimals: 2,
                          startAnimationTime: 5000
                        });

                        // creates the calendar drop down for adjusting the 
                        // date range on the historical price data
                        var dateFormat = "yy-mm-dd";
                        from = $("#from")
                              .datepicker({
                              defaultDate: "+1w",
                              changeMonth: true,
                              numberOfMonths: 1,
                              dateFormat: "yy-mm-dd",
                            });
                        from.val('');

                        from.on("change", function() {
                            to.datepicker("option", "minDate", getDate(this) );
                            s = from.val();
                            var year = parseInt(s.substring(0,4));
                            var month = parseInt(s.substring(5,7)) - 1;
                            var day = parseInt(s.substring(8,10));
                            minTime = new Date(year,month,day,1,1,1);
                            console.log("MinTime: " + minTime);
                            chart.options.axisX.minimum = minTime;
                            chart.render();
                        });

                        to = $("#to").datepicker({
                          defaultDate: "+1w",
                          changeMonth: true,
                          numberOfMonths: 1,
                          dateFormat: "yy-mm-dd"
                        });
                        to.val('');

                        to.on("change", function() {
                          from.datepicker("option", "maxDate", getDate(this));
                          s = to.val();
                          var year = parseInt(s.substring(0,4));
                          var month = parseInt(s.substring(5,7)) - 1;
                          var day = parseInt(s.substring(8,10));
                          maxTime = new Date(year,month,day,1,1,1);
                          console.log("MaxTime: " + maxTime);
                          chart.options.axisX.maximum = maxTime;
                          chart.render();
                        });
                         
                        function getDate(element) {
                          var date;
                          try {
                          date = $.datepicker.parseDate(dateFormat, element.value);
                          } catch( error ) {
                          date = null;
                          }
                          return date;
                        }
                    },
                    error: function(data) {
                      console.log(data);
                    },
            });
        });
    });
});
