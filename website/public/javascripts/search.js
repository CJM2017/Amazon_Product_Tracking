$(document).ready(function () {

    var search_bttn = $("#search_bttn");
    var search_txt = $("#search_input");

    search_bttn.on('click',function() {
        console.log(search_txt.val());
        search_txt.placeholder = "Search";
    });

});