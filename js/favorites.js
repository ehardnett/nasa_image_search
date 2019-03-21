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
  document.getElementById("storage").innerHTML = "<p><strong>NOTICE: This browser does not support a storage component. Because of this, the \'Favorites\' Page will not work. For full capability, use Google Chrome.</strong></p>";
} else {
  var favSources = [];
  loadPage();
}

function loadPage() {
  var results = JSON.parse(localStorage.getItem("list"));
  console.log(results);
  if (typeof (Storage) !== "undefined") {
    if (results != null) {
      document.getElementById("favorites").innerHTML = "<h4>Total Saved Favorites: " + results.length + "</h4>";
      for (var i = 0; i < results.length; i++) {
        final = results[i];
        final.heart = "images/heart-red.png";
        document.getElementById("favorites").innerHTML += "<a href=" + final.url + "><img id=thumbnail src=" + final.pic + "><p>";
        if (final.thumb != undefined) {
          document.getElementById("favorites").innerHTML += "<div class=info><strong>" + final.title + "</strong><p><i id=description>" + final.describe + "</i><p>" + final.thumb + "<p><img id=" + final.id +" class=heart src=" + final.heart + " onclick=remove(\'" + final.id +"\')><p>";

        } else {
          document.getElementById("favorites").innerHTML += "<div class=info><strong>" + final.title + "</strong><p><i id=description>" + final.describe + "</i><p><img id=" + final.id +" class=heart src=" + final.heart + " onclick=remove(\'" + final.id +"\')><p>";

        }
      }
    } else {
      document.getElementById("favorites").innerHTML = "<p>No Saved Favorites. Click on the heart icon next to an image to save it.<p>";
    }
  } else {
    alert("Sorry! No web storage support...");
    document.getElementById("favorites").innerHTML = "<p>No Saved Favorites. Click on the heart icon next to an image to save it.";
  }
}

function remove(id) {
  document.getElementById(id).src = "images/heart-gray.png"

  favSources = JSON.parse(localStorage.getItem("list"));
  var index = -1;
  for (var i = 0; i < favSources.length; i++) {
    var source = favSources[i];
    if (id == source.id) {
      source.heart = "images/heart-gray.png";
      index = i;
    }
  }
  if (index != -1) {
    favSources.splice(index, 1);
    alert("Removed from favorites");
  }
  localStorage.setItem("list", JSON.stringify(favSources));
  loadPage();
}
