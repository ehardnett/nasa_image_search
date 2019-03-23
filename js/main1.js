var localAvail;
var sessionAvail;
var dateAvail = true;

/*
  These two try-catch blocks are to check if there is storage capability in that browser. If there isn't then
  a warning message will display at the top of the screen.
*/
try {
  localStorage.setItem('test', "test");
  localStorage.removeItem('test');
  localAvail = true;
} catch(ex) {
  localAvail = false;
}

try {
  sessionStorage.setItem('test', "test");
  sessionStorage.removeItem('test');
  sessionAvail = true;
} catch(ex) {
  sessionAvail = false;
}

// warning for when storage is not available
if (sessionAvail == false || localAvail == false) {
  document.getElementById("storage").innerHTML = "<p><strong>NOTICE: This browser does not support a storage component. Because of this, the \'Favorites\' Page will not work. For full capability, use Google Chrome or Firefox.</strong></p>";
}

/*
  This check is for if it is possible for a date to be entered. If so, then that function will be enabled.
  Otherwise, the input box will be changed for text with a specific pattern.
*/
var datefield = document.createElement("input");
datefield.setAttribute("type", "date");
if (datefield.type != "date") {
  dateAvail = false;
}

var favoriteImgs = []; // array to store all favorited images
var currentPage = []; // array to store the current page informaiton
var inGrid = false; // checks to see if the display is a grid view
var inList = false; // checks to see if the display is in list view (default)

