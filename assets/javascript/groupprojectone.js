// set document so everything is down loaded before game begins.
$(document).ready(function () {

  var eventBody = $("#event-body");
  var submitDate = $("#submit-date");


  // $(function () {
  //   $('#datetimepicker1').datetimepicker({
  //     language: 'pt-BR'
  //   });
  // });

  //function searchBandsInTown(artist) {
  function searchForEvent() {
    eventBody.empty();
    var currentDate = "2018-06-16";
    // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
    //var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=codingbootcamp";
    //var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=497d1bb241a11126c75fcc445e45e407";
    // var queryURL = "https://rest.bandsintown.com/artists/Kenny%20Chesney/" + 
    // "events?app_id=497d1bb241a11126c75fcc445e45e407&date=2018-06-01%2C2018-06-10";
    //var queryURL = 'https://api.songkick.com/api/3.0/artists/217815/calendar.json?apikey=io09K9l3ebJxmxe2';
    //var queryURL='https://api.songkick.com/api/3.0/search/locations.json?location=geo:41.49,-81.6944&apikey=fBumaIA9ozKvmLJA';
    //var queryURL='https://api.songkick.com/api/3.0/artists/217815/gigography.json?apikey=fBumalA9ozKvmLJA&min_date=2018-06-01&max_date=2018-06-05';
    var queryURL = "https://api.songkick.com/api/3.0/metro_areas/14700/calendar.json?apikey=fBumaIA9ozKvmLJA&min_date=" +
      currentDate + "&max_date=" + currentDate;
    //"2018-06-13" + "&max_date=" + "2018-06-13";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      console.log(response);

      // Printing the entire object to console
      console.log("queryurl = " + queryURL);
      var numberOfEvents = response.resultsPage.results.event.length;
      console.log("number of events = " + numberOfEvents);

      for (var i = 0; i < numberOfEvents; i++) {
        var currentEvent = response.resultsPage.results.event;
        console.log('************************************')
        console.log("type--> " + currentEvent[i].type);
        console.log("eventdisplayname--> " + currentEvent[i].displayName);
        // console.log("type " + response.resultsPage.results.event[i].type);
        // console.log("eventdisplayname" + response.resultsPage.results.event[i].displayName);
        var artistPerformance = response.resultsPage.results.event[i].performance;
        var locationCity = currentEvent[i].location.city;
        var locationLat = currentEvent[i].location.lat;
        var locationLong = currentEvent[i].location.lng;
        console.log("location city " + locationCity);
        console.log("location lat " + locationLat);
        console.log("location long " + locationLong);
        console.log("artist array length--> " + artistPerformance.length)
        //console.log("artistlength " + response.resultsPage.results.event[0].performance.length )
        //console.log("artist Displayname " + artistArray[i].displayName + " type= " + artistArray[i].billing);
        //console.log("before for loop = artistarray.length " + artistPerformance.length);
        for (var j = 0; j < artistPerformance.length; j++) {

          var artistInfo = artistPerformance[j];
          console.log("in loop artist Displayname--> " + artistInfo.displayName + " **TYPE--> " + artistInfo.billing);

        }

        console.log('Start Time--> ' + currentEvent[i].start.time);
        var startTime = currentEvent[i].start.time;
        var formatStartTime = '';
        if (startTime !== null) {
          formatStartTime = moment(startTime, "HH:mm").format("hh:mm a");
        }
        else {
          formatStartTime = "No Time Provided";
        }
        // var formatStartTime = moment(currentEvent[i].start.time,"HH:mm");
        //var formatStartTime = moment.unix(currentEvent[i].start.time).format("hh:mm:ss");

        // // Time is 3:30 AM
        // var firstTime = "03:30";

        // // First Time (pushed back 1 year to make sure it comes before current time)
        // var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        // console.log(firstTimeConverted);


        console.log('Pretty Start Time--> ' + formatStartTime);
        console.log('Venue--> ' + currentEvent[i].venue.displayName);
        //console.log("after inner for loop");
        console.log('************************************')

        //create a new table row with correct table data elements
        var newRow = $("<tr>"),
          newPic = $("<td>"),
          newArtist = $("<td>"),
          newVenue = $("<td>"),
          newTime = $("<td>"),
          newMap = $("<td>");


        newPic.text("Picture");
        newArtist.text(artistInfo.displayName);
        newVenue.text(currentEvent[i].venue.displayName);
        newTime.text(formatStartTime);
        newMap.text("Map");

        newRow.append(newPic).append(newArtist).append(newVenue).append(newTime).append(newMap);

        eventBody.append(newRow);

      }

      //     //create a new table row with correct table data elements
      //     var newRow = $("<tr>"),
      //     newTD1 = $("<td>"),
      //     newTD2 = $("<td>"),
      //     newTD3 = $("<td>"),
      //     newTD4 = $("<td>"),
      //     newTD5 = $("<td>"),
      //     newTD6 = $("<td>");

      // newTD1.text(trainName);
      // newTD2.text(trainDestination);
      // newTD3.text(trainFrequency + " min");
      // newTD4.text(nextArrival);
      // newTD5.text(tMinutesTillTrain + " min");
      // // append all td elements to the table row
      // newRow.append(newTD1).append(newTD2).append(newTD3).append(newTD4).append(newTD5).append(newTD6);

      // // append the new row to the train info table
      // trainBody.append(newRow);

      console.log(response);
    });
  }



  submitDate.on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();
    // Storing the artist name
    //var inputArtist = $("#artist-input").val().trim();

    // Running the searchBandsInTown function (passing in the artist as an argument)
    //searchBandsInTown(inputArtist);
    searchForEvent();
  });




});

