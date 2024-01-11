"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $noFavoritesMsg = $('#no-favorites-msg');
const $noUserStoriesMsg = $('#no-user-stories-msg');

const $allStoriesList = $("#all-stories-list");
const $favoriteList = $("#favorite-stories-list");
const $userStoriesList = $('#user-stories-list')
const $storiesLists = $('.stories-list'); // consist of all stories, favoiirtes stories, and user stories

// const $eyeSymbol = $(".eye");
// const $loginSignupSection = $("#login-signup-section");
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $('#story-form');
const $updateStoryForm = $('#update-story-form');

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $navSubmit = $('#nav-submit');
const $navFavorite = $('#nav-favorite');
const $navMyStories = $('#nav-my-stories');

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $noFavoritesMsg,
    $noUserStoriesMsg,
    $favoriteList,
    $userStoriesList,
    $loginForm,
    $signupForm,
    $submitForm,
    $updateStoryForm
  ];
  components.forEach(c => c.hide()); // jQuery method that hides the selected elements.This is similar to the CSS property display:none.
  // Hidden elements will not be displayed at all (no longer affects the layout of the page).
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user, show allStoriesList, nav logout, nav user profile and .main-nav-links; hide nav login
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
