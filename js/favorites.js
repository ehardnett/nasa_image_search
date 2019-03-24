var localAvail;
var sessionAvail;
var favSources = [];

/*
  This try-catch block is used to check if there is storage capability in that browser. If there isn't then
  a warning message will display at the top of the screen.
*/
try {
  localStorage.setItem('test', "test");
  localStorage.removeItem('test');
  localAvail = true;
} catch(ex) {
  localAvail = false;
}

// warning notice displayed on the screen for when storage capabilities aren't available
if (localAvail == false) {
  document.getElementById("storage").innerHTML = "<p><strong>NOTICE: This browser does not support a storage component. Because of this, the \'Favorites\' Page will not work. For full capability, use Google Chrome or Firefox.</strong></p>";
  document.getElementById("favorites").innerHTML = "<h4>Page is not supported for this browser.</h4>"
} else {
  loadPage();
}

/*
  loadPage()
  This function is used to load the page initially. It takes everything within the localStorage
  and displays it on the screen with red hearts. This function is also used to reload the page
  if a source is removed while the user is still in the page.
*/
function loadPage() {
  var results = JSON.parse(localStorage.getItem("list"));
  if (results != null) {
    // displaying total amount of favorites saved on page
    document.getElementById("favorites").innerHTML = "<h4>Total Saved Favorites: " + results.length + "</h4>";
    for (var i = 0; i < results.length; i++) {
      final = results[i];
      final.heart = "images/heart-red.png";
      var idStr = JSON.stringify(final.id); // makes it easier to pass into functions
      document.getElementById("favorites").innerHTML += "<a href=" + final.url + "><img id=thumbnail src=" + final.pic + "><p>";
      if (final.thumb != undefined) {
        document.getElementById("favorites").innerHTML += "<div class=info><strong>" + final.title + "</strong><p><i id=description>" + final.describe + "</i><p>" + final.thumb + "<p><img id=" + idStr +" class=heart src=" + final.heart + " onclick=remove(" + idStr +")><p>";

      } else {
        document.getElementById("favorites").innerHTML += "<div class=info><strong>" + final.title + "</strong><p><i id=description>" + final.describe + "</i><p><img id=" + idStr +" class=heart src=" + final.heart + " onclick=remove(" + idStr +")><p>";

      }
    }
  } else { // tells the user how to use it if they haven't saved anything
    document.getElementById("favorites").innerHTML = "<h4>No Saved Favorites. Click on the heart icon next to an image to save it.<h4>";
  }
}

/*
  remove()
  This function is called if a heart is clicked on in this page. The heart changes to gray
  and it is removed from favSources before being set in localStorage. The page is then reloaded
  with the changes made.
*/
function remove(nasaId) {
  document.getElementById(nasaId).src = "images/heart-gray.png";

  favSources = JSON.parse(localStorage.getItem("list")); // get the current page for favorites
  var index = -1;
  for (var i = 0; i < favSources.length; i++) {
    var source = favSources[i];
    if (nasaId == source.id) {
      source.heart = "images/heart-gray.png";
      index = i;
    }
  }

  if (index != -1) {
    favSources.splice(index, 1);
  }
  localStorage.setItem("list", JSON.stringify(favSources));
  loadPage();
}
