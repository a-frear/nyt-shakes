"use strict";
const NYTapiKey = config.NYTapi;
const NYTsearchURL = `https://api.nytimes.com/svc/search/v2/articlesearch.json?`;

const booksApiKey = config.booksAPI;
const booksSearchURL = `https://www.googleapis.com/books/v1/volumes?`;

let page = 0;

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function GetSortOrder(prop) {
  return function (a, b) {
    if (a[prop] < b[prop]) {
      return 1;
    } else if (a[prop] > b[prop]) {
      return -1;
    }
    return 0;
  };
}

function displayResultsNYT(responseJson, play) {
  console.log(responseJson);
  const articles = responseJson.response.docs;
  const sortedArticles = articles.sort(GetSortOrder("pub_date"));
  $("#results-list").empty();
  // iterate through the array
  for (let i = 0; i < sortedArticles.length; i++) {
    //this code cuts the timestamp out of the publishing date so we only see the year/month/day
    const pubDate = new Date(sortedArticles[i].pub_date);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formatDate = pubDate.toLocaleDateString("en-US", options);
    $("#results-list").append(
      `<li class="articles">
            <a href="${sortedArticles[i].web_url} class="articleLink" class="headline" target="_blank"><h3 class="headline">${sortedArticles[i].headline.main}</h3></a>
            <h4 class="date">${formatDate}</h4>
            <p>${sortedArticles[i].lead_paragraph}</p>
            </li>`
    );
  }
  //display the results section
  $("#results").removeClass("hidden");

  if (
    responseJson.response.meta.hits > 10 &&
    responseJson.response.meta.offset != 0
  ) {
    $("#pagination").append(`<button id="previous">
    <svg fill="#791524" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 476.213 476.213" xml:space="preserve">
      <polygon points="476.213,223.107 57.427,223.107 151.82,128.713 130.607,107.5 0,238.106 130.607,368.714 151.82,347.5 
        57.427,253.107 476.213,253.107 "/>
    </svg>
    Previous
    </button>`);
    $("#previous").on("click", function () {
      page--;
      console.log(page);
      getResultsNYT(play, page);
    });
  }

  if (
    responseJson.response.meta.hits > 10 &&
    responseJson.response.meta.hits - responseJson.response.meta.offset >= 10
  ) {
    $("#pagination").append(`<button id="next">
    Next
    <svg fill="#791524" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 476.213 476.213" xml:space="preserve">
      <polygon points="476.213,223.107 57.427,223.107 151.82,128.713 130.607,107.5 0,238.106 130.607,368.714 151.82,347.5 
        57.427,253.107 476.213,253.107 "/>
    </svg>
    </button>`);
    $("#next").on("click", function () {
      page++;
      console.log(page);
      getResultsNYT(play, page);
    });
  }
}

function displayResultsBooks(responseJson) {
  $("#books-results-list").empty();
  for (let i = 0; i < 3; i++) {
    if (responseJson.items[i].volumeInfo.hasOwnProperty("imageLinks")) {
      $("#books-results-list").append(
        `<li class="bookLi"><a href="${responseJson.items[i].volumeInfo.previewLink}" class="bookImg" target="_blank"><img src="${responseJson.items[i].volumeInfo.imageLinks.thumbnail}" alt="${responseJson.items[i].volumeInfo.title}"/></a></li>`
      );
    }
  }
}

function getResultsNYT(play, page) {
  $("#pagination").empty();
  $("#results-list").empty();
  $(window).scrollTop(0);

  let param = `type_of_material:("Review") AND headline:("review") AND creative_works.contains:("${play}")`;
  const params = {
    fq: param,
    q: play + " shakespeare",
  };
  const queryString = formatQueryParams(params);
  const query = "&" + queryString;
  const apiFormat = "&api-key=" + NYTapiKey;
  const url = NYTsearchURL + query + apiFormat + `&page=${page}&sort=newest`;

  console.log(url);

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayResultsNYT(responseJson, play))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function getResultsBooks(play) {
  const params = {
    q: play + " shakespeare",
    inauthor: ":william shakespeare",
    key: booksApiKey,
  };
  const queryString = formatQueryParams(params);
  const query = queryString;
  const url = booksSearchURL + query;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayResultsBooks(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $("form").submit((event) => {
    page = 0;
    event.preventDefault();
    const play = $("#js-search-play").val();
    getResultsNYT(play, page);
    getResultsBooks(play);
  });
}

$(watchForm);
