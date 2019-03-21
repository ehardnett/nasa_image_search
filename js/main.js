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

if (sessionAvail == false || localAvail == false) {
  document.getElementById("storage").innerHTML = "<p><strong>NOTICE: This browser does not support a storage component. Because of this, the \'Favorites\' Page will not work. For full capability, use Google Chrome or Firefox.</strong></p>";
}

var favoriteImgs = [];
var currentPage = [];
function videoSearch() {
  document.getElementById("size").style.visibility = "hidden";
  document.getElementById("locate").style.visibility = "visible";
  var searchInput; // variable for user's search
  var startInput;
  var endInput;
  var locationInput;
  currentPage = [];
  // take in the user's search for results
  searchInput = document.getElementById("searchBar");
  startInput = document.getElementById("startDate").value;
  endInput = document.getElementById("endDate").value;
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;

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
  console.log(dateFilter);
  if (dateFilter == null) {
    alert("Invalid Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299){
  //    var processedResponse = escapeSpecialChars(Http.responseText); // response of the search results from api call
  //    console.log(processedResponse);
      obj = JSON.parse(Http.responseText); // parsing throught the api call from url
      console.log(obj);

      document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " videos<p>";

      // loop to go through the responses of the url
      for (var i = 0; i < obj.collection.items.length; i++) {
        var dateStr = obj.collection.items[i].data[0].date_created;
        var inRange = checkDate(startInput, endInput, dateStr);

        if (dateFilter == false || (dateFilter == true && inRange == true)){
          var video = document.createElement("IMG");
          video.setAttribute("src", obj.collection.items[i].links[0].href);
          video.setAttribute("alt", obj.collection.items[i].data[0].title);

          const vid = new XMLHttpRequest();
          var videoUrl = obj.collection.items[i].href;
          var videoJson = accessUrl(vid, videoUrl);
          if (videoJson != undefined) {
            vidObj = JSON.parse(videoJson);
            videoUrl = vidObj[0];
            if (video.src == undefined) {
              document.getElementById("results").innerHTML += "<a href= " + encodeURI(videoUrl) + "><img id=thumbnail src=images/video-not-found.png></a><p>";
            } else {
              document.getElementById("results").innerHTML += "<a href= " + encodeURI(videoUrl) + "><img id=thumbnail src=" + video.src + "></a><p>";
            }
          } else {
            if (video.src == undefined) {
              document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=images/video-not-found.png></a><p>";
            } else {
              document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + video.src + "></a><p>";
            }
          }
          var finalDescription = cutDescription(obj, i);

          var info = {id: dateStr, pic: video.src, title: video.alt, describe: finalDescription, url: videoUrl, thumb: "", heart: "images/heart-gray.png", media: "video", location: obj.collection.items[i].data[0].location, date: obj.collection.items[i].data[0].date_created};
          var liked = {id: dateStr, pic: video.src, title: video.alt, describe: finalDescription, url: videoUrl, thumb: "", heart: "images/heart-red.png", media: "video", location: obj.collection.items[i].data[0].location, date: obj.collection.items[i].data[0].date_created};
          if (localAvail == true) {
            var inStorage = JSON.parse(localStorage.getItem("list"));

            if (inStorage != null) {
              var index = -1;
              for (var j = 0; j < inStorage.length; j++) {
                var source = inStorage[j];
                if (info.id == source.id) {
                  index = j;
                }
              }
            if (sessionAvail == true) {
              if (index == -1) {
                sessionStorage.setItem(dateStr, JSON.stringify(info));
                document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i><p><img id=" + info.id +" class=heart src=\"" + info.heart +"\" onclick=addToFavorites(\"" + info.id + "\");></p>";
                currentPage.push(info);
              } else {
                sessionStorage.setItem(dateStr, JSON.stringify(liked));
                document.getElementById("results").innerHTML += "<div class=info><strong>" + liked.title + "</strong><p><i>" + liked.describe + "</i><p><img id=" + liked.id +" class=heart src=\"" + liked.heart +"\" onclick=addToFavorites(\"" + liked.id + "\");></p>";
                currentPage.push(liked);
              }
            }
          } else {
            if (sessionAvail == true) {
              sessionStorage.setItem(dateStr, JSON.stringify(info));
              document.getElementById("results").innerHTML += "<div class=info><strong>" + video.alt + "</strong><p><i>" + finalDescription + "</i><p><img id=" + dateStr +" class=heart src=" + info.heart +" onclick=addToFavorites(\"" + dateStr + "\");></p>";
              currentPage.push(info);
            }
          }

        } else {
          document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i></p>";
          currentPage.push(info);
        }
    }
  }
  sessionStorage.setItem("current", JSON.stringify(currentPage));
  } else {
    var code = handleErrors(status);
    document.getElementById("results") += "<h2>" + code;
  }
  }
}
}

