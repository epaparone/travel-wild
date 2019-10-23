'use strict';

// these functions will all implement the MVP

// declare required constants
const geoCodeKey = 'ycWWwntyfO8LTLjS5vXZ2uJElCAJmLw9';
const geoBaseUrl = 'https://www.mapquestapi.com/geocoding/v1/address';

const trailKey = '200620674-9b895fe414554bb6ca1a37052449aac1';
const trailBaseUrl = 'https://www.hikingproject.com/data/get-trails';

const routeKey = geoCodeKey;
const routeBaseUrl = 'https://www.mapquestapi.com/directions/v2/optimizedroute';

// this group of functions controls the search & user input to display trails search results

// user should be able to submit a location to a form to search for trails
function watchForm(responseJson) {
    // adds an event listener to our form
    $('.submit-button').on('click', function() {
        event.preventDefault();

        // passes the user input into getGeoCode -> passes result to getTrails -> passes result to displayTrails
        getGeoCode();
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
    let userSearch = ($('.location-input').val()).toString();

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

    /*let trailHeaders = new Headers({
        'Access-Control-Allow-Origin': 'https://www.mapquestapi.com/'
    });*/

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

    
    // toggles the trails result list to display it
    console.log('display trails working');
}




// this group of functions handles displaying trail details

// the user should be able to view more details about any trail included in the list
function getTrailDetails() {
    // needs to have getTrails results passed in - accesses getTrails results
    // display more info about trails than the displayTrails list
    // creates html for the trail details
    console.log('get trail details working');
}

// by clicking on a specific trail, the user should see details on that trail
function displayTrailDetails() {
    // adds the getTrailDetails html .on(click) to .details-screen
    // toggles the trails result list to hide it
    // toggles the details view to display it
    getTrailDetails();
    console.log('display trail details working');
}



// this group of functions handles adding/deleting trails from a trip, general controls & navigating between list and detail views

// the user should be able to navigate between the results & detail views
function toggleToResults() {
    // watches the results list button to go back to results list
    // removes displayTrailDetails results from .details-screen
    // toggles the details view to hide it
    // toggles the trails result list to display it
    console.log('toggle results working');
}

// the user should be able to add trails to their trip
function addTrail() {
    // watches the add trail button to add it to the trip list
    // access data from getTrails to pass that to the trip list
    // adds getTrails data to the a trip list array
    // adds hide class to details screen & results screen to hide them regardless of origin
    // toggles the trip list to display it
    console.log('add trail working');
}

// the user should be able to delete trails from their trip
function removeTrail() {
    // watches the delete trail button to remove it from the trip list
    // removes data from the js trip list array
    // removes the html from the dom
    console.log('remove trail working');
}

// users should be able to start over & begin a new search
function restartButton() {
    // clears dom
    // takes the user back to the search screen
    // allows users to start from the beginning, do a new search & create a new trip
    console.log('restart button working');
}

function handleControls() {
    // handles all major button controls
    toggleToResults();
    addTrail();
    removeTrail();
    restartButton();
    console.log('control functions working');
}



// this group of functions handles getting an optimized route & directions

// a user should be able to get an optimized route by clicking on a button
function getRoute() {
    // access addTrails data to pass to mq directions api
    // prompts the user to specify their desired start & end points on their route
    // calls on mq dir api using user specified inputs
    // returns results - passes them to displayRoute
    console.log('get route working');
}

function displayRoute() {
    // accesses results from getRoute
    // creates html of route info accessed from results
    // toggles 
    // toggles trip list to hide it
    getRoute();
    console.log('display route working');
}

$(document).ready(function() {
    watchForm();
    handleControls();
    //displayTrails();
    displayRoute();
    console.log('Ready - waiting for user action.');
});