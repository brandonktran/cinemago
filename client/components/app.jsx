import React from 'react';
import HomeSearch from './home-search';
import HomePage from './home-page';
import Navbar from './navbar';
import UserLists from './user-lists';
import MovieDetails from './movie-details';
import UserProfile from './user-profile';
import ListItems from './list-Items';
import WriteReview from './write-review';
import LoginPage from './login-page';
import CreateAccount from './create-account';
import Header from './header';
import ViewReviewsPage from './view-reviews-page';
import ViewOtherReviewsPage from './view-other-reviews-page';
import UserMessages from './user-messages';
import OtherProfile from './other-profile';
import Transition from './transition-component';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'login', // change to login if want to use login page,
      results: [],
      otherUsers: [],
      trending: [],
      lists: [],
      details: [],
      viewListItems: [],
      currentListName: '',
      currentListId: null,
      userId: 1, // Hardcoded for now, will be set after user logs in and will be helpful in fetching to backend
      reviews: [],
      messages: [],
      movieToReview: null,
      movieTitleToReview: '',
      userViewed: null,
      lastPage: 'home',
      otherUserReviews: []

    };
    this.searchResults = this.searchResults.bind(this);
    this.searchFilteredResults = this.searchFilteredResults.bind(this);
    this.getTrending = this.getTrending.bind(this);
    this.getUserLists = this.getUserLists.bind(this);
    this.createNewList = this.createNewList.bind(this);
    this.changeView = this.changeView.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.getMovieDetails = this.getMovieDetails.bind(this);
    this.addItemToList = this.addItemToList.bind(this);
    this.getItemsInList = this.getItemsInList.bind(this);
    this.removeItemsInList = this.removeItemsInList.bind(this);
    this.removeItemsInListMovieDetails = this.removeItemsInListMovieDetails.bind(this);
    this.logIn = this.logIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.logOut = this.logOut.bind(this);
    this.searchUsers = this.searchUsers.bind(this);
    this.viewReviews = this.viewReviews.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.postReview = this.postReview.bind(this);
    this.viewReviews = this.viewReviews.bind(this);
    this.editReview = this.editReview.bind(this);
    this.deleteReview = this.deleteReview.bind(this);
    this.changeCurrentMovieToReview = this.changeCurrentMovieToReview.bind(this);
    this.goBack = this.goBack.bind(this);
    this.getOtherUserReviews = this.getOtherUserReviews.bind(this);
    this.backToProfile = this.backToProfile.bind(this);
  }

  logIn(email, password) {
    fetch('api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'wrong email or password') {
          return data.message;
        } else {
          this.setState({ userId: data.userInfo.userId, view: 'home' });
          return data.message;
        }
      }).then(data => {
        if (data.message !== 'wrong email or password') {
          this.getUserLists();
        }
      }
      );
  }

  signUp(name, email, password) {
    fetch('api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name, email: email, password: password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'email already taken') {
          return data.message;
        } else {
          this.setState({ userId: data.userInfo.userId, view: 'home' });
          return data.message;
        }
      }).then(data => {
        if (data.message !== 'email already taken') {
          this.getUserLists();
        }
      });
  }

  logOut() {
    this.setState({
      userId: null,
      view: 'login',
      results: [],
      otherUsers: [],
      lists: [],
      details: [],
      viewListItems: [],
      currentListName: '',
      messages: [],
      lastPage: null
    });
  }

  searchResults(query, category) {
    this.setState({ results: [] }); // clear search results on new search
    fetch('api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    })
      .then(res => res.json())
      .then(data => {
        if (category === 'popularity') {
          data.sort(function (a, b) {
            return b.popularity - a.popularity;
          });
        } else if (category === 'rating') {
          data.sort(function (a, b) {
            return b.vote_average - a.vote_average;
          });
        } else {
          data.sort(function (a, b) {
            if (a.release_date && b.release_date) {
              return parseInt(b.release_date.substr(0, 4)) - parseInt(a.release_date.substr(0, 4));
            }
          });
        }
        this.setState({ results: data });
      });
  }

  searchFilteredResults(query, category, filter) {
    this.setState({ results: [] });
    fetch('api/search/genre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query, filter: filter })
    })
      .then(res => res.json())
      .then(data => {
        if (category === 'popularity') {
          data.sort(function (a, b) {
            return b.popularity - a.popularity;
          });
        } else if (category === 'rating') {
          data.sort(function (a, b) {
            return b.vote_average - a.vote_average;
          });
        } else {
          data.sort(function (a, b) {
            return parseInt(b.release_date.substr(0, 4)) - parseInt(a.release_date.substr(0, 4));
          });
        }
        this.setState({ results: data });
      });
  }

  getTrending(category) {
    fetch('api/home', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: category })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ trending: data });
      });
  }

  getUserLists() {
    fetch(`/api/lists/${this.state.userId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ lists: data });
      });
  }

  createNewList(name) {
    fetch(`api/lists/${this.state.userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name })
    })
      .then(res => res.json())
      .then(data => {
        this.getUserLists();
      });
  }

  deleteList(listId) {
    fetch(`/api/lists/${listId}`, {
      method: 'DELETE'

    }).then(res => res.json())
      .then(data => {
        this.getUserLists();
      });
  }

  getMovieDetails(movieId) {
    fetch(`/api/details/${movieId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ details: data });
      }).then(data => this.changeView('details'));
  }

  addItemToList(listId, movieDetails) {
    fetch(`/api/lists/add/${listId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        movieId: movieDetails.id,
        title: movieDetails.title,
        description: movieDetails.overview,
        posterURL: movieDetails.poster_path,
        release_date: movieDetails.release_date
      })
    })
      .then(res => res.json())
      .then(data => {
        return data;
      });
  }

  getItemsInList(listId, listName) {
    fetch(`/api/listItems/${listId}`)
      .then(res => res.json())
      .then(data =>
        this.setState({ viewListItems: data })
      ).then(data => this.changeView('listContent'))
      .then(data => this.setState({ currentListName: listName, currentListId: listId }));
  }

  removeItemsInList(listId, movieId) {
    fetch(`/api/listItems/${listId}/${movieId}`, {
      method: 'DELETE'
    }).then(res => res.json())
      .then(data => this.getItemsInList(listId, this.state.currentListName));
  }

  // same as removeItemsInList without calling this.getItemsInList
  removeItemsInListMovieDetails(listId, movieId) {
    fetch(`/api/listItems/${listId}/${movieId}`, {
      method: 'DELETE'
    }).then(res => res.json());
  }

  searchUsers(query) {
    fetch(`/api/search/users/${this.state.userId}`)
      .then(res => res.json())
      .then(data => {
        const result = data.filter(user => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
        this.setState({ otherUsers: result });
      });
  }

  getMessages() {
    fetch(`/api/messages/${this.state.userId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ messages: data });
      });
  }

  sendMessage(recipientId, content) {
    fetch(`/api/messages/${this.state.userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientId: recipientId,
        content: content
      })
    })
      .then(res => res.json())
      .then(data => {
        return data;
      });
  }

  deleteMessage(messageId) {
    fetch(`/api/messages/${messageId}`, {
      method: 'DELETE'

    }).then(res => res.json())
      .then(data => {
        this.getMessages();
      });
  }

  postReview(movieId, content, rating, title) {
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content, rating: rating, userId: this.state.userId, movieId: movieId, title: title })
    })
      .then(response => response.json())
      .then(review => {
        this.changeView('listContent');
      }).then(data => this.viewReviews());
  }

  viewReviews() {
    fetch(`/api/reviews/${this.state.userId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ reviews: data, view: 'ownReviews' });
      });
  }

  editReview(reviewId, content, rating) {
    fetch(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content, rating: rating, reviewId: reviewId })
    })
      .then(data => {
        this.viewReviews();
      });
  }

  deleteReview(reviewId) {
    fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => this.viewReviews());
  }

  changeCurrentMovieToReview(movieId, movieTitle) {
    this.setState({ movieToReview: movieId, movieTitleToReview: movieTitle });
  }

  getOtherUserReviews(data) {
    this.setState({ otherUserReviews: data });
  }

  changeView(newPage, userId) {
    const lastView = (newPage === this.state.view) ? this.state.lastPage : this.state.view;
    if (typeof userId === 'undefined') {
      this.setState({ view: newPage, lastPage: lastView });
    } else {
      this.setState({ view: newPage, userViewed: userId, lastPage: lastView });
    }
    window.scrollTo(0, 0);
  }

  backToProfile() {
    this.setState({ view: 'user' });
  }

  goBack() {
    this.setState(prevState => {
      return { view: prevState.lastPage, lastPage: prevState.view };
    });
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    let pageView;
    if (this.state.view === 'home') {
      pageView =
        <HomePage
          getTrending={this.getTrending}
          results={this.state.trending}
          getMovieDetails={this.getMovieDetails}
          getUserLists={this.getUserLists}

        />;

    } else if (this.state.view === 'search') {
      pageView =
        <HomeSearch
          searchResults={this.searchResults}
          searchFilteredResults={this.searchFilteredResults}
          results={this.state.results}
          addItemToList={this.addItemToList}
          getMovieDetails={this.getMovieDetails}
          lists={this.state.lists}
          changeView={this.changeView}
          searchUsers={this.searchUsers}
          otherUsers={this.state.otherUsers}
          sendMessage={this.sendMessage}

        />;

    } else if (this.state.view === 'list') {
      pageView =
        <UserLists
          getMovieDetails={this.getMovieDetails}
          getUserLists={this.getUserLists}
          lists={this.state.lists}
          createNewList={this.createNewList}
          deleteList={this.deleteList}
          changeView={this.changeView}
          getItemsInList={this.getItemsInList}
        />;

    } else if (this.state.view === 'details') {
      pageView =
        <MovieDetails
          changeView={this.changeView}
          details={this.state.details}
          addItemToList={this.addItemToList}
          removeItemsInListMovieDetails={this.removeItemsInListMovieDetails}
          lists={this.state.lists}
          listId={this.state.currentListId}
          getMovieDetails={this.getMovieDetails}
          changeCurrentMovieToReview={this.changeCurrentMovieToReview}
          goBack={this.goBack}
        />;

    } else if (this.state.view === 'user') {
      pageView =
        <UserProfile
          userId={this.state.userId}
          changeView={this.changeView}
          viewReviews={this.viewReviews} />;

    } else if (this.state.view === 'listContent') {
      pageView =
        <ListItems
          viewListItems={this.state.viewListItems}
          listName={this.state.currentListName}
          listId={this.state.currentListId}
          changeView={this.changeView}
          removeItemsInList={this.removeItemsInList}
          changeCurrentMovieToReview={this.changeCurrentMovieToReview} />;

    } else if (this.state.view === 'review') {
      pageView =
        <WriteReview
          changeView={this.changeView}
          postReview={this.postReview}
          movieToReview={this.state.movieToReview}
          movieTitleToReview={this.state.movieTitleToReview} />;

    } else if (this.state.view === 'messages') {
      pageView =
        <UserMessages
          messages={this.state.messages}
          getMessages={this.getMessages}
          deleteMessage={this.deleteMessage.bind(this)} />;

    } else if (this.state.view === 'ownReviews') {
      pageView =
        <ViewReviewsPage
          userId={this.state.userId}
          viewReviews={this.viewReviews}
          editReview={this.editReview}
          deleteReview={this.deleteReview}
          reviews={this.state.reviews}
          changeView={this.changeView}
          backToProfile={this.backToProfile}
        />;

    } else if (this.state.view === 'otherReviews') {
      pageView =
        <ViewOtherReviewsPage
          changeView={this.changeView}
          otherReviews={this.state.otherUserReviews}
          goBack={this.goBack}
        />;

    } else if (this.state.view === 'otherProfile') {
      pageView =
        <OtherProfile
          changeView={this.changeView}
          sendMessage={this.sendMessage}
          userId={this.state.userViewed}
          goBack={this.goBack}
          getOtherUserReviews={this.getOtherUserReviews}
          getMovieDetails={this.getMovieDetails} />;
    }

    if (this.state.view === 'login') {
      return (
        <Transition key={this.state.view}>
          <LoginPage
            logIn={this.logIn}
            changeView={this.changeView} />
        </Transition>);
    } else if (this.state.view === 'signUp') {
      return (
        <Transition key={this.state.view}>
          <CreateAccount
            changeView={this.changeView}
            signUp={this.signUp} />
        </Transition>);
    } else if (this.state.view === 'details') {
      return <>

        <Transition key={this.state.view}>
          {pageView}
        </Transition>;
        <Navbar current={this.state.view} changeView={this.changeView} />

      </>;
    } else {
      return <>
        <Header logOut={this.logOut} />

        <Transition key={this.state.view}>
          {pageView}
        </Transition>
        <Navbar current={this.state.view} changeView={this.changeView} />

      </>;
    }
  }
}
