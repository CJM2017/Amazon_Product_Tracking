$(document).ready(function () {

    // document id variables
    var URL = $("#URL_Form");
    var URL_String = $("#Product");
    var price_point = $("#price_point");

    // on the action of the submit button
    URL.on('submit', function(e){
        e.preventDefault();
        var raw = URL_String.val();
        var parsed = raw.split("/");
        console.log(raw);

        // find the product asin code
        var ASIN = "";
        for (var i = 0; i < parsed.length; i++) {
            if ( parsed[i] == "dp") {
                ASIN = parsed[i+1];
                break;
            }
        }

        // create the dictionary data obj
        var data = {};
        data.asin = ASIN;
        data.price_point = price_point.val();
        data.update = $('#radio_group input:radio:checked').val();

        console.log(data.asin);
        console.log(data.price_point);
        console.log(data.update);

        // send a post request back to the server
        if (data.asin == "" || data.price_point == "" || data.update == undefined) {
            alert("Invalid Entry")
        } else {
            $.ajax({
                    url: "/save_asin",
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
                });
            alert("Product added successfuly");        
            this.reset();
        }
    });
});