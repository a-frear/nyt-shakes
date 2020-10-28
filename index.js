'use strict';
const NYTapiKey = config.NYTapi;
const NYTsearchURL = `https://api.nytimes.com/svc/search/v2/articlesearch.json?`

const booksApiKey = config.booksAPI
const booksSearchURL = `https://www.googleapis.com/books/v1/volumes?`

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function displayResultsNYT(responseJson) {
    $('#results-list').empty();
    // iterate through the array
    for (let i = 0; i < responseJson.response.docs.length; i++) {
        $('#results-list').append(
            `<li>
      <a href="${responseJson.response.docs[i].web_url} class="articleLink"  target="_blank"><h3 class="headline">${responseJson.response.docs[i].headline.main}</h3></a>
      <h4>${responseJson.response.docs[i].pub_date}</h4>
      <p>${responseJson.response.docs[i].lead_paragraph}</p>
      </li>`
        )
    };
    //display the results section  
    $('#results').removeClass('hidden');
};

function displayResultsBooks(responseJson) {
  $('#books-results-list').empty();
  for (let i = 0; i < 3; i++) {
    //I need to figure out how to skip books that don't have the imageLinks property
    if (responseJson.items[i].volumeInfo.hasOwnProperty('imageLinks')) {
      $('#books-results-list').append(`<li class="bookImg"><a href="${responseJson.items[i].volumeInfo.previewLink}" target="_blank"><img src="${responseJson.items[i].volumeInfo.imageLinks.thumbnail}" alt="cover of script"/></a></li>`);
    }
  }
};

function getResultsNYT(play) {
let param = `type_of_material:("Review") AND headline:("review" "${play}")`
  const params = {
      fq: param,
      q: play + " shakespeare" 
  };
  const queryString = formatQueryParams(params)
  const query = '&' + queryString;
  const apiFormat = "&api-key=" + NYTapiKey;
  const url = NYTsearchURL + query + apiFormat;
  console.log(url);


  fetch(url)
      .then(response => {
          if (response.ok) {
              return response.json();
          }
          throw new Error(response.statusText);
      })
      .then(responseJson => displayResultsNYT(responseJson))
      .catch(err => {
          $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
};

function getResultsBooks(play) {
    const params = {
        q: play + " shakespeare",
        inauthor: ':william shakespeare',
        inpublisher: 'folger shakespeare library',
        key: booksApiKey,
    };
    const queryString = formatQueryParams(params)
    const query = queryString;
    const url = booksSearchURL + query;
    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsBooks(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
};

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const play = $('#js-search-play').val();
        getResultsNYT(play);
        getResultsBooks(play);
    });
}

$(watchForm);