/*
  videoSearch()
  This is the search for all videos in the NASA database that match the search input.
  First, it takes in all the inputs from the dates, search, and locations. From there, it
  generates the url to access the JSON from the NASA Image API. A simple for loop is used to
  parse through the JSON and get all the information needed to develop my page. Everything is loaded
  into the "results" div in the document.
  - NOTE: Videos do not have a difference in their size. Therefore, that function is not available here.
*/
function videoSearch() {
  var searchInput, startInput, endInput, locationInput;
  currentPage = [];

  //changing the input type and patterns of the date inputs
  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
  }

  //load the appropriate refine search options for video: location and date
  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("size").style.visibility = "hidden";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible"; //for loading purposes

  //acquire all the input values for: search, dates, and locations
  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate").value; //user's start date option
  endInput = document.getElementById("endDate").value; //user's end date option
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text; //user's location select

  const Http = new XMLHttpRequest(); //creating a new html for the website

  //get the right url based on if there is a location input or not
  var url;
  if (locationInput == "Select location...") {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video";
  } else {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video&location=" + encodeURIComponent(locationInput);
  }

  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput); // check to see if the range is acceptable
  if (dateFilter == null) {
    alert("Invaild Date Range");
  } else {
    Http.onreadystatechange=(e)=> {
      var status = Http.status;
      if (status >= 200 && status <= 299){
        obj = JSON.parse(Http.responseText); // parsing throught the api call from url

        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " videos<p>";

        for (var i = 0; i < obj.collection.items.length; i++) {
          var title, video, finalDescription, videoUrl, locationStr, dateStr, nasaId;
          title = obj.collection.items[i].data[0].title;
          finalDescription = cutDescription(obj, i);
          locationStr = obj.collection.items[i].data[0].location;
          dateStr = obj.collection.items[i].data[0].date_created;
          nasaId = obj.collection.items[i].data[0].nasa_id;

          //check to make sure everything is defined; otherwise assign it a value
          if (title == undefined){
            title = "No title available";
          }
          if (finalDescription == undefined) {
            finalDescription = "No description available"
          }
          if (locationStr == undefined) {
            locationStr = "No location available";
          }
          if (dateStr == undefined) {
            dateStr = "No date available";
          }

          video = document.createElement("img");

          video.setAttribute("src", obj.collection.items[i].links[0].href);
          video.setAttribute("alt", title);
          videoUrl = "http://images-assets.nasa.gov/video/" + encodeURIComponent(nasaId) + "/" + encodeURIComponent(nasaId) + "~orig.mp4";
          document.getElementById("results").innerHTML += "<a href= " + encodeURI(videoUrl) + "><img id=thumbnail src=" + video.src + "></a><p>"; //thumbnail for the source

          //generic info gathered
          var info = {id: JSON.stringify(nasaId), pic: video.src, title: video.alt, describe: finalDescription, thumb: "", heart: "images/heart-gray.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};
          // the heart source changes in case of the image having been previously saved to favorites
          var liked = {id: JSON.stringify(nasaId), pic: video.src, title: video.alt, describe: finalDescription, thumb: "", heart: "images/heart-red.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};

          addToResults(JSON.stringify(info), JSON.stringify(liked));
        }
        document.getElementById("rocket").style.visibility = "hidden"; //loading is done
        inList = true; //currently in a list view format
        inGrid = false;
      } else {
        var code = handleErrors(status);
        document.getElementById("results") += "<h2>" + code + "</h2>";
      }
    }
  }
}

/*
  imageSearch()
  This is the search for all images in the NASA database that match the search input.
  First, it takes in all the inputs from the dates, search, and locations. From there, it
  generates the url to access the JSON from the NASA Image API. A simple for loop is used to
  parse through the JSON and get all the information needed to develop my page. Everything is loaded
  into the "results" div in the document.
  - NOTE: if the titles from a previous image match with the next one, then there are smaller
  thumbnails created to be put next to the first occurrence in the search.
*/
function imageSearch() {
  var searchInput, startInput, endInput, locationInput, sizeInput;

  //changes the date inputs to text if date is not available and adds a required pattern
  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
  }

  //sets the correct search options to be visible: all of them work for images
  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("size").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible";
  currentPage = []; //reset current page array

  //obtain the inputs of the
  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate").value; //user's start date option
  endInput = document.getElementById("endDate").value; //user's end date option
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text; //user's location select
  sizeInput = document.getElementById("resize").options[document.getElementById("resize").selectedIndex].text; //user's size select

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  var url;
  if (locationInput == "Select location...") {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=image";
  } else {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video&location=" + encodeURIComponent(locationInput);
  }

  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput);
  if (dateFilter == null) {
    alert("Invaild Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299){
        obj = JSON.parse(Http.responseText);

        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " images<p>";
        var imageTitles = [];

        for (var i = 0; i < obj.collection.items.length; i++) {
          var title, image, finalDescription, imageUrl, locationStr, dateStr, nasaId, thumbnails, imageJson;
          title = obj.collection.items[i].data[0].title;
          finalDescription = cutDescription(obj, i);
          locationStr = obj.collection.items[i].data[0].location;
          dateStr = obj.collection.items[i].data[0].date_created;
          imageUrl = obj.collection.items[i].href;
          nasaId = obj.collection.items[i].data[0].nasa_id;

          if (title == undefined){
            title = "No title available";
          }
          if (finalDescription == undefined) {
            finalDescription = "No description available"
          }
          if (locationStr == undefined) {
            locationStr = "No location available";
          }
          if (dateStr == undefined) {
            dateStr = "No date available";
          }

          image = document.createElement("img");
          image.setAttribute("src", obj.collection.items[i].links[0].href);
          image.setAttribute("alt", title);
          if (sizeInput != "Select size") {
            imageUrl = "http://images-assets.nasa.gov/image/" + encodeURIComponent(nasaId) + "/" + encodeURIComponent(nasaId) + "~" + sizeInput.toLowerCase() + ".jpg";
            document.getElementById("results").innerHTML += "<a href= " + encodeURI(imageUrl) + "><img id=thumbnail src=" + image.src + "></a><p>";
          } else {
            const img = new XMLHttpRequest();
            imageJson = accessUrl(img, imageUrl);
            if (imageJson != undefined) {
              imgObj = JSON.parse(imageJson);
              imageUrl = imgObj[0];
              document.getElementById("results").innerHTML += "<a href= " + encodeURI(imageUrl) + "><img id=thumbnail src=" + image.src + "></a><p>";
            } else {
              document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + image.src + "></a><p>";
            }
          }


          if (i < (obj.collection.items.length - 1)) {
            thumbnails += addThumbnails(obj, i, imageUrl, imageTitles);
          }

          var info = {id: nasaId, pic: image.src, title: image.alt, describe: finalDescription, thumb: thumbnails, heart: "images/heart-gray.png", media: "image", location: locationStr, date: dateStr, url: imageUrl};
          var liked = {id: nasaId, pic: image.src, title: image.alt, describe: finalDescription, thumb: thumbnails, heart: "images/heart-red.png", media: "image", location: locationStr, date: dateStr, url: imageUrl};

          addToResults(JSON.stringify(info), JSON.stringify(liked));
        }
        document.getElementById("rocket").style.visibility = "hidden";
        inList = true;
        inGrid = false;
      } else {
        var code = handleErrors(status);
        document.getElementById("results") += "<h2>" + code;
      }
    }
  }
}