function imageSearch() {
  document.getElementById("size").style.visibility = "visible";
  document.getElementById("locate").style.visibility = "visible";
  var searchInput; // variable for user's search
  var startInput;
  var endInput;
  var locationInput;
  currentPage = [];

  // take in the user's search for results
  searchInput = document.getElementById("searchBar");
  startInput = document.getElementById("startDate").value;
  endInput = document.getElementById("endDate").value;
  locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  var url;
  if (locationInput == "Select location...") {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=image";
  } else {
    url="https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=image&location=" + encodeURIComponent(locationInput);
  }

  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput);
  console.log(dateFilter);
  console.log(startInput);
  console.log(endInput)
  if (dateFilter == null) {
    alert("Invalid Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299){
    //  var processedResponse = escapeSpecialChars(Http.responseText); // response of the search results from api call
      obj = JSON.parse(Http.responseText); // parsing throught the api call from url

      document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " images<p>";
      var imageTitles = [];

      // loop to go through the responses of the url
      for (var i = 0; i < obj.collection.items.length; i++) {
        var dateStr = obj.collection.items[i].data[0].date_created;
        console.log(dateStr);
        var inRange = checkDate(startInput, endInput, dateStr);
        if (dateFilter == false || (dateFilter == true && inRange == true)){
          var thumbnails = "";
          var image = document.createElement("IMG");
          var finalDescription = cutDescription(obj, i);


          if (imageTitles[0] == undefined || imageTitles.indexOf(obj.collection.items[i].data[0].title) == -1){
            imageTitles.push(obj.collection.items[i].data[0].title);
            image.setAttribute("src", obj.collection.items[i].links[0].href);
            image.setAttribute("alt", obj.collection.items[i].data[0].title);

            const img = new XMLHttpRequest();
            var imageUrl = obj.collection.items[i].href;
            var imageJson = accessUrl(img, imageUrl);
            if (imageJson != undefined) {
              imgObj = JSON.parse(imageJson);
              imageUrl = imgObj[0];
              if (image.src == undefined) {
                document.getElementById("results").innerHTML += "<a href=" + imageUrl + "><img id=thumbnail src=images/image-not-available.jpg><p>";
              } else {
                document.getElementById("results").innerHTML += "<a href=" + imageUrl + "><img id=thumbnail src=" + image.src + "><p>";
              }
            } else {
              if (image.src == undefined) {
                document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=images/image-not-found><p>";
              } else {
                document.getElementById("results").innerHTML += "<img id=thumbnail onclick=unavailable(); src=" + image.src + "><p>";
              }
            }
            if (i < (obj.collection.items.length - 1)) {
              thumbnails += addThumbnails(obj, i, imageUrl, imageTitles);
            }

            var info = {id: obj.collection.items[i].data[0].nasa_id, pic: image.src, title: image.alt, describe: finalDescription, thumb: thumbnails, url: imageUrl, heart: "images/heart-gray.png", media: "image", location: obj.collection.items[i].data[0].location, date: dateStr};
            var liked = {id: obj.collection.items[i].data[0].nasa_id, pic: image.src, title: image.alt, describe: finalDescription, thumb: thumbnails, url: imageUrl, heart: "images/heart-red.png", media: "image", location: obj.collection.items[i].data[0].location, date: dateStr};
            if (localAvail == true) {
              var inStorage = JSON.parse(localStorage.getItem("list"));
              if (inStorage != null) {
                var index = -1;
                for (var j = 0; j < inStorage.length; j++) {
                  var source = inStorage[j];
                  if (info.id == source.id) {
                    index = j;
                  }
                }
                if (sessionAvail == true) {
                  if (index == -1) {
                    sessionStorage.setItem(obj.collection.items[i].data[0].nasa_id, JSON.stringify(info));
                    document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i><p>" + info.thumb + "<p><img id=" + info.id +" class=heart src=" + info.heart +" onclick=addToFavorites(\"" + info.id + "\");></p>";
                    currentPage.push(info);
                  } else {
                    sessionStorage.setItem(obj.collection.items[i].data[0].nasa_id, JSON.stringify(liked));
                    document.getElementById("results").innerHTML += "<div class=info><strong>" + liked.title + "</strong><p><i>" + liked.describe + "</i><p>" + liked.thumb + "<p><img id=" + liked.id +" class=heart src=" + liked.heart +" onclick=addToFavorites(\"" + liked.id + "\");></p>";
                    currentPage.push(liked);
                  }
                }
              } else {
                if (sessionAvail == true) {
                  sessionStorage.setItem( obj.collection.items[i].data[0].nasa_id, JSON.stringify(info));
                  document.getElementById("results").innerHTML += "<div class=info><strong>" + image.alt + "</strong><p><i>" + finalDescription + "</i><p>" + thumbnails + "<p><img id=" + dateStr +" class=heart src=" + info.heart +" onclick=addToFavorites(\"" + obj.collection.items[i].data[0].nasa_id + "\");></p>";
                  currentPage.push(info);
                }
              }
            } else {
              document.getElementById("results").innerHTML += "<div class=info><strong>" + image.alt + "</strong><p><i>" + finalDescription + "</i><p>" + thumbnails + "</p>";
              currentPage.push(info);
            }
        }

        }
  }
      sessionStorage.setItem("current", JSON.stringify(currentPage));
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
  var searchInput; // variable for user's search
  var startInput;
  var endInput;
  currentPage = [];

  // take in the user's search for results
  searchInput = document.getElementById("searchBar");
  startInput = document.getElementById("startDate").value;
  endInput = document.getElementById("endDate").value;

  const Http = new XMLHttpRequest(); //creating a new html for the website
  // constant url for the api search of nasa images
  const url = "https://images-api.nasa.gov/search?q=" + encodeURIComponent(searchInput.value) + "&media_type=audio";

  console.log(url); // keep track of what was searched
  Http.open("GET", url); // opens the api call to then parse through
  Http.send(); // sends the request to find any results

  var dateFilter = checkDateRange(startInput, endInput);
  if (dateFilter == null) {
    alert("Invalid Date Range");
  } else {
    Http.onreadystatechange=(e)=>{
      var status = Http.status;
      if (status >= 200 && status <= 299){
        obj = JSON.parse(Http.responseText); // parsing throught the api call from url

        document.getElementById("results").innerHTML = "Total Results: " + obj.collection.items.length + " audio results<p>";

        // loop to go through the responses of the url
        for (var i = 0; i < obj.collection.items.length; i++) {
          console.log(i);
          var dateStr = obj.collection.items[i].data[0].date_created;
          var inRange = checkDate(startInput, endInput, dateStr);

          if (dateFilter == false || (dateFilter == true && inRange == true)){
            var audio = document.createElement("img");
            audio.setAttribute("id", "thumbnail");
            audio.setAttribute("src", "images/audio_thumbnail.png");
            audio.setAttribute("alt", obj.collection.items[i].data[0].title);

            var audioUrl = obj.collection.items[i].href;
            const aud = new XMLHttpRequest();

            var audioJson = accessUrl(aud, audioUrl);
            if (audioJson != undefined) {
              audObj = JSON.parse(audioJson);
              audioUrl = audObj[0];
              document.getElementById("results").innerHTML += "<a href=" + encodeURI(audioUrl) +"><img id=" + audio.id + " src=" + audio.src + "></a><p>";
            } else {
              document.getElementById("results").innerHTML += "<img id=" + audio.id + " onclick=unavailable(); src=" + audio.src + "></a><p>";
            }
            var finalDescription = cutDescription(obj, i);

            var info = {id: dateStr, pic: audio.src, title: audio.alt, describe: finalDescription, url: audioUrl, thumb: "", heart: "images/heart-gray.png", media: "audio", location: "", date: dateStr};
            var liked = {id: dateStr, pic: audio.src, title: audio.alt, describe: finalDescription, url: audioUrl, thumb: "", heart: "images/heart-red.png", media: "audio", location: "", date: dateStr};
            if (localAvail == true) {
              var inStorage = JSON.parse(localStorage.getItem("list"));
              if (inStorage != null) {
                var index = -1;
                for (var j = 0; j < inStorage.length; j++) {
                  var source = inStorage[j];
                  if (info.id == source.id) {
                    index = j;
                  }
                }

                if (sessionAvail == true) {
                  if (index == -1) {
                    sessionStorage.setItem(dateStr, JSON.stringify(info));
                    document.getElementById("results").innerHTML += "<div class=info><strong>" + info.title + "</strong><p><i>" + info.describe + "</i><p><img id=" + info.id +" class=heart src=" + info.heart +" onclick=addToFavorites(\"" + info.id + "\");></p>";
                    currentPage.push(info);
                  } else {
                    sessionStorage.setItem(dateStr, JSON.stringify(liked));
                    document.getElementById("results").innerHTML += "<div class=info><strong>" + liked.title + "</strong><p><i>" + liked.describe + "</i><p><img id=" + liked.id +" class=heart src=" + liked.heart +" onclick=addToFavorites(\"" + liked.id + "\");></p>";
                    currentPage.push(liked);
                  }
                }
              } else {
                if (sessionAvail == true) {
                  sessionStorage.setItem(dateStr, JSON.stringify(info));
                  document.getElementById("results").innerHTML += "<div class=info><strong>" + audio.alt + "</strong><p><i>" + finalDescription + "</i><p><img id=" + dateStr +" class=heart src=" + info.heart +" onclick=addToFavorites(\"" + dateStr + "\");></p>";
                  currentPage.push(info);
                }
              }
            } else {
              document.getElementById("results").innerHTML += "<div class=info><strong>" + audio.alt + "</strong><p><i>" + finalDescription + "</i></p>";
              currentPage.push(info);
            }


            }
          }
          if (sessionAvail == true) {
            sessionStorage.setItem("current", JSON.stringify(currentPage));
          }
          } else {
            var code = handleErrors(status);
            document.getElementById("results") += "<h2>" + code;
          }
        }
        }
}

function accessUrl(Http, url) {
  Http.open("GET", url, false);
  if (Http.status >= 200 && Http.status <= 299) {
    Http.send( null );
    return Http.responseText;
  }
  return undefined;
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

function addThumbnails(obj, i, imageUrl, imageTitles) {
  var str = "";
  var j = i + 1;
  if (imageTitles[imageTitles.length - 1] == obj.collection.items[j].data[0].title) {
    str += "More Thumbnails: ";
    while (imageTitles[imageTitles.length - 1] == obj.collection.items[j].data[0].title) {
      str += "<a id=more href="+ imageUrl +">Source " + (j - i) + "</a> ";
      j++;
    }
    i = j;
  }

  return str;
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

function checkDateRange(startInput, endInput) {
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

function findSources() {
  var locationInput = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;
  var startInput = document.getElementById("startDate");
  var endInput = document.getElementById("endDate");
  var sizeInput = document.getElementById("resize").options[document.getElementById("resize").selectedIndex].text;
  var dateFilter = checkDateRange(startInput, endInput);
  currentPage = JSON.parse(sessionStorage.getItem("current"));

  if (currentPage != null) {
    if (locationInput != "Select location...") {
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
      reloadPage();

  }
}

function reloadPage() {
  if (currentPage[0].media == "image" || currentPage[0].media == "video") {
    document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " + currentPage[0].media + "s<p>";
  } else {
    document.getElementById("results").innerHTML = "Total Results: " + currentPage.length + " " +currentPage[0].media + " results<p>";
  }

  if (currentPage.length != 0) {
    for (var i = 0; i < currentPage.length; i++) {
      document.getElementById("results").innerHTML += "<a href=" + currentPage[i].url + "><img id=thumbnail src=" + currentPage[i].pic + "><p>";
      if (currentPage[i].thumb != undefined) {
        document.getElementById("results").innerHTML += "<div class=info><strong>" + currentPage[i].title + "</strong><p><i id=description>" + currentPage[i].describe + "</i><p>" + currentPage[i].thumb + "<p><img id=" + currentPage[i].id +" class=heart src=" + currentPage[i].heart + " onclick=remove(\'" + currentPage[i].id +"\')><p>";
      } else {
        document.getElementById("results").innerHTML += "<div class=info><strong>" + currentPage[i].title + "</strong><p><i id=description>" + currentPage[i].describe + "</i><p><img id=" + currentPage[i].id +" class=heart src=" + currentPage[i].heart + " onclick=remove(\'" + currentPage[i].id +"\')><p>";
      }
    }
  }
}

function unavailable() {
  alert("Source is unavailable");
}
