"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let editStoryID;
// console.log(storyList);

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove(); // remove the element itself, as well as everything inside it, from DOM; 

  putStoriesOnPage();
}


// create HTML for star based on whether story is favorited or not
function generateStar(story, user) {
  let starStyle = '';
  if (user.isFavorite(story)) {
    starStyle = 'fa-solid';
  } else {
    starStyle = 'fa-regular';
  }
  return `<span class="star"><i class="${starStyle} fa-star"></i></span>`;
}

// create HTML for trash based on whether story user has their own stories
function generateTrash(user) {
  let trash = '';
  if (user.ownStories.length) {
    trash = '<span class="trash"><i class="fa-solid fa-trash-can"></i></span>';
  } 

  return trash;
}


// create HTML for edit button based on whether story user has their own stories
function generateEdit(user) {
  let edit = '';
  if (user.ownStories.length) {
    edit = '<button type="button" class="edit">Edit</button>';
  } 

  return edit;
}


/**
 * A render method to render HTML for an individual Story instance (the LI that goes in #all-stories-list)
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if user is logged in, display favorite stars; otherwise don't
  let starHTML = '';
  let trashHTML = '';
  let editHTML = '';
    if (currentUser) {
      starHTML = generateStar(story, currentUser);
      trashHTML = generateTrash(currentUser);
      editHTML = generateEdit(currentUser);
    } else {
      starHTML = '';
    }

  return $(`
      <li id="${story.storyId}">
      ${trashHTML}
      ${starHTML}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        ${editHTML}
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <hr>
    `);
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  // jQuery method;  removes all child (and other descendant) elements, along with any text within the set of matched elements.
  // remove all storeies from #all-stories-list
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $('.trash').remove();
  $('.edit').remove();

  $allStoriesList.show();
}


/** Handle story submit form submission. update this function*/
async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  const story = await storyList.addStory(currentUser, {title, author, url});

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $('.trash').remove();
  $('.edit').remove();
  
  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStory);


/** Display user favorite list after favorite tab is clicked on*/
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  if (currentUser.favorites.length === 0) { // check if favorite list is empty
    $noFavoritesMsg.show();
    return;
  }

  // jQuery method;  removes all child (and other descendant) elements, along with any text within the set of matched elements.
  // remove all storeies from #all-stories-list
  $favoriteList.empty();

  // loop through all of user favorite stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteList.append($story);
  }

  $('.trash').remove();
  $('.edit').remove();
  $favoriteList.show();
}

/** click event handler for when user clicks on favorite start symbol
 * Will add a story to user favorite list and update star to be solid if story clicked was unfavorited
 * Will delete a story from user favorite list and update star to be empty if story clicked was favorited
*/
async function toggleFavoriteStatus(e) {
  console.debug("toggleFavoriteStatus", e);
  
  const $star = $(e.target);
  const storyId = $star.closest('li').attr('id');
  const story = storyList.stories.find(val => { // find the story instance from storylist that matches the storyId selected
    return val.storyId === storyId;
  });

  // Check if item is favortied (solid star)
  if($star.hasClass('fa-solid')) {
    // If favorite when clicked: remove from user's favorite list and change to empty star
    await currentUser.deleteFavorite(story);
    $star.closest('i').toggleClass('fa-solid fa-regular');
  } else {
    // If not favorite when clicked: add to user's favorite list and change to solid star
    await currentUser.addFavorite(story);
    $star.closest('i').toggleClass('fa-solid fa-regular');
  }
}

$storiesLists.on('click', '.star', toggleFavoriteStatus);



/** Display user own stories list after "my Stories" tab is clicked on*/
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  if (currentUser.ownStories.length === 0) { // check if user's own story list is empty
    $noUserStoriesMsg.show();
    return;
  }

  // jQuery method;  removes all child (and other descendant) elements, along with any text within the set of matched elements.
  // remove all storeies from #all-stories-list
  $userStoriesList.empty();

  // loop through all of user own stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $userStoriesList.append($story);
  }


  $userStoriesList.show();
}


/** click event handler for when user clicks on trash can symbol
 * Will remove a story from user own story list and update webpage to not dsiplay story anymore
*/
async function deleteUserStories(e) {
  console.debug("deleteUserStories", e);
  
  const $trash = $(e.target);
  const storyId = $trash.closest('li').attr('id');

  await storyList.deleteStory(currentUser, storyId);

  hidePageComponents();
  putUserStoriesOnPage();
}

$userStoriesList.on('click', '.trash', deleteUserStories);



/** click event handler for when user clicks on trash can symbol
 * Will remove a story from user own story list and update webpage to not dsiplay story anymore
*/
function editButtonClick(e) {
  console.debug("editButtonClick", e);
  
  const $edit = $(e.target);
  editStoryID = $edit.closest('li').attr('id');

  hidePageComponents();
  $submitForm.show();
}

$storiesLists.on('click', '.edit', editButtonClick);




/** click event handler for when user clicks on trash can symbol
 * Will remove a story from user own story list and update webpage to not dsiplay story anymore
*/
// async function updateUserStory(evt) {
//   console.debug("updateUserStory", evt);
//   evt.preventDefault();

//   const author = $("#story-author").val();
//   const title = $("#story-title").val();
//   const url = $("#story-url").val();

//   // User.signup retrieves user info from API and returns User instance
//   // which we'll make the globally-available, logged-in user.
//   await storyList.updateStory(currentUser, editStoryID, {title, author, url});

//   const $story = generateStoryMarkup(story);
//   $allStoriesList.prepend($story);
//   // $('.trash').remove();
  
//   // hide the form and reset it
//   $submitForm.slideUp("slow");
//   $submitForm.trigger("reset");
// }

// $submitForm.on("submit", updateUserStory);

// async function updateUserStories(e) {
//   console.debug("updateUserStories", e);
  
//   const $edit = $(e.target);
//   const storyId = $edit.closest('li').attr('id');


  
//   await storyList.deleteStory(currentUser, storyId);

//   hidePageComponents();
//   putUserStoriesOnPage();
// }

// $storiesLists.on('click', '.edit', updateUserStories);