/*
  audioSearch()
  This is the search for all audio results in the NASA database that match the search input.
  First, it takes in all the inputs from the dates and search. From there, it
  generates the url to access the JSON from the NASA Image API. A simple for loop is used to
  parse through the JSON and get all the information needed to develop my page. Everything is loaded
  into the "results" div in the document.
  - NOTE: For audio results, there is no way to sort by location, therefore, that option is disabled.
  - NOTE: Audio results didn't have a thumbnail to use in the JSON, so a simple audio thumbnail has been
  set for all results.
*/

function audioSearch() {
  var searchInput, startInput, endInput;

  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
  }

  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("size").style.visibility = "hidden";
  document.getElementById("locate").style.visibility = "hidden";
  document.getElementById("rocket").style.visibility = "visible";
  currentPage = [];

  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate").value; //user's start date option
  endInput = document.getElementById("endDate").value; //user's end date option

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  const url = "https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=audio";
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput);
  if (dateFilter == null) {
    alert("Invalid Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299) {
        obj = JSON.parse(Http.responseText);
        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " audio results<p>";

        for (var i = 0; i < obj.collection.items.length; i++) {
          var title, audio, finalDescription, audUrl, audioUrl, locationStr, dateStr, nasaId, audioJson;
          title = obj.collection.items[i].data[0].title;
          finalDescription = cutDescription(obj, i);
          locationStr = obj.collection.items[i].data[0].location;
          dateStr = obj.collection.items[i].data[0].date_created;
          audUrl = obj.collection.items[i].href;
          nasaId = obj.collection.items[i].data[0].nasa_id;

          if (title == undefined){
            title = "No title available";
          }
          if (finalDescription == undefined) {
            finalDescription = "No description available"
          }
          if (locationStr == undefined) {
            locationStr = "No location available";
          }
          if (dateStr == undefined) {
            dateStr = "No date available";
          }

          audio = document.createElement("img");
          audio.setAttribute("src", "images/audio_thumbnail.png");
          audio.setAttribute("alt", title);

          const aud = new XMLHttpRequest();
          audioJson = accessUrl(aud, audUrl);
          if (audioJson != undefined) {
            audObj = JSON.parse(audioJson);
            audioUrl = audObj[0];
            document.getElementById("results").innerHTML += "<a href= " + encodeURI(audioUrl) + "><img id=thumbnail src=" + audio.src + "></a><p>";
          } else {
            document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + audio.src + "></a><p>";
          }
          console.log(audioUrl);
          var info = {id: JSON.stringify(nasaId), pic: audio.src, title: audio.alt, describe: finalDescription, heart: "images/heart-gray.png", media: "audio", thumb: "", location: locationStr, date: dateStr, url: audioUrl};
          var liked = {id: JSON.stringify(nasaId), pic: audio.src, title: audio.alt, describe: finalDescription, heart: "images/heart-red.png", media: "audio", thumb: "", location: locationStr, date: dateStr, url: audioUrl};

          addToResults(JSON.stringify(info), JSON.stringify(liked));
        }
        document.getElementById("rocket").style.visibility = "hidden";
        inList = true;
        inGrid = false;
      } else {
        var code = handleErrors(status);
        document.getElementById("results") += "<h2>" + code;
      }
    }
  }
}

/*
  handleErrors()
  From the API, I was able to find the status codes for some errors. In the event of an error in loading the
  search results, the appropriate message will appear in the "results" id.
    status: the current status of the url for the request
*/
function handleErrors(status) {
  if (status == 400) {
    return "Error 400 - Invalid Request";
  } else if (status == 404) {
    return "Error 404 - Not Found";
  } else if (status >= 500 && status <= 599) {
    return "Error " + status + " - Server Error";
  } else {
    return "Error " + status;
  }
}

/*

*/
function accessUrl(Http, url) {
  Http.open("GET", url, false);
  Http.send( null );
  if (Http.status >= 200 && Http.status <= 299) {
    return Http.responseText;
  }
  return undefined;
}

