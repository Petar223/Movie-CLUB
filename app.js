const btnMovie = document.querySelector("#film"),
  btnTv = document.querySelector("#tv"),
  btnNames = document.querySelector("#names"),
  btnFavorites = document.querySelector("#favorites"),
  posterView = document.querySelector(".poster-view"),
  searchInput = document.querySelector(".search__input"),
  pageContainer = document.querySelector(".container__page");

const imagePath = "http://image.tmdb.org/t/p/w300",
  apiKey = "56e2f6793ab55d60b3deda6f7abd4ff7",
  ajaxUrl = "https://api.themoviedb.org/3/search/";

/*
The "favorites" variable is a parsed array of movies and or series from the local storage if exists, 
and if the local storage is empty, the variable is the empty array.
*/
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

let pageCount = 1;

document.addEventListener("DOMContentLoaded", function() {
  if (JSON.parse(localStorage.getItem("favorites")) === null) {
    localStorage.setItem("favorites", JSON.stringify([]));
  }
  typeOfSelect("movie");
});

searchInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    pageCount = 1;
    callApi(typeOfSearch);
  }
});

btnMovie.addEventListener("click", function() {
  typeOfSelect("movie");
});

btnTv.addEventListener("click", function() {
  typeOfSelect("tv");
});

btnFavorites.addEventListener("click", function() {
  favorites = JSON.parse(localStorage.getItem("favorites")); //By declaring this variable, I ensure that these event listener will take movies or series exclusively from the local storage.
  selected("favorites");
  createFavoritesPosters(favorites);
});

/*parameter: type of search "movie" or "tv".
This function is an api call that parses a string object in to real object and calls the function createPosters.
*/
function callApi(typeOfSearch) {
  let data = new XMLHttpRequest();
  let ajaxUrlResolved =
    ajaxUrl +
    typeOfSearch +
    "?api_key=" +
    apiKey +
    "&query=" +
    searchInput.value +
    "&page=" +
    pageCount;
  if (searchInput.value === "") {
    ajaxUrlResolved =
      "https://api.themoviedb.org/3/" +
      typeOfSearch +
      "/top_rated?api_key=" +
      apiKey +
      "&language=en-US&page=" +
      pageCount;
  }
  data.open("get", ajaxUrlResolved);
  data.send();
  data.onreadystatechange = function() {
    if (data.readyState == 4 && this.status == 200) {
      let objectData = JSON.parse(data.responseText);
      objectData.results = isInFavorites(objectData.results);
      createPosters(objectData);
    }
  };
}

/*parameter: string  "movie" or "tv".
This function determines what type of search is, and resets pageCount to 1. If the search field is 
blank, by default will be a top rated search.
*/
function typeOfSelect(type) {
  searchInput.disabled = false;
  typeOfSearch = selected(type);
  pageCount = 1;
  callApi(type);
}

/*parameter: string "movie", "tv" or "favorites"
  return: parameter actually string "movie", "tv" or "favorites" 
  This function controls which of the following is selected "movies", 
  "tv shows" or "favorites" by changing their class name and id name depending on what is selected.
*/
function selected(select) {
  if (select == "movie") {
    btnMovie.className = "side-nav__button-active";
    btnTv.className = "side-nav__button";
    btnFavorites.className = "side-nav__button";
    btnMovie.id = "film-active";
    btnTv.id = "tv";
  } else if (select == "tv") {
    btnMovie.className = "side-nav__button";
    btnTv.className = "side-nav__button-active";
    btnFavorites.className = "side-nav__button";
    btnTv.id = "tv-active";
    btnMovie.id = "film";
  } else if (select == "favorites") {
    btnMovie.className = "side-nav__button";
    btnTv.className = "side-nav__button";
    btnFavorites.className = "side-nav__button-active";
    btnMovie.id = "film";
    btnTv.id = "tv";
  }
  return select;
}

/*parameter: array of favorite movies and series from local storage
This function creates posters from local storage into "favorites" and calls the function removeFromFavorites . This function is similar to the createPosters function, 
but I had to create a new one because I didn't know how to handle deleting a poster from "favorites"
*/
function createFavoritesPosters(favorites) {
  searchInput.value = "";
  searchInput.disabled = true;
  pageContainer.textContent = "";
  posterView.textContent = "";
  let id = "";
  for (let result of favorites) {
    let poster = imagePath + result.poster_path,
      vote = result.vote_average,
      title = result.original_title,
      release = result.release_date;
    if (result.original_title) {
      title = result.original_title;
      release = result.release_date;
      id = "movie-fav";
    } else if (result.original_name) {
      title = result.original_name;
      release = result.first_air_date;
      id = "tv-fav";
    }
    if (result.poster_path === null || result.poster_path === "") {
      poster = "./img/no-image.jpeg";
    }
    if (result.release_date == "") {
      release = "Unknown";
    }
    posterView.innerHTML += `<div class="poster-view__container"><div class="imgBox"><img class="img" src="${poster}" alt="film-poster" />
        </div><div class="container-details"><p class="name">${title}</p><p class="release">Release:</p><p class="year">${release}</p>
        <p class="rating">Rating:</p><p class="mark">${vote} / 10</p><button  id="${id}" class="container-btn-added">R E M O V E</button></div></div>`;
  }
  removeFromFavorites(favorites);
}

