"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show(); // . class "main-nav-links" not currently defined
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navSubmit.show();
  $navFavorite.show();
}


/** Show Submit form on click on "Submit Story" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $submitForm.show();
  putStoriesOnPage();
}

$navSubmit.on("click", navSubmitClick);


/** Show Favorite list on click on "Favorites" tab*/
function navFavoriteClick(evt) { 
  console.debug("navFavoriteClick", evt);

  hidePageComponents();

  if (currentUser.favorites.length === 0) { // check if favorite list is empty
    $noFavoritesMsg.show();
  } else {
    putFavoritesOnPage();
  }
}
$navFavorite.on("click", navFavoriteClick);
