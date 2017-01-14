$(document).ready(function () {

    function createTable() {
        console.log("in the update table function");
        var raw_asin = [];
        var setPoint = 0;

        // Query for the setpoint price and see current price is below 
        $.get('/get_price_point', function(asin_data) {
            console.log(asin_data);
            raw_asin = asin_data;

            // Query the db for all product data
            $.get('/get_product_data', function(returned_data) {
                // cool trick to get the ID for the tbody within the table tag !!
                var tbody = $("#prod_table > tbody:last");

                for (var row in returned_data) {
                    // log data to webpage
                    console.log(returned_data[row]);

                    var tr = document.createElement('tr'); 
                    // check if we should highlight a row because price is < setpoint
                    for (var rr in raw_asin) {
                        if (raw_asin[rr]['Asin'] == returned_data[row]["Code"]) {
                            setpoint = raw_asin[rr]['Price_Point'];
                            if (setpoint > returned_data[row]['Original_Price']) {
                                console.log('You should buy!');
                                tr.style.backgroundColor = '#d6f5d6'; //aeeaae
                            }
                        }
                    }  

                    var name = document.createElement('td');
                    var originalPrice = document.createElement('td');
                    var targetPrice = document.createElement('td');
                    var avail = document.createElement('td');
                    var link = document.createElement('td');
                    var del = document.createElement('td');
                    
                    var a = document.createElement('a');
                    a.setAttribute('href','https://www.amazon.com/dp/' + returned_data[row]["Code"]);
                    a.setAttribute('target',"_blank");
                    a.innerHTML = "Product Page";

                    var b = document.createElement('button');
                    b.setAttribute('id',"delete_button_" + returned_data[row]["Code"]);
                    b.setAttribute('type',"button");
                    b.setAttribute('class',"btn btn-default");
                    b.innerHTML = "Delete"
                    var text1 = document.createTextNode(returned_data[row]["Name"]);
                    var text2 = document.createTextNode("$"+ String(parseFloat(returned_data[row]["Original_Price"]).toFixed(2)));
                    var text3 = document.createTextNode("$"+ String(parseFloat(setpoint.toFixed(2))));
                    var text4 = document.createTextNode(String(returned_data[row]["Availability"]));

                    name.appendChild(text1);
                    originalPrice.appendChild(text2);
                    targetPrice.appendChild(text3);
                    avail.appendChild(text4);
                    link.appendChild(a);
                    del.appendChild(b);

                    tr.appendChild(name);
                    tr.appendChild(originalPrice);
                    tr.appendChild(targetPrice);
                    tr.appendChild(avail);
                    tr.appendChild(link);
                    tr.appendChild(del);

                    // set the id of the row to the name of the prod
                    tr.setAttribute('id',text1);

                    // append the row to the table and move on to the next bit of data
                    tbody.append(tr);
                }

                // handle the delete buttons for each item with wildcard '[id^=delete_button_]'
                // also this has to be within the ajax calls populating the tags in order to function 
                $('[id^=delete_button_]').click(function(event) {
                    var confirm_delete = confirm("Delete Product?");

                    if (confirm_delete) {
                        var raw = event.target.id.split('_');
                        var ASIN = String(raw[2]);
                        console.log("a delete button has been clicked..." + ASIN);

                        var data = {};
                        data.asin = ASIN;

                        // send the asin back to the server
                        $.ajax({
                                url: "/delete",
                                type: "POST",
                                dataType: "json",
                                data: JSON.stringify(data),
                                contentType: "application/json",

                                complete: function() {
                                  //called when complete
                                  console.log('process complete');
                                },
                                success: function() {
                                  console.log('process sucess');
                                },
                                error: function() {
                                  console.log('process error');
                                },
                            }); // end ajax

                        // delete the row associated with the button 
                        var R = event.target.parentNode.parentNode.rowIndex;
                        document.getElementById("prod_table").deleteRow(R);
                    }

                    }); // end delete click method

                }); // end get_prodcut_data

        }); // end get_price_point
        
        // enable the function scroll of the search button
        var search_txt = $("#search_input");
	search_txt.attr('placeholder','Search');

        search_txt.keyup(function() {
            var value = this.value;
            value = value.toLowerCase();

            $("#prod_table").find("tr").each(function(index) {
                if (index === 0) return;
                var id = $(this).find("td").first().text();
                id = id.toLowerCase();
                $(this).toggle(id.indexOf(value) !== -1);
            });
        }); // end search keyup

    } // end the create table function brace

    // call this function so the table is generated on page load
    createTable();

}); 
