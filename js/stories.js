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

/**
 * A render method to render HTML for an individual Story instance (the LI that goes in #all-stories-list)
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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


//need a star symbol to toggle between adding or deleting from favorite list. Then add a click event for all stars that call 
//addFavorite(empty start) or deleteFavorite(solid star)
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
