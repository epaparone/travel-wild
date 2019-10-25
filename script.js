'use strict';

// these functions will all implement the MVP

// declare required constants & variables
const geoCodeKey = 'ycWWwntyfO8LTLjS5vXZ2uJElCAJmLw9';
const geoBaseUrl = 'https://www.mapquestapi.com/geocoding/v1/address';

const trailKey = '200620674-9b895fe414554bb6ca1a37052449aac1';
const trailBaseUrl = 'https://www.hikingproject.com/data/get-trails';
const trailDetailsBaseUrl = 'https://www.hikingproject.com/data/get-trails-by-id';

const weatherKey = 'a7c578ed900dbc08522103d320517f3d';
const weatherAppId = '5e55630a';
const weatherBaseUrl = 'http://api.weatherunlocked.com/api/forecast';

const npsKey = 'NDAVUGL49uDwIJzHvSn1ckCz20RUMb2iz3wKbiig';
const npsBaseUrl = 'https://developer.nps.gov/api/v1/parks';

const mapKey = geoCodeKey;
const mapBaseUrl = 'https://www.mapquestapi.com/staticmap/v5/map'

const videoKey = 'AIzaSyDInBHlZH99nY84HoJ05_uq2rT4cmQQDmI';
const videoBaseUrl = 'https://www.googleapis.com/youtube/v3/search';

// this group of functions controls the search & user input to display trails search results

// user should be able to submit a location to a form to search for trails
function watchForm() {
    // adds an event listener to our form
    $('.submit-button').on('click', function() {
        event.preventDefault();
        // hides the search form
        $('.home-screen').addClass('hide');

        // deletes previous DOM additions - allows users to search multiple times & only see current data
        $('.js-results-list').empty();

        // passes the user input into getGeoCode -> passes result to getTrails -> passes result to displayTrails
        getGeoCode();

        // reveals results section
        $('.results-screen').removeClass('hide');
    console.log('watch form working');
    })
}

// the app should format query parameters so that they can be used
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    console.log(queryItems);
    return queryItems.join('&');
}

// the form should call on the mq api to translate the location into a geocode
function getGeoCode() {
    let townInput = ($('.location-input').val()).toString();
    let stateInput = ($('.state-input').val()).toString();
    let userSearch = townInput + ', ' + stateInput;

    console.log(stateInput);
    console.log(userSearch);

    const params = {
        key: geoCodeKey,
        inFormat: 'kvp', 
        outFormat: 'json',
        location: userSearch
    };

    // pass in query string
    const geoQuery = formatQueryParams(params);
    const geoUrl = geoBaseUrl + '?' + geoQuery;

    console.log(geoUrl);

    // takes the user-input location & submits that as part of a call to the mq geocode API
    // then this api responds by sending back the appr geocode - this is the value passed to getTrails
    fetch(geoUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
            throw new Error(response.statusText);
            }
        })
        .then(responseJson => getTrails(responseJson))
        .catch(error => alert('Something went wrong. Try again.'));
    console.log('get geocode working');
}

// the app should send geocode results to hiking project api to get trails for corresponding geocode
function getTrails(responseJson) {
    // this function automatically runs after the geocode is returned
    console.log(responseJson);

    // pulls necessary data from responseJson
    let latitude = `${responseJson.results[0].locations[0].latLng.lat}`;
    let longitude = `${responseJson.results[0].locations[0].latLng.lng}`;

    console.log(latitude);
    console.log(longitude);

    let listLength = ($('.length-input').val()).toString();

    // sends a call to the Hiking Project api for a specified number of trails in the desired location
    // Hiking Project params -- add additional later for further customization
    const params = {
        lat: latitude,
        lon: longitude,
        maxResults: listLength,
        key: trailKey,
    };

    const trailQuery = formatQueryParams(params);
    const trailUrl = trailBaseUrl + '?' + trailQuery;

    console.log(trailUrl);

    fetch(trailUrl)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayTrails(responseJson))
        .catch(error => alert('Something went wrong. Try again.'))
    console.log('get trails working');
}

