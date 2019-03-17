function videoSearch() {
  var searchInput; // variable for user's search

  // take in the user's search for results
  searchInput = document.getElementById("searchBar");

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  const url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video";
  console.log(url); // keep track of what was searched
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  Http.onreadystatechange=(e)=>{
    var processedResponse = escapeSpecialChars(Http.responseText); // response of the search results from api call
    console.log(processedResponse)
    obj = JSON.parse(processedResponse); // parsing throught the api call from url

    document.getElementById("results").innerHTML = "Total Results: " + obj.collection.total_hits + " videos<p>";

    // loop to go through the responses of the url
    for (var i = 0; i < obj.collection.items.length; i++) {
      var video = document.createElement("IMG")
      video.setAttribute("src", obj.collection.items[i].links[0].href);
      video.setAttribute("alt", obj.collection.items[i].data[0].title);
      document.getElementById("results").innerHTML += "<img id=thumbnail src=" + video.src + "><p>";

      const videoUrl = "http://images-assets.nasa.gov/video/"+ encodeURIComponent(obj.collection.items[i].data[0].nasa_id) + "/" + encodeURIComponent(obj.collection.items[i].data[0].nasa_id) + "~orig.mp4";

      var initDescription = obj.collection.items[i].data[0].description;
      var finalDescription;
      if (initDescription.length > 300){
        finalDescription = "\"" + initDescription.substr(0,300) + '\" ...more';

      } else {
        finalDescription = "\"" + initDescription + "\"";
      }

      var heart = document.createElement("img");
      heart.setAttribute('src', "images/heart-gray.png")
      document.getElementById("results").innerHTML += "<div id=info><strong>" + video.alt + "</strong><p><i>" + finalDescription + "</i><p>" + "<a href=" + videoUrl + ">View Image</a><p><img class=heart src=" +
      heart.src + " onmouseover=hover(this); onmouseout=unhover(this);></p>";
  }
}
}

function imageSearch() {
  var searchInput; // variable for user's search
  var startInput;
  var endInput;

  // take in the user's search for results
  searchInput = document.getElementById("searchBar");
  startInput = document.getElementById("startDate");
  endIput = document.getElementById("endDate");

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  const url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=image";
  console.log(url); // keep track of what was searched
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  Http.onreadystatechange=(e)=>{
    var processedResponse = escapeSpecialChars(Http.responseText); // response of the search results from api call
    console.log(processedResponse)
    obj = JSON.parse(processedResponse); // parsing throught the api call from url

    document.getElementById("results").innerHTML = "Total Results: " + obj.collection.metadata.total_hits + " images<p>";
    var imageTitles = [];
    // loop to go through the responses of the url
    for (var i = 0; i < obj.collection.items.length; i++) {
      if (imageTitles[0] == undefined || imageTitles.indexOf(obj.collection.items[i].data[0].title) == -1){
        imageTitles.push(obj.collection.items[i].data[0].title);
        var image = document.createElement("IMG")
        image.setAttribute("src", obj.collection.items[i].links[0].href);
        image.setAttribute("alt", obj.collection.items[i].data[0].title);
        document.getElementById("results").innerHTML += "<img id=thumbnail src=" + image.src + "><p>";

        const imageUrl = "http://images-assets.nasa.gov/image/"+ encodeURIComponent(obj.collection.items[i].data[0].nasa_id) + "/" + encodeURIComponent(obj.collection.items[i].data[0].nasa_id) + "~orig.tif";

        var initDescription = obj.collection.items[i].data[0].description;
        console.log(initDescription)
        var finalDescription;
        if (initDescription.length > 300){
          finalDescription = "\"" + initDescription.substr(0,300) + '\" ...more';
        } else {
          finalDescription = "\"" + initDescription + "\"";
        }

        var heart = document.createElement("img");
        heart.setAttribute('src', "images/heart-gray.png")
        document.getElementById("results").innerHTML += "<div id=info><strong>" + image.alt + "</strong><p><i>" + finalDescription + "</i><p>" + "<a href=" + imageUrl + ">View Image</a><p><img class=heart src=" +
        heart.src + " onmouseover=hover(this); onmouseout=unhover(this);></p>";
      } else {
        document.getElementById("results").innerHTML += "More Thumbnails: ";
        var j = i;
        while (imageTitles[imageTitles.length - 1] == obj.collection.items[j].data[0].title) {
          const imageUrl = "http://images-assets.nasa.gov/image/"+ encodeURIComponent(obj.collection.items[j].data[0].nasa_id) + "/" + encodeURIComponent(obj.collection.items[j].data[0].nasa_id) + "~orig.tif";
          document.getElementById("results").innerHTML += "<a href="+ imageUrl +">Source " + (j- i + 1) + "</a>   ";
        }
        document.getElementById("results").innerHTML += "<p>";
        i = j;
      }

      }

  }
}

