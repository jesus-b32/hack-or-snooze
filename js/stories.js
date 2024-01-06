"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
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
    if (currentUser) {
      starHTML = generateStar(story, currentUser);
    } else {
      starHTML = '';
    }

  return $(`
      <li id="${story.storyId}">
      ${starHTML}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
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

  $allStoriesList.show();
}


/** Handle story submit form submission. DONE*/
async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  const story = await StoryList.addStory(currentUser, {title, author, url});

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  
  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStory);


/** Display user favorite list after favorite tab is clicked on*/
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  // jQuery method;  removes all child (and other descendant) elements, along with any text within the set of matched elements.
  // remove all storeies from #all-stories-list
  $favoriteList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteList.append($story);
  }

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