/*parameter: array of favorite movies and series from local storage
  This function deletes that poster by clicking the "remove" button and calls the function createFavoritesPosters
 */
function removeFromFavorites(favorites) {
  const getRemoveBtn = document.querySelectorAll(".container-btn-added");
  for (let i = 0; i < getRemoveBtn.length; i++) {
    getRemoveBtn[i].addEventListener("click", function() {
      favorites.splice(i, 1);
      let stringify = JSON.stringify(favorites);
      localStorage.setItem("favorites", stringify);
      createFavoritesPosters(favorites);
    });
  }
}

/*parameter: array of movies and series from api call.
 This function inserts a movie or series into the favorites array and saves it to local storage
 */
function getFavoriteInArray(results) {
  const getFavoritesBtn = document.querySelectorAll(
    ".container-btn, .container-btn-added"
  );
  for (let i = 0; i < getFavoritesBtn.length; i++) {
    getFavoritesBtn[i].addEventListener("click", function() {
      favorites.push(results[i]);
      //this method prevents duplicates from appearing in the favorite array which will be forwarded to local storage.
      const favorite = Array.from(new Set(favorites.map(a => a.id))).map(id => {
        return favorites.find(a => a.id === id);
      });
      let stringifyFavorite = JSON.stringify(favorite);
      localStorage.setItem("favorites", stringifyFavorite);
      getFavoritesBtn[i].className = "container-btn-added";
    });
  }
}

/* parameter: array of movies and series
  return: array of movies and series with added filed favorite
  This function set field favorite to true if show is in favorites otherwise
  set filed favorite to false
*/
function isInFavorites(shows) {
  let favorites = JSON.parse(localStorage.getItem("favorites")).map(
    item => item.id
  );
  let result = shows.map(item => {
    if (favorites.includes(item.id)) {
      item.favorite = true;
    } else {
      item.favorite = false;
    }
    return item;
  });
  return result;
}

/*
parameter:parsed object from api call
This function creates posters into "movies" or "tv shows" and calls functions getFavoriteInArray and pageController.
*/
function createPosters(object) {
  posterView.textContent = "";
  for (let result of object.results) {
    let poster = imagePath + result.poster_path,
      vote = result.vote_average,
      title = result.original_title,
      release = result.release_date;
    if (result.favorite == false) {
      className = "container-btn";
    } else if (result.favorite == true) {
      className = "container-btn-added";
    }
    if (result.original_title) {
      title = result.original_title;
      release = result.release_date;
    } else if (result.original_name) {
      title = result.original_name;
      release = result.first_air_date;
    }
    if (result.poster_path === null || result.poster_path === "") {
      poster = "./img/no-image.jpeg";
    }
    if (result.release_date == "") {
      release = "Unknown";
    }
    posterView.innerHTML += `<div class="poster-view__container"><div class="imgBox"><img class="img" src="${poster}" alt="film-poster" />
          </div><div class="container-details"><p class="name">${title}</p><p class="release">Release:</p><p class="year">${release}</p>
          <p class="rating">Rating:</p><p class="mark">${vote} / 10</p><button  class="${className}">F A V O R I T E</button></div></div>`;
  }
  getFavoriteInArray(object.results);
  pageController(object);
}

/*
parameter:parsed object from api call
This function sets the page controller if the number of pages is greater than 1 and controls the page counter, which by default is number 1.
It will also write which page is currently on the total page count. 
*/

function pageController(object) {
  if (object.total_pages > 1) {
    if (pageCount == 1) {
      pageContainer.innerHTML = `<div class="page-selects"> <span id="current-page">${object.page} / ${object.total_pages}</span><button id="next-page">
      <i class="far fa-arrow-alt-circle-right"></i></button></div>`;
      const btnNextPage = document.querySelector("#next-page");
      btnNextPage.addEventListener("click", function() {
        pageCount++;
        callApi(typeOfSearch);
      });
    } else if (pageCount == object.total_pages) {
      pageContainer.innerHTML = `<div class="page-selects"><button id="previous-page"><i class="far fa-arrow-alt-circle-left"></i></button>
      <span id="current-page">${object.page} / ${object.total_pages}</span></div>`;
      const btnPreviousPage = document.querySelector("#previous-page");
      btnPreviousPage.addEventListener("click", function() {
        pageCount--;
        callApi(typeOfSearch);
      });
    } else {
      pageContainer.innerHTML = `<div class="page-selects"><button id="previous-page"><i class="far fa-arrow-alt-circle-left"></i></button>
      <span id="current-page">${object.page} / ${object.total_pages}</span><button id="next-page"><i class="far fa-arrow-alt-circle-right"></i></button></div>`;
      const btnPreviousPage = document.querySelector("#previous-page");
      const btnNextPage = document.querySelector("#next-page");
      btnNextPage.addEventListener("click", function() {
        pageCount++;
        callApi(typeOfSearch);
      });
      btnPreviousPage.addEventListener("click", function() {
        pageCount--;
        callApi(typeOfSearch);
      });
    }
  } else {
    pageContainer.textContent = "";
  }
}
