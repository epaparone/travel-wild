'use strict';

// these functions will all implement the MVP

// declare required constants & variables
const geoCodeKey = 'ycWWwntyfO8LTLjS5vXZ2uJElCAJmLw9';
const geoBaseUrl = 'https://www.mapquestapi.com/geocoding/v1/address';

const trailKey = '200620674-9b895fe414554bb6ca1a37052449aac1';
const trailBaseUrl = 'https://www.hikingproject.com/data/get-trails';
const trailDetailsBaseUrl = 'https://www.hikingproject.com/data/get-trails-by-id';

const weatherKey = 'f792d9fdc6be4710119c5eb5157bb27c';
const weatherBaseUrl = 'https://api.weather.gov/points';

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
        // hides the search form & adds the footer
        $('.home-screen').addClass('hide');
        $('footer').removeClass('hide');

        // deletes previous DOM additions - allows users to search multiple times & only see current data
        $('.js-results-list').empty();

        // passes the user input into getGeoCode -> passes result to getTrails -> passes result to displayTrails
        getGeoCode();

        // reveals results section
        $('.js-loader').removeClass('hide');
    })
}

// the app should format query parameters so that they can be used
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// the form should call on the mq api to translate the location into a geocode
function getGeoCode() {
    let townInput = ($('.location-input').val()).toString();
    let stateInput = ($('.state-input').val()).toString();
    let userSearch = townInput + ', ' + stateInput;

    const params = {
        key: geoCodeKey,
        inFormat: 'kvp', 
        outFormat: 'json',
        location: userSearch
    };

    // pass in query string
    const geoQuery = formatQueryParams(params);
    const geoUrl = geoBaseUrl + '?' + geoQuery;

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
}

// the app should send geocode results to hiking project api to get trails for corresponding geocode
function getTrails(responseJson) {
    // this function automatically runs after the geocode is returned
    // pulls necessary data from responseJson
    let latitude = `${responseJson.results[0].locations[0].latLng.lat}`;
    let longitude = `${responseJson.results[0].locations[0].latLng.lng}`;

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
}

// after submitting the form, the user should see a list of trails for their desired location without any additional clicks
function displayTrails(responseJson) {
    // this function accesses the results from getTrails & adds html to the .results-screen
    // iterates through the results object & adds a listing per item
    // accesses the desired results, creates html string
    if (responseJson.trails.length !== 0) {
        for (let i = 0; i < responseJson.trails.length; i++) {
            $('.js-results-list').append(
                `<section class='results-list-item'>
                    <img class='listing-img' src='${responseJson.trails[i].imgMedium}' alt='${responseJson.trails[i].name} photo'>
                    <h3 class='js-trail-name' id='trail-name'>${responseJson.trails[i].name}</h3>
                    <p id='trail-desc'>${responseJson.trails[i].summary}</p>
                    <ul class='details-list'>
                        <li>Location: ${responseJson.trails[i].location}</li>
                        <li>Mileage: ${responseJson.trails[i].length} miles</li>
                        <li>Ascent: ${responseJson.trails[i].ascent} ft</li>
                    </ul>
                    <button class='js-show-details' id='info-button' value='${responseJson.trails[i].id}'>Learn More</button>
                </section>`
            );
        };
    } else {
        return $('.js-results-list').append(
            `<h3>Sorry, we couldn't find any logged trails in this state. Please search again.</h3>`)
    }
    
    // hides the loader
    $('.js-loader').addClass('hide');
    
    // toggles the trails result list to display it
    $('.results-screen').removeClass('hide');
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
    const params = {
        ids: hikingProjectId,
        key: trailKey
    };

    const trailDetailsQuery = formatQueryParams(params);
    const trailDetailsUrl = trailDetailsBaseUrl + '?' + trailDetailsQuery;

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
}


function displayTrailDetails(responseJson) {
    // display more info about trails than the displayTrails list
    // creates html for the trail details
    $('.details-screen').prepend(
        `<h2 class='details-title'>${responseJson.trails[0].name}</h2>
        <img class='details-img' src='${responseJson.trails[0].imgMedium}' alt='${responseJson.trails[0].name} photo'>`
    );

    $('.js-details-main').prepend(
        `<div class='details-para'>
            <p id='trail-desc-details'>${responseJson.trails[0].summary}</p>
            <ul class='details-list'>
                <li>Location: ${responseJson.trails[0].location}</li>
                <li>Length: ${responseJson.trails[0].length} miles</li>
                <li>Elevation: ${responseJson.trails[0].high} ft above sea level</li>
                <li>Ascent: ${responseJson.trails[0].ascent} ft</li>
                <li>Descent: ${responseJson.trails[0].descent} ft</li>
                <li><a href='${responseJson.trails[0].url}' target='_blank'>More Info</a></li>
            </ul>
        </div>`
    );
    
    // creates variable to pass to detail APIs
    let locationDetails = `${responseJson.trails[0].latitude},${responseJson.trails[0].longitude}`;
    let trailName = `${responseJson.trails[0].name}`;
    let nearbyLocation = `${responseJson.trails[0].location}`;

    // passes location to nps api to get nearby national parks services sites
    let stateInput = ($('.state-input').val()).toString();
    getNpsSites(stateInput);

    // passes location to mapquest for a static map of the area
    getMap(locationDetails, stateInput, nearbyLocation);

    // passes trail name to youTube to get videos ~ 3
    getVideos(trailName);
}



// finds nearby NPS sites - searches by state as input by user
function getNpsSites(stateInput) {

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

    // creates html for nps section
    $('.js-nps-section').prepend(
        `<div class='h3-wrap'>
            <h3>Explore More</h3>
        </div>
        <h5>More National Parks Service sites in ${stateInput}.</h5>`
    );

    for (let i = 0; i < responseJson.data.length; i++) {
        $('.nps-list').append(
            `<div class='nps-listing'>
                <img class='details-img' src='${responseJson.data[i].images[0].url}' alt='${responseJson.data[i].images[0].altText}'>
                <a class='details-link' href='${responseJson.data[i].url}'><h4>${responseJson.data[i].fullName}</h4></a>
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

    // creates img containing map
    $('.js-map-section').append(
        `<div class='h3-wrap'>
            <h3>Nearby Area</h3>
        </div>
        <img class='details-img' id='map-details' src='${response.url}'>`
    );
}

// pulls videos from YouTube
function getVideos(trailName) {
    const params = {
        part: 'snippet',
        maxResults: 3,
        q: trailName,
        safeSearch: 'strict',
        //videoCaption: 'closedCaption',
        key: videoKey
    };

    // pass in query string
    const videoQuery = formatQueryParams(params);
    const videoUrl = videoBaseUrl + '?' + videoQuery;

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

    // creates & adds video html
    $('.js-video-section').prepend(
        `<div class='h3-wrap'>
            <h3>Videos</h3>
        </div>
        <h5>Related to ${trailName}:</h5>`
    );

    for (let i = 0; i < responseJson.items.length; i++) {
        $('.video-list').append(
            `<div class='video-link-container'>
                <a class='details-link' href='https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}' target='_blank'>
                    <img class='thumbnail-img' src='${responseJson.items[i].snippet.thumbnails.medium.url}' alt='${responseJson.items[i].snippet.title} thumbnail'>
                    <h4 class='video-title'>${responseJson.items[i].snippet.title}</h4>
                </a>
                <p class='video-desc'>${responseJson.items[i].snippet.description}</p>
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
}

function handleControls() {
    // handles all major button controls
    restartButton();
}



$(document).ready(function() {
    watchForm();
    handleDetailsPage();
    handleControls();
});