// after submitting the form, the user should see a list of trails for their desired location without any additional clicks
function displayTrails(responseJson) {
    // this function accesses the results from getTrails & adds html to the .results-screen
    console.log(responseJson); 

    // iterates through the results object & adds a listing per item
    // accesses the desired results, creates html string
    if (responseJson.trails.length !== 0) {
        for (let i = 0; i < responseJson.trails.length; i++) {
            $('.js-results-list').append(
                `<section class='results-list-item'>
                    <img class='listing-img' src='${responseJson.trails[i].imgMedium}' alt='${responseJson.trails[i].name} photo'>
                    <h4 class='js-trail-name'>${responseJson.trails[i].name}</h4>
                    <p>${responseJson.trails[i].summary}</p>
                    <ul class='details-list'>
                        <li>Location: ${responseJson.trails[i].location}</li>
                        <li>Mileage: ${responseJson.trails[i].length} miles</li>
                        <li>Ascent: ${responseJson.trails[i].ascent} ft</li>
                    </ul>
                    <button class='js-show-details' value='${responseJson.trails[i].id}'>Learn More</button>
                </section>`
            );
        };
    } else {
        return $('.js-results-list').append(
            `<h4>Sorry, we couldn't find any logged trails in this state. Please search again.</h4>`)
    }
    
    
    // toggles the trails result list to display it
    console.log('display trails working');
}




// this group of functions handles displaying trail details
// the user should be able to view more details about any trail included in the list
// by clicking on a specific trail, the user should see details on that trail
// accesses trail details for the desired trail

function handleDetailsPage() {
    $('.js-results-list').on('click', '.js-show-details', function() {
        // toggles the trails result list to hide it
        $('.results-screen').addClass('hide');

        // gets trail details & adds the getTrailDetails html .on(click) to .details-screen
        let hikingProjectId = $(this).val().toString();
        getTrailDetails(hikingProjectId);

        // toggles the details view to display it
        $('.details-screen').removeClass('hide');
    });
}

function getTrailDetails(hikingProjectId) {
    console.log(hikingProjectId);

    const params = {
        ids: hikingProjectId,
        key: trailKey
    };

    const trailDetailsQuery = formatQueryParams(params);
    const trailDetailsUrl = trailDetailsBaseUrl + '?' + trailDetailsQuery;

    console.log(trailDetailsUrl);

    fetch(trailDetailsUrl)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayTrailDetails(responseJson))
        .catch(error => alert('Something went wrong. Try again.'))
    console.log('get trail details working');
}


function displayTrailDetails(responseJson) {
    // display more info about trails than the displayTrails list
    console.log(responseJson);

    // creates html for the trail details
    $('.js-details-main').append(
        `<h3>${responseJson.trails[0].name}</h3>
        <img class='details-img' src='${responseJson.trails[0].imgMedium}' alt='${responseJson.trails[0].name} photo'>
        <p>${responseJson.trails[0].summary}</p>
        <ul class='details-list'>
            <li>Location: ${responseJson.trails[0].location}</li>
            <li>Length: ${responseJson.trails[0].length} miles</li>
            <li>Elevation: ${responseJson.trails[0].high} ft above sea level</li>
            <li>Ascent: ${responseJson.trails[0].ascent} ft</li>
            <li>Descent: ${responseJson.trails[0].descent} ft</li>
            <li><a href='${responseJson.trails[0].url}' target='_blank'>More Info</a></li>
        </ul>`
    );
    console.log('display trail details working');
    
    // creates variable to pass to detail APIs
    let locationDetails = `${responseJson.trails[0].latitude},${responseJson.trails[0].longitude}`;
    let trailName = `${responseJson.trails[0].name}`;
    let nearbyLocation = `${responseJson.trails[0].location}`;

    // passes weather API location details variable
    getWeather(locationDetails, nearbyLocation);

    // passes location to nps api to get nearby national parks services sites
    let stateInput = ($('.state-input').val()).toString();
    getNpsSites(stateInput);

    // passes location to mapquest for a static map of the area
    getMap(locationDetails, stateInput, nearbyLocation);

    // passes trail name to youTube to get videos ~ 3
    getVideos(trailName);
}


// calls to the weather api on a click on the details button, uses trail info
function getWeather(locationDetails, nearbyLocation) {
    let weatherLocal = nearbyLocation;

    let params = {
        app_id: weatherAppId,
        app_key: weatherKey
    }

    const weatherQuery = formatQueryParams(params);
    const weatherUrl = weatherBaseUrl + '/' + locationDetails + '?' + weatherQuery;

    console.log(weatherUrl);

    fetch(weatherUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayWeather(responseJson, weatherLocal))
        .catch(error => alert('Something went wrong. Try again.'));
}

// adds html to details page of weather data
function displayWeather(responseJson, weatherLocal) {
    console.log(responseJson);

    // create html for weather data
    $('.js-weather-section').prepend(
        `<h4>Upcoming Forecast for ${weatherLocal}</h4>`
    );

    for (let i = 0; i < responseJson.Days.length; i++) {
        $('.js-weather-section').append(
            `<section class='js-weather-day'>
                <h5>${responseJson.Days[i].date}</h5>
                <ul class='weather-list'>
                    <li>High: ${responseJson.Days[i].temp_max_f}&#8457</li>
                    <li>Low: ${responseJson.Days[i].temp_min_f}&#8457</li>
                    <li>Sunrise: ${responseJson.Days[i].sunrise_time}</li>
                    <li>Sunset: ${responseJson.Days[i].sunset_time}</li>
                    <li>Chance of Rain: ${responseJson.Days[i].prob_precip_pct}%</li>
                    <li>Precipitation: ${responseJson.Days[i].precip_total_in} in</li>
                </ul>
            </section>`
        );
    };
}

