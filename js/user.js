"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * passowrd visibility toggle for login/signup/login
 */

/** Handle password toggle click for login form. */
function loginTogglePassword(e) {
  // toggle the passowrd type attribute
  const password = $("#login-password");
  const type = password.attr('type') === 'password' ? 'text' : 'password';
  password.attr('type', type);

  // toggle the eye / eye slash icon
  $("#login-eye").toggleClass('fa-eye-slash fa-eye');
}

$("#login-eye").on('click', loginTogglePassword);



/** Handle password toggle click for login form. */
function signupTogglePassword(e) {
  // toggle the passowrd type attribute
  const password = $("#signup-password");
  const type = password.attr('type') === 'password' ? 'text' : 'password';
  password.attr('type', type);

  // toggle the eye / eye slash icon
  $("#signup-eye").toggleClass('fa-eye-slash fa-eye');
}

$("#signup-eye").on('click', signupTogglePassword);


/** Handle password toggle click for login form. */
function changePassowrdToggle(e) {
  // toggle the passowrd type attribute
  const password = $("#update-password");
  const type = password.attr('type') === 'password' ? 'text' : 'password';
  password.attr('type', type);

  // toggle the eye / eye slash icon
  $("#update-password-eye").toggleClass('fa-eye-slash fa-eye');
}

$("#update-password-eye").on('click', changePassowrdToggle);

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  if(!(currentUser instanceof User)){
    alert(currentUser.response.data.error.message);
    return;
  }

   // jQuery method; triggers the specified event and the default behavior of an event for the selected elements.
  // will trigger form rest event, which resets the value of all elements in a form, and default form behavior of reloading webpage
  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  if(!(currentUser instanceof User)){
    alert(currentUser.response.data.error.message);
    return;
  }

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);


/** Handle current user name update on form submission. */

async function updateNameAndPassword(evt) {
  console.debug("updateNameAndPassword", evt);
  evt.preventDefault();

  const name = $("#update-name").val();
  const password = $("#update-password").val();

  // Sends new name info to API
  await currentUser.updateUser(name, currentUser.username, password);

  //refresh name welcome title
  $('#user-name').empty();
  $('#user-name').append(`Welcome ${currentUser.name}`);
  $("#update-user-form").trigger("reset");
}

$("#update-user-form").on("submit", updateNameAndPassword);


/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  // The location.reload() method reloads the current URL, like the Refresh button.
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  // jQuery method that shows the hidden, selected elements. 
  //show() works on elements hidden with jQuery methods and display:none in CSS (but not visibility:hidden)
  hidePageComponents();
  putStoriesOnPage();

  updateNavOnLogin();
}
