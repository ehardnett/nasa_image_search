function myFunction() {
  var searchInput; // variable for user's search

  // take in the user's search for results
  searchInput = document.getElementById("searchInput")

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

    document.getElementById("results").innerHTML = "The total number of hits: " + obj.collection.metadata.total_hits + "<p>";
    document.getElementById("results").innerHTML += "The total number of items found: " + obj.collection.items.length + "<p>";
    // loop to go through the responses of the url
    for (var i = 0; i < obj.collection.items.length; i++) {
      document.getElementById("results").innerHTML += "item # " + i + ": " + obj.collection.items[i].data[0].description + "<br><br>";
    }
  }
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
