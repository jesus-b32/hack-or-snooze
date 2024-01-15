"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method? 
    // Usually, static methods are used to implement functions that belong to the class as a whole, but not to any particular object of it.
    // SO in this case it does not make sense to for each instace of StoryList class to have the method getStories() becuase it is an API call that will always be the same

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }



  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, {title, author, url}) {
       // query the /stories endpoint (auth required)
      //  try {
        const response = await axios({
          url: `${BASE_URL}/stories`,
          method: "POST",
          data: {story: {title, author, url}, token: user.loginToken},
        });

        const newStory = new Story(response.data.story);
        this.stories.unshift(newStory);
        user.ownStories.unshift(newStory);

        return newStory;
      //  } catch(e) {
      //   // alert('Error Occured');
      //  }
  }


    /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

    async userPassword(user, {title, author, url}) {
      // query the /stories endpoint (auth required)
     //  try {
       const response = await axios({
         url: `${BASE_URL}/stories`,
         method: "POST",
         data: {story: {title, author, url}, token: user.loginToken},
       });

       const newStory = new Story(response.data.story);
       this.stories.unshift(newStory);
       user.ownStories.unshift(newStory);

       return newStory;
     //  } catch(e) {
     //   // alert('Error Occured');
     //  }
 }

      /** Delete a story from API and remove it ffrom story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async deleteStory(user, storyId) {
    user.ownStories = user.ownStories.filter(val => {
      return val.storyId !== storyId;
    });
    user.favorites = user.favorites.filter(val => {
      return val.storyId !== storyId;
    });
    this.stories = this.stories.filter(val => {
      return val.storyId !== storyId;
    });

    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: {token: user.loginToken},
    });
  }

        /** Update a story from API and update the sotru on story list and dsiplay updated storylist.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async updateStory(user, storyId, {title, author, url}) {    
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "PATCH",
      data: {token: user.loginToken, story: {title, author, url}},
    });

    // const newStory = new Story(response.data.story);
    // this.stories = this.stories.reduce(val => {

    // })
    for(let story of this.stories) {
      if(story.storyId === storyId)  {
        story.title = title;
        story.author = author;
        story.url = url;
      }
    }
    for(let story of user.favorites) {
      if(story.storyId === storyId)  {
        story.title = title;
        story.author = author;
        story.url = url;
      }
    }
    for(let story of user.ownStories) {
      if(story.storyId === storyId)  {
        story.title = title;
        story.author = author;
        story.url = url;
      }
    }
    //do the sdame for favorites and own storyies list
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                // password,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.password = password;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });
  
      console.log('Response: ', response);
      console.log('Response Data: ', response.data);
      let { user } = response.data; // destructuring; stroing user object into user variable
      console.log('User Variable: ', user);
      return new User( // store user object data to class User properties/varaibles
        {
          username: user.username,
          name: user.name,
          password: password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        response.data.token
      );
    } catch(e) {
      console.log(e.response.data.error.message);
      return e;
    }
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });
  
      // console.log('Response: ', response);
      // console.log('Response Data: ', response.data);
      let { user } = response.data; // destructuring; stroing user object into user variable
      // console.log('User Variable: ', user);
  
      return new User( // store user object data to class User properties/varaibles
        {
          username: user.username,
          name: user.name,
          password: password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        response.data.token
      );
    } catch (e) {
      console.log(e.response.data.error.message);
      return e;
    }
  }


    /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

    async updateUser(name, username, password) {
        await axios({
          url: `${BASE_URL}/users/${username}`,
          method: "PATCH",
          data: {user: {name, username, password}, token: this.loginToken},
        });
    }


    /** Register new user in API, make User instance & return it.
 *
 * - username: a new username
 * - password: a new password
 * - name: the user's full name
 */

    async changeName(name) {
        const username = this.username;
        const password = this.password;
        await this.updateUser(name, username, password);

        this.name = name;
    }


        /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

    async changePassword(password) {
        const username = this.username;
        const name = this.name;
        await this.updateUser(name, username, password);

        this.password = password;
    }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;
      // console.log('This.password: ', this,password);

      return new User(
        {
          username: user.username,
          name: user.name,
          // password: this.password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Add story to user's favorite list
   */
  async addFavorite(story) {
    this.favorites.push(story);
    await this.addOrDeleteFavorite("POST", story);
  }

  /** Delete a story from user's favorite list
   */
  async deleteFavorite(story) {
    this.favorites = this.favorites.filter(val => {
      return val.storyId !== story.storyId;
    });
    await this.addOrDeleteFavorite("DELETE", story);
  }


  async addOrDeleteFavorite(methodName, story) {
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: methodName,
      data: {token: this.loginToken},
    });
  }

  // return true if story is in the users favorite stories list
  isFavorite(story) {
    return this.favorites.some(val => {
      return val.storyId === story.storyId;
    });
  }
}
