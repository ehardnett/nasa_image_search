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
var loadPage = [];
var inGrid = false; // checks to see if the display is a grid view
var inList = false; // checks to see if the display is in list view (default)

/*
  videoSearch()
  This is the search for all videos in the NASA database that match the search input.
  First, it takes in all the inputs from the dates, search, and locations. From there, it
  generates the url to access the JSON from the NASA Image API. A simple for loop is used to
  parse through the JSON and get all the information needed to develop my page. Everything is loaded
  into the "results" div in the document.
*/
function videoSearch() {
  var searchInput, startInput, endInput, locationInput;
  currentPage = [];

  //changing the input type and patterns of the date inputs
  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("startDate").placeholder = "mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").placeholder = "mm/dd/yyyy";
  }

  //load the appropriate refine search options for video: location and date
  document.getElementById("search_options").style.visibility = "visible";
  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible"; //for loading purposes

  //acquire all the input values for: search, dates, and locations
  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate"); //user's start date option
  endInput = document.getElementById("endDate"); //user's end date option
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

          //generic info gathered
          var info = {id: dateStr, pic: video.src, title: video.alt, describe: finalDescription,  heart: "images/heart-gray.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};
          // the heart source changes in case of the image having been previously saved to favorites
          var liked = {id: dateStr, pic: video.src, title: video.alt, describe: finalDescription,  heart: "images/heart-red.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};

          var inRange;
          if (dateFilter == true) {
            console.log("checking date");
            inRange = checkDate(startInput, endInput, dateStr);
            console.log(inRange + " " + dateStr);
            if (inRange == true) {
              addToResults(JSON.stringify(info), JSON.stringify(liked));
            }
          } else {
            addToResults(JSON.stringify(info), JSON.stringify(liked));
          }
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
*/
function imageSearch() {
  var searchInput, startInput, endInput, locationInput;

  //changes the date inputs to text if date is not available and adds a required pattern
  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("startDate").placeholder = "mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").placeholder = "mm/dd/yyyy";
  }

  //sets the correct search options to be visible: all of them work for images
  document.getElementById("search_options").style.visibility = "visible";
  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible"; //loading has started
  currentPage = []; //reset current page array

  //obtain the inputs of the
  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate"); //user's start date option
  endInput = document.getElementById("endDate"); //user's end date option
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text; //user's location select

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // url for the api search
  var url;
  if (locationInput == "Select location...") {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=image";
  } else {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video&location=" + encodeURIComponent(locationInput);
  }

  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput); // check to see if the inputs are correct
  if (dateFilter == null) {
    alert("Invaild Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299){
        obj = JSON.parse(Http.responseText);

        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " images<p>";

        for (var i = 0; i < obj.collection.items.length; i++) {
          var title, image, finalDescription, imageUrl, locationStr, dateStr, nasaId, thumbnails, imageJson;
          title = obj.collection.items[i].data[0].title;
          finalDescription = cutDescription(obj, i);
          locationStr = obj.collection.items[i].data[0].location;
          dateStr = obj.collection.items[i].data[0].date_created;
          imgUrl = obj.collection.items[i].href;
          nasaId = obj.collection.items[i].data[0].nasa_id;


          // reassigning undefined attributes of the image
          if (title == undefined){
            title = "No title available";
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
          // opens collection.json for the proper image url
          var info = {id: nasaId, pic: image.src, title: image.alt, describe: finalDescription, heart: "images/heart-gray.png", media: "image", location: locationStr, date: dateStr, url: ""};
          // info about the favorite image to be check with what is in localStorage
          var liked = {id: nasaId, pic: image.src, title: image.alt, describe: finalDescription, heart: "images/heart-red.png", media: "image", location: locationStr, date: dateStr, url: ""};

          const img = new XMLHttpRequest();

          accessUrl(img, imgUrl, JSON.stringify(info), JSON.stringify(liked), dateFilter);
        }

        document.getElementById("rocket").style.visibility = "hidden"; //loading is complete
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

  // resets the inputs for the dates if the date type is not available
  if (dateAvail == false){
    document.getElementById("startDate").type = "text";
    document.getElementById("startDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("startDate").title = "Use format mm/dd/yyyy";
    document.getElementById("startDate").placeholder = "mm/dd/yyyy";
    document.getElementById("endDate").type = "text";
    document.getElementById("endDate").pattern = "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d";
    document.getElementById("endDate").title = "Use format mm/dd/yyyy";
    document.getElementById("endDate").placeholder = "mm/dd/yyyy";
  }

  // sets the proper search options to be visible for an audio source
  document.getElementById("search_options").style.visibility = "visible";
  document.getElementById("calendar").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "hidden";
  document.getElementById("rocket").style.visibility = "visible";
  currentPage = [];

  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate"); //user's start date option
  endInput = document.getElementById("endDate"); //user's end date option

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search
  const url = "https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=audio";
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput); //checks to see if the dates are valid
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

          // reassigns attributes that we undefined
          if (title == undefined){
            title = "No title available";
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

          // accesses the collection.json for the audio source
          const aud = new XMLHttpRequest();

          // generic information about the audio result
          var info = {id: dateStr, pic: audio.src, title: audio.alt, describe: finalDescription, heart: "images/heart-gray.png", media: "audio",  location: locationStr, date: dateStr, url: ""};
          // information about the liked version of the result to see if it is in localStorage
          var liked = {id: dateStr, pic: audio.src, title: audio.alt, describe: finalDescription, heart: "images/heart-red.png", media: "audio",  location: locationStr, date: dateStr, url: ""};

          accessUrl(aud, audUrl, JSON.stringify(info), JSON.stringify(liked), dateFilter);
        }
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
  accessUrl()
  This helper function is used to access the collection.json where the correct image and
  audio urls can be found. Only the ones that have an OK status will return a response.
  Otherwise, it returns null and that source can't be accessed.
    - Http: a new XMLHttpRequest for the url
    - url: link to the collection.json for the source
    - info: array of generic information for the source
    - liked: array of information with a red heart instead of a gray heart
*/
function accessUrl(Http, url, info, liked, dateFilter) {

  Http.open("GET", url, true);
  Http.send();

  Http.onreadystatechange=(e)=> {
    var status = Http.status;
    if (status >= 200 && status <= 299){
      var json = Http.responseText;
      if (json != undefined) {
        var information = JSON.parse(info);
        var likedInfo = JSON.parse(liked);
        obj = JSON.parse(json);
        url = obj[0];
        information.url = url;
        likedInfo.url = url;
        var startInput = document.getElementById("startDate");
        var endInput = document.getElementById("endDate");
      
        var inRange;
        if (dateFilter == true) {
          console.log("checking date");
          var dateStr = JSON.stringify(information.date);
          inRange = checkDate(startInput, endInput, dateStr);
          console.log(inRange + " " + dateStr);
          if (inRange == true) {
            console.log("passed");
            var inResults = checkArray(info, JSON.stringify(currentPage));
            if (inResults == -1) {
              addToResults(JSON.stringify(information), JSON.stringify(likedInfo));
            }
          }
        } else {
          var inResults = checkArray(info, JSON.stringify(currentPage));
          if (inResults == -1) {
            addToResults(JSON.stringify(information), JSON.stringify(likedInfo));
          }
        }
      }
    }
  }
  document.getElementById("rocket").style.visibility = "hidden";
}

/*
  addToResults()
  This function is used to add the information collected from the original search. All
  the information is displayed on the screen in the "results" divider. At each checkpoint,
  the code is checking to see if there is an instance of the result already in either
  sessionStorage or localStorage that differs from the generic info object.
    - info: object holding all the information for the result (no favorite)
    - liked: object holding all the information for the result (favorite)
*/
function addToResults(info, liked) {
  var information = JSON.parse(info);
  var likeInfo = JSON.parse(liked);
  if (localAvail == true) {
    var inStorage = JSON.parse(localStorage.getItem("list"));
    if (inStorage != null) {
      var index = checkArray(JSON.stringify(information), JSON.stringify(inStorage)); // check for if it is a favorite
      if (sessionAvail == true) {
        if (index == -1) {
          sessionStorage.setItem(information.id, JSON.stringify(information)); //store generic information
          addToIndex(JSON.stringify(information));
        } else {
          sessionStorage.setItem(likeInfo.id, JSON.stringify(likeInfo)); // store liked information
          addToIndex(JSON.stringify(likeInfo));
        }
      } else {
        addToIndex(JSON.stringify(information));
      }
    } else {
      sessionStorage.setItem(information.id, JSON.stringify(information)); //store generic information
      addToIndex(JSON.stringify(information));
    }
  } else { //no storage allowed then added to currentPage without heart
    if (information.url != undefined) {
      document.getElementById("results").innerHTML += "<a href= " + encodeURI(information.url) + "><img id=thumbnail src=" + information.pic + "></a><p>";
    } else {
      document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + informtion.pic + "></a><p>";
    }
    document.getElementById("results").innerHTML += "<div class=info><strong>" + information.title + "</strong><p><i>" + information.describe + "</i></p>";
    currentPage.push(information);
  }
}

/*
  checkArray()
  This function is used to quickly the information within any array for a specific item.
  If the item is in the array, it returns the index. Otherwise, it returns -1.
    - info: generic information for the source
    - arr: array that needs be scanned
*/
function checkArray(info, arr) {
  var stored = JSON.parse(info);
  var storage = JSON.parse(arr);
  var index = -1;
  for (var j = 0; j < storage.length; j++) {
    var source = storage[j];
    if (stored.id == source.id) {
      index = j
    }
  }
  return index;
}

/*
  addToIndex()
  This helper function is used to finally build the page after all the necessary information for
  each source is attained. The default view for this function is a list view with all the descriptions
    - info: generic information about the source
*/
function addToIndex(info) {
  var arr = JSON.parse(info);
  var idStr = JSON.stringify(arr.id);
  if (arr.url != undefined) {
    document.getElementById("results").innerHTML += "<a href= " + encodeURI(arr.url) + "><img id=thumbnail src=" + arr.pic + "></a><p>";
  } else {
    document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + arr.pic + "></a><p>";
  }
  document.getElementById("results").innerHTML += "<div class=info><strong>" + arr.title + "</strong><p><i>" + arr.describe + "</i><p><img id=" + idStr +" class=heart src=\"" + arr.heart +"\" onclick=addToFavorites(" + idStr + ");></p>";
  currentPage.push(arr);

}

/*
  cutDescription()
  Some descriptions can run longer than needed. Becuase of this, function is used to
  shorten the ones to a specific 300 character length.
    - obj: overall information for the original search found
    - i: current place in the obj
*/
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

/*
  checkDateRange()
  This helper function is used to check if there is even anything in the date options to
  be refined with. If there isn't anything, then it will return false. If the input is
  invalid, then it will return null.
    - startInput: element for the startDate
    - endInput: element for the endDate

*/
function checkDateRange(startInput, endInput) {
  var start = new Date(startInput.value);
  var end = new Date(endInput.value);

  if (start >= end) { //start is before end
    return null;
  }
  if (start == "Invalid Date" || end == "Invalid Date") {
    return false;
  } else {
    return true;
  }
}
/*
  checkDate()
  This helper function is used to check if the current date for the source is within
  the range of the start and end dates. It returns true if it is and false if it's not.
    - startInput: element for the startDate
    - endInput: element for the endDate
    - dateStr: current date for the source
*/
function checkDate(startInput, endInput, dateStr) {
  var start = new Date(startInput.value);
  var end = new Date(endInput.value);
  var date = new Date(dateStr.substr(0,10));
  if (date != "Invalid Date") {
    if (start <= date && end >= date) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

/*
  addToFavorites()
  This function is called whenever a heart is pressed within the html. If the heart is
  gray, then it turns to red indicating it has been added to the favoriteImgs array. If
  the heart is red, then it turns gray indicating it was removed from the array. The array
  is then stored in localStorage to be available for the Favorites page.
    - nasaId: id to access the correct information and to change the right heart.
*/
function addToFavorites(nasaId){
  var info = sessionStorage.getItem(nasaId);
  if (localStorage.getItem("list") != null) {
    favoriteImgs = JSON.parse(localStorage.getItem("list"));
  }
  var source = JSON.parse(info);
  var index = checkArray(JSON.stringify(source), JSON.stringify(favoriteImgs)); // check if it is already saved

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

/*
  remove()
  This function is used to remove a source from your favorites if you no longer want
  for that source to be there. It locates the index within the favoriteImgs array and
  splices it out to then be stored into localStorage.
    - nasaId:
*/
function remove(nasaId) {
  favoriteImgs = JSON.parse(localStorage.getItem("list"));
  var index = -1;
  for (var i = 0; i < favoriteImgs.length; i++) {
    var source = favoriteImgs[i];
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

/*
  displayGrid()
  This function is called if the user selects the Grid View button on the side panel.
  It displays the current page in a more concise way with only seeing the title and a
  way to add that source to favorites.
*/
function displayGrid() {
  if (currentPage != null) {
    document.getElementById("rocket").style.visibility = "visible";
    // displaying number of results differs depending on image, video, and audio
    if (currentPage[0].media == "image" || currentPage[0].media == "video") {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + "s<p>";
    } else {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + " results<p>";
    }
    for (var i = 0; i < currentPage.length; i++) {
      var info = currentPage[i];
      var newTitle = changeTitle(info.title);
      var idStr = JSON.stringify(info.id);
      // difference in displaying the heart or not
      if (localAvail == true) {
        document.getElementById("results").innerHTML += "<div class=gridView> <a href= " + encodeURI(info.url) + "><img id=grid src=" + info.pic + "></a><strong>" + newTitle + " </strong><img id=" + idStr + " class=heart src=" + info.heart + " onclick=addToFavorites(" + idStr +")>";
      } else {
        document.getElementById("results").innerHTML += "<div class=gridView> <a href= " + encodeURI(info.url) + "><img id=grid src=" + info.pic + "></a><strong>" + newTitle + " </strong>";
      }

    }
    document.getElementById("rocket").style.visibility = "hidden";
    inGrid = true;
    inList = false;
  }
}

/*
  changeTitle()
  For the sake of the grid viewing, if the title is too long, then it is shortened to
  50 characters so it doesn't run into one of the other grids.
    - title: title of the current source being looked at
*/
function changeTitle(title) {
  var final;
  if (title.length > 50) {
    final = title.substr(0, 50) + "...";
  } else {
    final = title;
  }

  return final;
}

/*
  displayList()
  This is for if the user decides to display the results as a list. This is defaulted in
  the search so you will be able to see the description along with a way to add it to
  favorites if you want to.
*/
function displayList() {
  if (currentPage != null) {
    document.getElementById("rocket").style.visibility = "visible";
    if (currentPage[0].media == "image" || currentPage[0].media == "video") {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + "s<p>";
    } else {
      document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + " results<p>";
    }
    for (var i = 0; i < currentPage.length; i++) {
      var info = currentPage[i];
      var idStr = JSON.stringify(info.id); // set this first to make it easier to pass the id into different functions
      document.getElementById("results").innerHTML += "<a href= " + encodeURI(info.url) + "><img id=thumbnail src=" + info.pic + "></a><p>";
      if (localAvail == true) {
        document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i><p><img id=" + idStr +" class=heart src=\"" + info.heart +"\" onclick=addToFavorites(" + idStr + ");></p>";
      } else {
        document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i></p>";
      }
    }
    document.getElementById("rocket").style.visibility = "hidden";
    inGrid = false;
    inList = true;
  }
}

/*
  findcurrentPage()
  This function is called when the "Refine Search" button is pressed. If the location
  and/or dates have an input, then this function will parse through the current page
  and find the results that work for that page.
  - NOTE: If there is no location or date associated with the source, then it is not taken
  out.
*/
function findcurrentPage() {
  var locationInput = document.getElementById("location").value;
  var startInput = document.getElementById("startDate");
  var endInput = document.getElementById("endDate");
  var dateFilter = checkDateRange(startInput, endInput); // check if there is anything in the date option inputs

  if (currentPage[0] != undefined) {
    if (locationInput != "select") {
      // gather the text within the selected index
      var locate = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;
      for (var i = 0; i < currentPage.length; i++) {
        //remove what is unnecessary
        if (currentPage[i].location != "No location available" && currentPage[i].location != locate) {
          currentPage.splice(i, 1);
        }
      }
      if (inGrid == true) {
        displayGrid();
      } else {
        displayList();
      }
    }

    if (dateFilter == true) {
      for (var i = 0; i < currentPage.length; i++) {
        if (currentPage[i].date != "No date available") {
          var inRange = checkDate(startInput, endInput, currentPage[i].date); // see if the date is in range
          if (inRange == false) {
            currentPage.splice(i, 1);
          }
        }
      }
      if (inGrid == true) {
        displayGrid();
      } else {
        displayList();
      }
    }

  }
}

/*
  unavailable()
  If a url to a source is not working, then this function will alert the user that the
  source is unavailable.
*/
function unavailable() {
  alert("Source is unavailable");
}
