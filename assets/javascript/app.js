//  javascript / JQuery Project 1 - Cleveland Live Music
//  Brian Macauley, Jason Way, Stacie Knisley, Rhonda Johnson 

// set document so everything is down loaded before game begins.
$(document).ready(function () {

  var eventBody = $("#event-body");
  var submitDate = $("#submit-date");
  var submitArtist = $("#submit-artist");
  var noEvents = $('#no-events');
  var currentHeadliner,
    headlinerID;
  var newDate;

  // set accessToken for the Mapbox API
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2o3ODUiLCJhIjoiY2ppYXl4azU5MWNhejNrazJlbmRuOTEwciJ9.SdH4eVQ3k9Sl-VUwx7Qo7Q';

  // display calendar / datepicker
  $(function () {
    $('#datetimepicker').datetimepicker({
      inline: true,
      sideBySide: false,
      minDate: new Date(),
      disabledDates: [new Date()],
      // the below format removes the timeclock
      format: 'DD/MM/YYYY'
    });
  });

  // when user clicks to change to new date, display currently selected date
  $('#datetimepicker').on('dp.change', function (event) {
    $('#selected-date').text(event.date);
    var formatted_date = event.date.format('MM/DD/YYYY');
    $('.date').val(formatted_date);
    $('#hidden-val').text($('.date').val());
  });


  // create a list of all artists at the event - passed in as the artistArray
  function createArtistList(artistArray) {

    // create <div> to hold the list of artists
    var artistList = $("<div>");
    var numberOfPerformers;

    // number of performers for the current event
    numberOfPerformers = artistArray.length;

    // Limit the number of displayed performers
    if (numberOfPerformers > 5) {
      numberOfPerformers = 5;
    }

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
      anchorElement.append('Open Facebook');
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

    // replace known special characters with nothing
    var formatArtist = artist.replace("'", "");
    formatArtist = formatArtist.replace('[', '');
    formatArtist = formatArtist.replace(']', '');
    formatArtist = formatArtist.replace('/', '');


    // create query for ajax call to bandsintown
    var queryURL = "https://rest.bandsintown.com/artists/" + formatArtist + "?app_id=497d1bb241a11126c75fcc445e45e407";

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
  function searchForEvents(currentDate) {
    noEvents.empty();
    eventBody.empty();

    // for songkick, the date needs to be in the formst "YYYY-MM-DD"

    // set songkick query string
    var queryURL = "https://api.songkick.com/api/3.0/metro_areas/14700/calendar.json?apikey=fBumaIA9ozKvmLJA&min_date=" +
      currentDate + "&max_date=" + currentDate;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {

      //create a new table row with correct table data elements
      var newRow = $("<tr>"),
        newPic = $("<td>"),           // band image
        newEvent = $("<td>"),         // event
        newArtist = $("<td>"),        // list of all artists at the event
        newVenue = $("<td>"),         // venue for the event
        newTime = $("<td>"),          // start time for the event
        newMap = $("<td>");           // map for location of the event
      var numberOfEntries = response.resultsPage.totalEntries;

      if (numberOfEntries == 0) {
        noEvents.html("<h2>NO EVENTS ON SELECTED DATE</h2>");
        noEvents.css({
          'text-align': 'center',
          'font-weight': 'bold',
          'color': 'red',
          'background-color': 'white'
        });

        // console.log("No Events on that date");

        return;
      }

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
        // for (var j = 0; j < artistPerformance.length; j++) {
        //   var artistInfo = artistPerformance[j];
        //   console.log("in loop artist Displayname--> " + artistInfo.displayName + " **TYPE--> " + artistInfo.billing);
        // }

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


        // set an id to access the <td> that holds the headliner image & the map
        newPic.attr('id', 'pic-' + i);
        newMap.attr('id', 'map-' + i);

        // set <td> for the event
        newEvent.text(currentEvent[i].displayName)
        newEvent.css("max-width", "200px");

        // set <td> for the venue
        newVenue.text(currentEvent[i].venue.displayName);

        // set <td> for start time & date
        newTime.append(formatStartTime).append('<br/>').append(newDate);


        // modify with map info
        // set <td> for map
        newMap.attr('data-lat', locationLat);
        newMap.attr('data-long', locationLong);

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

        addMap(locationLat, locationLong, i);

      }
    });
  }

  // function to add the smaller map to the event row
  function addMap(lat, long, counter) {
    var element = $('#map-' + counter);
    var mapDiv = $('<div>');
    var mapAnchor = $('<a>');

    // <a>: when user clicks on the small map, a larger map will open in a modal
    // set attributes for <a> element
    mapAnchor.attr('href', '#mapModal');
    mapAnchor.attr('rel', 'modal:open');
    mapAnchor.attr('class', 'click-map');
    mapAnchor.attr('data-lat', lat);
    mapAnchor.attr('data-long', long);

    // set attributes for the smaller map that will displayin the table
    mapDiv.attr('id', 'loc-' + counter);
    mapDiv.attr('height', 200);
    mapDiv.attr('width', 200);
    mapDiv.attr('class', 'venue-map');
    mapDiv.attr('data-lat', lat);
    mapDiv.attr('data-long', long);

    // append the mapDiv to the mapAnchor then append to the correct map element
    mapAnchor.append(mapDiv);
    element.append(mapAnchor);

    // set correct container id for the map
    var mapContainer = 'loc-' + counter;

    // create map of the venue location using MapBox
    // the latitude and longitude of the venue was found in SongKick API
    //mapboxgl.accessToken = 'pk.eyJ1IjoiY2o3ODUiLCJhIjoiY2ppYXl4azU5MWNhejNrazJlbmRuOTEwciJ9.SdH4eVQ3k9Sl-VUwx7Qo7Q';
    var venueMap = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [long, lat],
      zoom: 15
    });

    // create purple dot as the map marker
    var dot = document.createElement('div');
    dot.className = 'marker';
    dot.style.backgroundColor = 'purple';
    dot.style.width = '20px';
    dot.style.height = '20px';

    // add marker to map
    new mapboxgl.Marker(dot)
      .setLngLat([long, lat])
      .addTo(venueMap);
  }

  // open modal with larger map when click on the small map
  // Used table "eventBody" since that is the closest static (not dynamically created) element
  eventBody.on("click", "a.click-map", function () {

    // get the latitude and longitude values for the venue
    // values are stored as data-lat & data-long on the <a> element with a class of 'click-map'
    var currentLat = ($(this).attr("data-lat"));
    var currentLong = ($(this).attr("data-long"));

    //mapboxgl.accessToken = 'pk.eyJ1IjoiY2o3ODUiLCJhIjoiY2ppYXl4azU5MWNhejNrazJlbmRuOTEwciJ9.SdH4eVQ3k9Sl-VUwx7Qo7Q';

    // create the larger map that will be placed in the modal
    var bigmap = new mapboxgl.Map({
      container: 'bigmap',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [currentLong, currentLat],
      zoom: 15
    });

    // create red big marker for the big map
    var big = document.createElement('div');
    big.className = 'marker';
    big.style.backgroundColor = 'red';
    big.style.width = '20px';
    big.style.height = '20px';

    // add marker to map
    new mapboxgl.Marker(big)
      .setLngLat([currentLong, currentLat])
      .addTo(bigmap);
  });

  // when user submits a date, call the searchForEvents function to find music events in the Cleveland metro area
  submitDate.on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();
    // set the date selected from the calendar
    // the date selected is currently in the format "MM/DD/YYY"
    newDate = $("#hidden-val").text().trim();

    var randomFormat = "MM/DD/YYYY";
    var convertedDate = moment(newDate, randomFormat);

    // format date for the songkick API
    var formattedDate = moment(convertedDate).format("YYYY-MM-DD");

    searchForEvents(formattedDate);
  });
});