function addThumbnails(obj, i, imageUrl, imageTitles) {
  var str = "";
  var j = i + 1;
  if (obj.collection.items[i].data[0].title != undefined && obj.collection.items[j].data[0].title != undefined) {
    if (imageTitles[imageTitles.length - 1] == obj.collection.items[j].data[0].title) {
      str += "More Thumbnails: ";
      while (imageTitles[imageTitles.length - 1] == obj.collection.items[j].data[0].title) {
        str += "<a id=more href="+ imageUrl +">Source " + (j - i) + "</a> ";
        j++;
        if (obj.collection.items[j].data[0].title == undefined) {
          break;
        }
      }
      i = j;
    }
  }

  return str;
}

function addToResults(info, liked) {
  var information = JSON.parse(info);
  var likeInfo = JSON.parse(liked);
  if (localAvail == true) {
    var inStorage = JSON.parse(localStorage.getItem("list"));
    if (inStorage != null) {
      var index = checkStorage(JSON.stringify(information), JSON.stringify(inStorage));
      if (sessionAvail == true) {
        if (index == -1) {
          sessionStorage.setItem(information.id, JSON.stringify(information));
          addToIndex(JSON.stringify(information));
        } else {
          sessionStorage.setItem(likeInfo.id, JSON.stringify(likeInfo));
          addToIndex(JSON.stringify(likeInfo));
        }
      } else {
        addToIndex(JSON.stringify(information));
      }
    } else {
      sessionStorage.setItem(information.id, JSON.stringify(information));
      addToIndex(JSON.stringify(information));
    }
  } else {
    document.getElementById("results").innerHTML += "<div class=info><strong>" + information.title + "</strong><p><i>" + information.describe + "</i></p>";
    currentPage.push(information);
  }
}

function checkStorage(info, inStorage) {
  var stored = JSON.parse(info);
  var storage = JSON.parse(inStorage);
  var index = -1;
  for (var j = 0; j < storage.length; j++) {
    var source = storage[j];
    if (stored.id == source.id) {
      index = j
    }
  }
  return index;
}

function addToIndex(info) {
  var arr = JSON.parse(info);
  document.getElementById("results").innerHTML += "<div class=info><strong>" + arr.title + "</strong><p><i>" + arr.describe + "</i><p><img id=" + arr.id +" class=heart src=\"" + arr.heart +"\" onclick=addToFavorites(\"" + arr.id + "\");></p>";
  currentPage.push(arr);
}

function cutDescription(obj, i) {
  var initDescription = obj.collection.items[i].data[0].description;
  var finalDescription = "No description found.";
  if (initDescription != undefined) {
    if (initDescription.length > 300){
      finalDescription = initDescription.substr(0,300) + ' ...more';
    } else {
      finalDescription = initDescription;
    }
  }
  return finalDescription;

}

function checkDateRange(startInput, endInput) {
  if (startInput.type == "text" && endInput.type == "text") {
    const isValidStart = startInput.checkValidity();
    const isValidEnd = endInput.checkValidity();
    if (isValidStart == false || isValidEnd == false) {
      alert(startInput.title);
      return false;
    }
  }

  if (startInput != undefined && endInput != undefined) {
    var start = new Date(startInput.value);
    var end = new Date(endInput.value);
    if (startInput.value == undefined && endInput.value == undefined) {
      return false;
    } else if (startInput.value == undefined && endInput.value != undefined){
      return null;
    } else if (startInput.value != undefined && endInput.value == undefined){
      return null;
    } else if (startInput.value != undefined && endInput.value != undefined){
      return true;
    } else {
      return null;
    }
  }
  return false;
}