// finds nearby NPS sites - searches by state as input by user
function getNpsSites(stateInput) {
    console.log(stateInput);

    const params = {
        stateCode: stateInput,
        limit: 3,
        start: 1,
        fields: 'images',
        api_key: npsKey,
    }; 

    // create & pass in query string
    let npsQuery = formatQueryParams(params);
    let npsUrl = npsBaseUrl + '?' + npsQuery;

    console.log(npsUrl);

    // fetches nps data
    fetch(npsUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
            throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayNpsSites(responseJson, stateInput))
        .catch(error => alert('Something went wrong. Try again.'));
}

// displays nearby NPS sites
function displayNpsSites(responseJson, stateInput) {
    console.log(responseJson);

    // creates html for nps section
    $('.js-nps-section').prepend(
        `<h4>Looking for more hikes in ${stateInput}? Explore these National Parks Service sites.</h4>`
    );

    for (let i = 0; i < responseJson.data.length; i++) {
        $('.js-nps-section').append(
            `<div class='nps-listing'>
                <img src='${responseJson.data[i].images[0].url}' alt='${responseJson.data[i].images[0].altText}'>
                <a href='${responseJson.data[i].url}'><h3>${responseJson.data[i].fullName}</h3></a>
                <p>${responseJson.data[i].description}</p>
            </div>`
        )};
}

// generates a static mapquest map of the area
function getMap(locationDetails, stateInput, nearbyLocation) {
    const params = {
        key: mapKey,
        locations: stateInput||locationDetails|marker-red||nearbyLocation,
        zoom: 10
    };

    // pass in query string
    const mapQuery = formatQueryParams(params);
    const mapUrl = mapBaseUrl + '?' + mapQuery;

    console.log(mapUrl);

    // takes the user-input location & submits that as part of a call to the mq geocode API
    // then this api responds by sending back the appr geocode - this is the value passed to getTrails
    fetch(mapUrl)
        .then(response => {
            if (response.ok) {
                displayMap(response);
            } else {
            throw new Error(response.statusText);
            }
        })
        .catch(error => alert('Something went wrong. Try again.'));
}

// displays static map
function displayMap(response) {
    console.log(response);

    // creates img containing map
    $('.js-map-section').append(
        `<img class='map-details' src='${response.url}'>`
    );
}

// pulls videos from YouTube
function getVideos(trailName) {
    const params = {
        part: 'snippet',
        //maxResults: 5,
        q: trailName,
        safeSearch: 'strict',
        //videoCaption: 'closedCaption',
        key: videoKey
    };

    // pass in query string
    const videoQuery = formatQueryParams(params);
    const videoUrl = videoBaseUrl + '?' + videoQuery;

    console.log(videoUrl);

    // takes the user-input location & submits that as part of a call to the mq geocode API
    // then this api responds by sending back the appr geocode - this is the value passed to getTrails
    fetch(videoUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
            throw new Error(response.statusText);
            }
        })
        .then(responseJson => displayVideo(responseJson, trailName))
        .catch(error => alert('Something went wrong. Try again.'));
}

// displays videos
function displayVideo(responseJson, trailName) {
    console.log(responseJson);

    // creates & adds video html
    $('.js-video-section').prepend(
        `<h4>Videos related to ${trailName}:</h4>`
    );

    for (let i = 0; i < responseJson.items.length; i++) {
        $('.js-video-section').append(
            `<div class='video-link-container'>
                <a href='https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}' target='_blank'>
                    <img src='${responseJson.items[i].snippet.thumbnails.high.url}' alt='${responseJson.items[i].snippet.title} thumbnail'>
                    <h4 class='js-trail-name'>${responseJson.items[i].snippet.title}</h4>
                </a>
                <p>${responseJson.items[i].snippet.description}</p>
            </div>`
        );
    };
}


// users should be able to start over & begin a new search
function restartButton() {
    // clears dom &  creates a new search - works from results or details page
    $('.js-new-search').click(function() {
        location.reload();
    });
    console.log('restart button working');
}

function handleControls() {
    // handles all major button controls
    restartButton();
    console.log('control functions working');
}



$(document).ready(function() {
    watchForm();
    handleDetailsPage();
    handleControls();
    console.log('Ready - waiting for user action.');
});