var localAvail;
var sessionAvail;

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

var datefield = document.createElement("input");
datefield.setAttribute("type", "date");
var dateAvail;


if (sessionAvail == false || localAvail == false) {
  document.getElementById("storage").innerHTML = "<p><strong>NOTICE: This browser does not support a storage component. Because of this, the \'Favorites\' Page will not work. For full capability, use Google Chrome or Firefox.</strong></p>";
}

if (datefield.type != "date"){

}

var favoriteImgs = [];
var currentPage = [];
var inGrid = false;
var inList = false;

function videoSearch() {
  document.getElementById("size").style.visibility = "hidden";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible";
  var searchInput, startInput, endInput, locationInput;
  currentPage = [];

  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate").value; //user's start date option
  endInput = document.getElementById("endDate").value; //user's end date option
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text; //user's location select

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  var url;
  if (locationInput == "Select location...") {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video";
  } else {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=video&location=" + encodeURIComponent(locationInput);
  }

  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput);
  if (dateFilter == null) {
    alert("Invaild Date Range");
  } else {
    Http.onreadystatechange=(e)=> {
      var status = Http.status;
      if (status >= 200 && status <= 299){
        obj = JSON.parse(Http.responseText); // parsing throught the api call from url
        console.log(obj);

        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " videos<p>";

        for (var i = 0; i < obj.collection.items.length; i++) {
          var title, video, finalDescription, videoUrl, locationStr, dateStr, nasaId;
          title = obj.collection.items[i].data[0].title;
          finalDescription = cutDescription(obj, i);
          locationStr = obj.collection.items[i].data[0].location;
          dateStr = obj.collection.items[i].data[0].date_created;
        //  vidUrl = obj.collection.items[i].links[0].href;
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

          video = document.createElement("img");

          video.setAttribute("src", obj.collection.items[i].links[0].href);
          video.setAttribute("alt", title);
          videoUrl = "http://images-assets.nasa.gov/video/" + encodeURIComponent(nasaId) + "/" + encodeURIComponent(nasaId) + "~orig.mp4";
          document.getElementById("results").innerHTML += "<a href= " + encodeURI(videoUrl) + "><img id=thumbnail src=" + video.src + "></a><p>";

          var info = {id: JSON.stringify(nasaId), pic: video.src, title: video.alt, describe: finalDescription, thumb: "", heart: "images/heart-gray.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};
          var liked = {id: JSON.stringify(nasaId), pic: video.src, title: video.alt, describe: finalDescription, thumb: "", heart: "images/heart-red.png", media: "video", location: locationStr, date: dateStr, url: videoUrl};

          addToResults(JSON.stringify(info), JSON.stringify(liked));
        }
        document.getElementById("rocket").style.visibility = "hidden";
        inList = true;
        inGrid = false;
      } else {
        var code = handleErrors(status);
        document.getElementById("results") += "<h2>" + code + "</h2>";
      }
    }
  }
}

function imageSearch() {
  document.getElementById("size").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "visible";
  document.getElementById("rocket").style.visibility = "visible";
  var searchInput, startInput, endInput, locationInput; // variable for user's search
  currentPage = [];

  searchInput = document.getElementById("searchBar"); //user's search results
  startInput = document.getElementById("startDate").value; //user's start date option
  endInput = document.getElementById("endDate").value; //user's end date option
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text; //user's location select

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

          const img = new XMLHttpRequest();
          imageJson = accessUrl(img, imageUrl);
          if (imageJson != undefined) {
            imgObj = JSON.parse(imageJson);
            imageUrl = imgObj[0];
            document.getElementById("results").innerHTML += "<a href= " + encodeURI(imageUrl) + "><img id=thumbnail src=" + image.src + "></a><p>";
          } else {
            document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + image.src + "></a><p>";
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

function audioSearch() {
  document.getElementById("size").style.visibility = "hidden";
  document.getElementById("locate").style.visibility = "hidden";
  document.getElementById("rocket").style.visibility = "visible";
  var searchInput, startInput, endInput;
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
  var start = new Date(startInput.value);
  var end = new Date(endInput.value);
  console.log(start);
  console.log(end);
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