function checkDate(startInput, endInput, dateStr) {
  if (startInput.value != undefined && endInput.value != undefined) {
    var start = new Date(startInput.value);
    var end = new Date(endInput.value);
    var date = new Date(dateStr.substr(0,10));

    if (start <= date && end >= date) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

function unavailable() {
  alert("Source is unavailable");
}

function addToFavorites(nasaId){
  var info = sessionStorage.getItem(nasaId);
  if (localStorage.getItem("list") != null) {
    favoriteImgs = JSON.parse(localStorage.getItem("list"));
  }
  var index = favoriteImgs.indexOf(info);
  var source = JSON.parse(info);

  if (index == -1) {
    document.getElementById(nasaId).src = "images/heart-red.png";
    source.heart = "images/heart-red.png";
    favoriteImgs.push(source);
    localStorage.setItem("list", JSON.stringify(favoriteImgs));
  } else {
    document.getElementById(nasaId).src = "images/heart-gray.png";
    source.heart = "images/heart-gray.png";
    remove(nasaId);
  }
}

function remove(nasaId) {
  favoriteImgs = JSON.parse(localStorage.getItem("list"));
  var index = -1;
  for (var i = 0; i < favoriteImgs.length; i++) {
    var source = JSON.parse(favoriteImgs[i]);
    if (nasaId == source.id) {
      source.heart = "images/heart-gray.png";
      index = i;
    }
  }
  if (index != -1) {
    alert("Removed from favorites");
    favoriteImgs.splice(index, 1);
  }
  localStorage.setItem("list", JSON.stringify(favoriteImgs));
}

function displayGrid() {
  if (currentPage != null && inGrid == false) {
    document.getElementById("rocket").style.visibility = "visible";
    if (currentPage[0].media == "image" || currentPage[0].media == "video") {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + "s<p>";
    } else {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + " results<p>";
    }
    for (var i = 0; i < currentPage.length; i++) {
      var info = currentPage[i];
      var newTitle = changeTitle(info.title);
      document.getElementById("results").innerHTML += "<div class=gridView <a href= " + encodeURI(info.url) + "><img id=grid src=" + info.pic + "></a><strong>" + newTitle + " </strong><img id=" + info.id + " class=heart src=" + info.heart + " onclick=addToFavorites(\'" + info.id +"\')>";
    }
    document.getElementById("rocket").style.visibility = "hidden";
    inGrid = true;
    inList = false;
  }
}

function changeTitle(description) {
  var final;
  if (description.length > 50) {
    final = description.substr(0, 50) + "...";
  } else {
    final = description;
  }

  return final;
}

function displayList() {
  if (currentPage != null && inList == false) {
    document.getElementById("rocket").style.visibility = "visible";
    if (currentPage[0].media == "image" || currentPage[0].media == "video") {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + "s<p>";
    } else {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + " results<p>";
    }
    for (var i = 0; i < currentPage.length; i++) {
      var info = currentPage[i];
      var newTitle = changeTitle(info.title);
      document.getElementById("results").innerHTML += "<a href= " + encodeURI(info.url) + "><img id=thumbnail src=" + info.pic + "></a><p>";
      document.getElementById("results").innerHTML += "<div class=info><strong>" + newTitle + "</strong><p><i>" + info.describe + "</i><p><img id=" + info.id +" class=heart src=\"" + info.heart +"\" onclick=addToFavorites(\"" + info.id + "\");></p>";
    }
    document.getElementById("rocket").style.visibility = "hidden";
    inGrid = false;
    inList = true;
  }
}

function findSources() {
  var locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;
  var startInput = document.getElementById("startDate");
  var endInput = document.getElementById("endDate");
  var sizeInput = document.getElementById("resize").options[document.getElementById("resize").selectedIndex].text;
  var dateFilter = checkDateRange(startInput, endInput);
  currentPage = JSON.parse(sessionStorage.getItem("current"));

  if (currentPage != null) {
    if (locationInput != "Select location") {
      for (var i = 0; i < currentPage.length; i++) {
        if (currentPage[i].location != locationInput) {
          currentPage.splice(i, 1);
        }
      }
    }

    if (dateFilter == true) {
      for (var i = 0; i < currentPage.length; i++) {
        if (currentPage[i].date != undefined) {
          var inRange = checkDate(startInput, endInput, currentPage[i].date);
          if (inRange == false) {
            currentPage.splice(i, 1);
          }
        }
      }
    }

    if (sizeInput != "Select size...") {
      for (var i = 0; i < currentPage.length; i++) {
        currentPage[i].url = "http://images-assets.nasa.gov/image/"+ currentPage[i].id + "/" + currentPage[i].id + "~" + sizeInput.toLowerCase() +".jpg"
      }
    }

    if (inGrid == true) {
      displayGrid();
    } else {
      displayList();
    }
  }
}
