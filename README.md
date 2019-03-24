# NASA Media Archives Search
This website was built to retrieve data form the NASA media archives through their API and display the results based on a search. It has two pages: Home and Favorites. 
- Home: inital page loaded when the website is accessed
- Favorites: page designed to hold all sources that have been marked favorite by the user

## Functionality
#### Home
On the webpage load, you will see a search bar for a keyword for your results. There are three different buttons for searches: images, videos, and audios. For each of the searches, it will only load the sources in the JSON that correspond to the button. For all the searches, the results are displayed as a list with the thumbnail, title, description, and a heart.
> NOTE: Audio results didn't have a thumbnail within the JSON, so they all have a defaulted audio thumbnail.
When any of the buttons are pressed, a side panel for refining the search by location and/or date options. When the Refine Search button is pressed, it takes the current page and refine the results by location and/or date.
- Date option: This is separated by start and end inputs for the date range. 
>> NOTE: During testing, I noticed a couple browsers didn't support a `<input>` of type `"date"`. In that case, the `<input>` types are changed to `"text"` and no calendar will pop up.
- Location option: This is a `<select>` object that is preset with many location possibilites based on the API searches. 

#### Favorites
This page is used to store the sources that have been previously favorited and located in localStorage. When you are on the page, you also have the ability to remove a source from the Favorites page in real time. It will reload if any changes are done.
> NOTE: This page will only work if there is a localStorage available in the browser. Some of the support browsers are Google Chrome and Firefox. Due to time, I was not able to get the page to be available through cookies. I understand that to fix this problem I would have to have to do something like `document.cookie = JSON.stringify(favoriteImgs);` and then access that cookie in the Favories Page.

## Built With
- [Atom](https://atom.io/) - The web framework used

## Contributions
No outside contributions

## Author
Erin Hardnett - Undergraduate at Vanderbilt University Class of 2021, Computer Science - [LinkedIn](https://www.linkedin.com/in/erinaliahhardnett/)

## Acknowledgements
- Charles Hardnett: helped with debugging and testing
- Derek Hardnett: gave helpful recommendations for add-ons to make user interface better


