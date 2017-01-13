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
                        }
                        console.log(price_data);
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
                    },
                    error: function(data) {
                      console.log(data);
                    },
            });
        });
    });

    // creates the calendar drop down for adjusting the 
    // date range on the historical price data
    var dateFormat = "yy-mm-dd";
    from = $("#from")
          .datepicker({
          defaultDate: "+1w",
          changeMonth: true,
          numberOfMonths: 1,
          dateFormat: "yy-mm-dd"
        });
      from.on("change", function() {
          to.datepicker("option", "minDate", getDate(this) );
          s = from.val();
          var year = parseInt(s.substring(0,4));
          var month = parseInt(s.substring(5,7)) - 1;
          var day = parseInt(s.substring(8,10));
          minTime = new Date(year,month,day,1,1,1);
          console.log("MinTime: " + minTime);
      });
      to = $("#to").datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 1,
        dateFormat: "yy-mm-dd"
      });
      to.on("change", function() {
        from.datepicker("option", "maxDate", getDate(this));
        s = to.val();
        var year = parseInt(s.substring(0,4));
        var month = parseInt(s.substring(5,7)) - 1;
        var day = parseInt(s.substring(8,10));
        maxTime = new Date(year,month,day,1,1,1);
        console.log("MaxTime: " + maxTime);
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

});