function audioSearch() {
  var searchInput; // variable for user's search
  var startInput;
  var endInput;

  // take in the user's search for results
  searchInput = document.getElementById("searchBar");
  startInput = document.getElementById("startDate");
  endIput = document.getElementById("endDate");

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  const url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=audio";
  console.log(url); // keep track of what was searched
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  Http.onreadystatechange=(e)=>{
    var processedResponse = escapeSpecialChars(Http.responseText); // response of the search results from api call
    console.log(processedResponse)
    obj = JSON.parse(processedResponse); // parsing throught the api call from url

    document.getElementById("results").innerHTML = "Total Results: " + obj.collection.metadata.total_hits + " audios<p>";

    // loop to go through the responses of the url
    for (var i = 0; i < obj.collection.items.length; i++) {
      var dateStr = obj.collection.items[i].data[0].date_created;
      var audio = document.createElement("img");
      audio.setAttribute("id", "thumbnail");
      audio.setAttribute("src", "images/audio_thumbnail.png");
      audio.setAttribute("alt", obj.collection.items[i].data[0].title);
      document.getElementById("results").innerHTML += "<img id=" + audio.id + " src=" + audio.src + "><p>";
      const aud = new XMLHttpRequest();
      var audioUrl = obj.collection.items[i].href;
      var audioJson = accessUrl(aud, audioUrl);
      var audResponse = escapeSpecialChars(audioJson);
      audObj = JSON.parse(audResponse);
      audioUrl = audObj[0];

      var initDescription = obj.collection.items[i].data[0].description;
      var finalDescription;
      if (initDescription.length > 300){
        finalDescription = "\"" + initDescription.substr(0,300) + '\" ...more';
      } else {
        finalDescription = "\"" + initDescription + "\"";
      }
      var heart = document.createElement("img");
      heart.setAttribute('src', "images/heart-gray.png")
      document.getElementById("results").innerHTML += "<div id=info><strong>" + audio.alt + "</strong><p><i>" + finalDescription + "</i><p>" + "<a href=" + encodeURI(audioUrl) + ">Listen to Audio</a><p><img class=heart src=" +
      heart.src + " onmouseover=hover(this); onmouseout=unhover(this);></p>";
    }
  }
}

function accessUrl(Http, url) {
  Http.open("GET", url, false);
  Http.send( null );
  return Http.responseText;
}

function addToFavorites() {

}

function submitDate() {
  var startInput = document.getElementById("startDate");
  var endInput = document.getElementById("endDate");
}

function checkDate(startInput, endInput, dateStr) {
  if (startInput != null && endInput != null) {
    var start = new Date(startInput);
    var end = new Date(endInput);
    var date = new Date(dateStr.substr(0,10));

    if (start.getFullYear() < date.getFullYear() && end.getFullYear() > date.getFullYear) {
      if (start.getMonth() < date.getMonth() && end.getMonth() > date.getMonth()) {
        if (start.getDate() <= date.getDate() && end.getDate() >= date.getDate()) {
          return true;
        } else {
          return false;
        }
      } else if (start.getMonth() == date.getMonth() && end.getMonth() == date.getMonth()) {
        if (start.getDate() <= date.getDate() && end.getDate() >= date.getDate()) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else if (start.getFullYear() == date.getFullYear() && end.getFullYear() == date.getFullYear()) {
      if (start.getMonth() < date.getMonth() && end.getMonth() > date.getMonth()) {
        if (start.getDate() <= date.getDate() && end.getDate() >= date.getDate()) {
          return true;
        } else {
          return false;
        }
      } else if (start.getMonth() == date.getMonth() && end.getMonth() == date.getMonth()) {
        if (start.getDate() <= date.getDate() && end.getDate() >= date.getDate()) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;

}

function hover(element) {
  element.setAttribute('src', "images/heart-red.png");
}

function unhover(element) {
  element.setAttribute('src', "images/heart-gray.png");
}

/* this function was found here: http://qnimate.com/json-parse-throws-unexpected-token-error-for-valid-json/
  It cleans up the JSON when the it returns from the API call.
*/
function escapeSpecialChars(jsonString) {
           return jsonString.replace(/\n/g, "\\n")
               .replace(/\r/g, "\\r")
               .replace(/\t/g, "\\t")
               .replace(/\f/g, "\\f");
}
