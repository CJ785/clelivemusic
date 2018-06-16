// set document so everything is down loaded before game begins.
$(document).ready(function () {

  var eventBody = $("#event-body");
  var submitDate = $("#submit-date");
  var submitArtist = $("#submit-artist");
  var currentHeadliner,
    headlinerID;

  // $(function () {
  //   $('#datetimepicker1').datetimepicker({
  //     language: 'pt-BR'
  //   });
  // });

  // $(function () {
  //   $('#datetimepicker').datetimepicker({
  //     minDate: new Date(),
  //     disabledDates: [new Date()],
  //     inline: true,
  //     sideBySide: false
  //   });
  //   $('#datetimepicker').on('dp.change', function (event) {
  //     //console.log(moment(event.date).format('MM/DD/YYYY h:mm a'));
  //     //console.log(event.date.format('MM/DD/YYYY h:mm a'));
  //     $('#selected-date').text(event.date);
  //     var formatted_date = event.date.format('MM/DD/YYYY');
  //     $('#my_hidden_input').val(formatted_date);
  //     $('#hidden-val').text($('#my_hidden_input').val());
  //   });
  // });

  $(function () {
    $('#datetimepicker1').datetimepicker();
  });


  // create a list of all artists at the event - passed in as the artistArray
  function createArtistList(artistArray) {

    // create <div> to hold the list of artists
    var artistList = $("<div>");
    var numberOfPerformers;

    // number of performers for the current event
    numberOfPerformers = artistArray.length;

    //DO WE WANT TO LIMIT THE NUMBER OF PERFORMERS TO DISPLAY??????????
    // if (numberOfPerformers > 5) {
    //   numberOfPerformers = 5;
    // }

    for (var j = 0; j < numberOfPerformers; j++) {
      var currentBand = artistArray[j].displayName;

      // if 1st artist (headliner), make text larger and different color
      if (j == 0) {
        var newBand = $("<h4>");
        newBand.css('text-decoration', 'underline');
        newBand.css('color', 'orange');

        // headliner is the 1st performer in the list
        // headliner is the image and facebook url in the event row
        currentHeadliner = currentBand;
        headlinerID = artistArray[j].id;
      }
      else {
        var newBand = $("<p>");
      }

      // add name of band to the newBand element
      newBand.text(currentBand);

      // add current band to the artistList <div>
      artistList.append(newBand);
    }

    // return the list of artists at the event
    return artistList;
  }

  // assign a picture to the 1st <td> element in each row of the table
  // bandPic - url of an image of the headliner
  // facebookLink - url of the facebook page for the headliner
  // need i as counter to access the correct <td> element id
  function assignPicture(bandPic, facebookLink, i) {

    // access correct element id
    var element = $('#pic-' + i);

    // create an anchor element - user clicks on image and links to band's facebook page
    var anchorElement = $("<a>");
    element.text(bandPic);
    var artistImage;

    // create image element with the url to the image of the headliner
    artistImage = $("<img>").attr("src", bandPic).attr("alt", "No Image").width(100).height(100);

    // append artistImage & a linebreak to the anchor element
    anchorElement.append(artistImage);
    anchorElement.append('<br/>');

    // if a facebook url was provided, set the href attribute else append text message
    if (!(facebookLink == '') && !(facebookLink == null)) {
      anchorElement.attr("href", facebookLink).attr("target", "_blank");
    }
    else {
      anchorElement.append('No facebook url');
    }

    // empty the element then append the image as a link to the facebook page
    element.empty();
    element.append(anchorElement);
  }

  // use bandsintown api to find the image of the headliner artist and a link to their facebook page
  //   parameters
  //   artist: name of headliner
  //   counter: counter for the date's event number - needed to identify the id of the correct <td>
  function searchForArtistImage(artist, counter) {

    // create query for ajax call to bandsintown
    //var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=codingbootcamp";
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "?app_id=497d1bb241a11126c75fcc445e45e407";

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      var imageURL;
      var facebookURL;

      // url for image of headliner
      imageURL = response.thumb_url;

      // url of headliner's facebook page
      facebookURL = response.facebook_page_url;

      // since asynchronous, need to call function assignPicture to add the band's image to the 1st 
      // <td> element in the current table row
      assignPicture(imageURL, facebookURL, counter);

    });
  }

  // function to search for the events on the date selected by the user
  // uses the songkick API to find the events in the Cleveland metro area (id - 14700)
  // max and min date filters to events on the date selected by the user
  function searchForEvents() {
    eventBody.empty();
    var currentDate = "2018-06-16";

    // clean up these queryURL strings later
    //var queryURL = 'https://api.songkick.com/api/3.0/artists/217815/calendar.json?apikey=io09K9l3ebJxmxe2';
    //var queryURL='https://api.songkick.com/api/3.0/search/locations.json?location=geo:41.49,-81.6944&apikey=fBumaIA9ozKvmLJA';
    //var queryURL='https://api.songkick.com/api/3.0/artists/217815/gigography.json?apikey=fBumalA9ozKvmLJA&min_date=2018-06-01&max_date=2018-06-05';
    var queryURL = "https://api.songkick.com/api/3.0/metro_areas/14700/calendar.json?apikey=fBumaIA9ozKvmLJA&min_date=" +
      currentDate + "&max_date=" + currentDate;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      console.log(response);

      // find number of events returned by the API call
      var numberOfEvents = response.resultsPage.results.event.length;

      // For each event find information needed for the table 
      for (var i = 0; i < numberOfEvents; i++) {

        // set the current event 
        var currentEvent = response.resultsPage.results.event;
        // array of performers at the event
        var artistPerformance = response.resultsPage.results.event[i].performance;

        // set location variables
        // need lat and long for the map
        var locationCity = currentEvent[i].location.city;
        var locationLat = currentEvent[i].location.lat;
        var locationLong = currentEvent[i].location.lng;

        // for testing - remove later - displays performer's name and headliner or support
        for (var j = 0; j < artistPerformance.length; j++) {
          var artistInfo = artistPerformance[j];
          console.log("in loop artist Displayname--> " + artistInfo.displayName + " **TYPE--> " + artistInfo.billing);
        }

        // retrieve start time - original format - 18:00:00 (military time)
        var startTime = currentEvent[i].start.time;
        var formatStartTime = '';
        // if start time provided - change format from military time
        if (startTime !== null) {
          formatStartTime = moment(startTime, "HH:mm").format("h:mm a");
        }
        else {
          formatStartTime = "No Time Provided";
        }

        //create a new table row with correct table data elements
        var newRow = $("<tr>"),
          newPic = $("<td>"),           // band image
          newEvent = $("<td>"),         // event
          newArtist = $("<td>"),        // list of all artists at the event
          newVenue = $("<td>"),         // venue for the event
          newTime = $("<td>"),          // start time for the event
          newMap = $("<td>");           // map for location of the event

        // used for testing - take out later
        //newRow.attr('data-row', i);
        //newPic.attr('data-event', i);

        // set an id to access the <td> that holds the headliner image
        newPic.attr('id', 'pic-' + i);

        // set <td> for the event
        newEvent.text(currentEvent[i].displayName)
        newEvent.css("max-width", "200px");

        // set <td> for the venue
        newVenue.text(currentEvent[i].venue.displayName);

        // set <td> for start time
        newTime.text(formatStartTime);

        // modify with map info
        // set <td> for map
        newMap.text("Map");

        // create a list of performer at the event for <td>
        // parameter: artistPerformance array
        newArtist.html(createArtistList(artistPerformance));

        // append all <td> to the table row <tr>
        newRow.append(newPic, newEvent, newArtist, newVenue, newTime, newMap);

        // append the newly created row to the table body
        eventBody.append(newRow);

        // call function to find the image and facebook url for headliner (1st performer in the list)
        // parameters:
        //    current headline performer
        //    i: need the performer counter to identify <td> piture element for the correct row
        searchForArtistImage(currentHeadliner, i);

      }
    });
  }

  $('.submit-date').on('click', function (event) {
    var mapGenerate = $('<div>');
    mapGenerate.attr('id', 'loc');
    mapGenerate.attr('height', 200);
    mapGenerate.attr('width', 200);
    mapGenerate.attr('background-color', 'blue');

    console.log(mapGenerate);

    var locationLat = currentEvent[i].location.lat;
    var locationLong = currentEvent[i].location.lng;
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2o3ODUiLCJhIjoiY2ppYXl4azU5MWNhejNrazJlbmRuOTEwciJ9.SdH4eVQ3k9Sl-VUwx7Qo7Q';
    var newMap = new mapboxgl.Map({
        container: mapId,
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [locationLat, locationLong],
        zoom: 10
    });

    newMap.addControl(new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }), 'top-right');

    //adds the zoom buttons to the map 
    var nav = new mapboxgl.NavigationControl(); newMap.addControl(nav, 'top-right');

    //adds the user geo-locate button to the map 
    newMap.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }));
    newMap.empty();
    $('#loc').append(newMap);
    $('#newMap').append(mapGenerate);

});
   

  // used in testing - will delete this function later
  // submitArtist.on("click", function (event) {
  //   // Preventing the button from trying to submit the form
  //   event.preventDefault();

  //   //var myartist = 'Shania Twain';
  //   //var myartist = 'Hello Luna';
  //   var myartist = 'Kenny Chesney';
  //   searchForArtist(myartist);
  // });


  // at this point in time, I just have a submit button - will need to incorporate the calender
  // when user selects a date, call the searchForEvents function to find music events in the Cleveland metro area
  submitDate.on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();

    searchForEvents();
  });
});
