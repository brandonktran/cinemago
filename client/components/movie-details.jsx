import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// add pointer class to line 146 for the icon when addreview is finished
export default class MovieDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movieIsToggleOn: false,
      addModalShow: false,
      dropdownOpen: false,
      heartIconColor: '',
      eyeIconColor: '',
      listIconColor: '',
      listId: null
    };
    this.addRemoveMovieToList = this.addRemoveMovieToList.bind(this);
    this.addModal = this.addModal.bind(this);
    this.addMovieToCustomList = this.addMovieToCustomList.bind(this);
    this.handleClickReview = this.handleClickReview.bind(this);
  }

  componentDidMount() {
    fetch(`/api/listItems/${this.props.lists[0].listId}`)
      .then(res => res.json())
      .then(data => {
        const include = data.filter(item => item.movieId === this.props.details[1].id);
        if (include.length >= 1) {
          this.setState({
            movieIsToggleOn: true,
            heartIconColor: 'text-danger'
          });
        }
      });
    fetch(`/api/listItems/${this.props.lists[1].listId}`)
      .then(res => res.json())
      .then(data => {
        const include = data.filter(item => item.movieId === this.props.details[1].id);
        if (include.length >= 1) {
          this.setState({
            movieIsToggleOn: true,
            eyeIconColor: 'text-success'
          });
        }
      });
    this.setState({ listId: this.props.lists[0].listId });
  }

  handleClickReview(event) {
    this.props.changeView('review');
    this.props.changeCurrentMovieToReview(this.props.details[0].id, this.props.details[1].title);
  }

  addModal() {
    this.setState((prevState, props) => { return { addModalShow: !prevState.addModalShow }; });
  }

  addRemoveMovieToList(event) {
    const button = event.target.getAttribute('value');
    const movieIsToggleOn = this.state.movieIsToggleOn;

    if (button === 'heart') {
      if (movieIsToggleOn === false) {
        this.props.addItemToList(this.props.lists[0].listId, this.props.details[1]);
        this.setState({
          movieIsToggleOn: true,
          heartIconColor: 'text-danger'
        });
      } else {
        this.props.removeItemsInListMovieDetails(this.props.lists[0].listId, this.props.details[0].id);
        this.setState({
          movieIsToggleOn: false,
          heartIconColor: ''
        });
      }
    } else {
      if (movieIsToggleOn === false) {
        this.props.addItemToList(this.props.lists[1].listId, this.props.details[1]);
        this.setState({
          movieIsToggleOn: true,
          eyeIconColor: 'text-success'
        });
      } else {
        this.props.removeItemsInListMovieDetails(this.props.lists[1].listId, this.props.details[0].id);
        this.setState({
          movieIsToggleOn: false,
          eyeIconColor: ''
        });
      }
    }
  }

  addMovieToCustomList() {
    this.props.addItemToList(this.state.listId, this.props.details[1]);
    this.addModal();
  }

  render() {
    let backDropPath = null;
    if (this.props.details[1]) {
      backDropPath = this.props.details[1].backdrop_path;
    }
    let posterPath = null;
    if (this.props.details[1]) {
      posterPath = this.props.details[1].poster_path;
    }
    let youtubeURL = null;
    if (this.props.details[3].results[0] !== undefined) {
      youtubeURL = this.props.details[3].results[0].key;
    }

    let usersAlsoLiked = null;
    let reviews = null;
    const recommendedMoviesArray = this.props.details[2].results;
    const reviewsArray = this.props.details[0].results;

    const newMoviesArray = recommendedMoviesArray.filter((movies, index) => index < 3);

    if (newMoviesArray < 1) {
      usersAlsoLiked = <>
        <h2>Users also liked:</h2>
        <div className="row justify-content-left px-2">
          No Movies Found
        </div>
      </>;
    } else {
      usersAlsoLiked =
        <>
          <h2>Users also liked:</h2>
          <div className="row justify-content-left px-2">
            {newMoviesArray.map((item, index) => {
              return <div key={index} className="col-4 border" onClick={() => { this.props.getMovieDetails(item.id); window.scrollTo(0, 0); }}>
                <img src={(this.props.details[2].results[index].poster_path === null) ? '../images/image_placeholder.png' : `https://image.tmdb.org/t/p/w500${this.props.details[2].results[index].poster_path}`} style={{ width: '100%' }}></img>
              </div>;
            })}
          </div>
        </>;
    }

    if (reviewsArray.length < 1) {
      reviews =
        <>
          <div className="row reviews ml-1">
            <h2>Reviews <img onClick={() => { this.handleClickReview(); }} src="../images/plus-sign-icon.png" /></h2>
          </div>
          <div className="row ml-1">
            <p>No Reviews</p>
          </div>
        </>;
    } else {
      reviews =
        <>
          <div className="row reviews ml-1">
            <h2>Reviews <img onClick={() => { this.handleClickReview(); }} src="../images/plus-sign-icon.png" /></h2>
          </div>
          <CarouselProvider
            naturalSlideWidth={25}
            naturalSlideHeight={25}
            totalSlides={reviewsArray.length}
          >
            <ButtonBack>Back</ButtonBack>
            <ButtonNext>Next</ButtonNext>
            <Slider>
              {reviewsArray.map((item, index) => {
                return (
                  <Slide className="border border-dark" key={index} index={index}>
                    <p className="p-1">User: {item.author}</p>
                    <p className="p-1">{item.content}</p>
                  </Slide>
                );
              })}
            </Slider>
          </CarouselProvider>

        </>;
    }

    return (
      <>
        <div className="container mb-5">
          <div className="row">
            <div>
              <button className="btn btn-outline-danger position-absolute" onClick={this.props.goBack}>&#60;Go Back</button>
              <img className="position-absolute" onClick={() => this.handleClick()} src="../images/less-than-icon.png" ></img>
              <img className="backdrop-poster" src={(backDropPath === null) ? '../images/image_placeholder.png' : `https://image.tmdb.org/t/p/original${backDropPath}`} style={{ width: '100%', height: '100%' }}></img>
            </div>
          </div>

          <div className="row pt-2">
            <div className="col-6 justify-content-between">
              <h2 className="title" style={{ fontWeight: 'bold', textAlign: 'center' }}>{this.props.details[1].title}</h2>
              <p style={{ fontWeight: 'bold' }}>Average Rating: {this.props.details[1].vote_average}</p>

              <div className="d-flex justify-content-between">
                <button>
                  <a href={`https://www.youtube.com/watch?v=${youtubeURL}`} target="_blank" rel='noopener noreferrer'> <img src="../images/play-icon.png"></img>Trailer </a>
                </button>
                <div className="mt-2">
                  <span style={{ fontWeight: 'bold' }}>{this.props.details[1].runtime} mins</span>
                </div>
              </div>

              <div className="pt-2">
                <i className={`pointer far fa-heart fa-3x p-1 ${this.state.heartIconColor}`} onClick={() => this.addRemoveMovieToList(event)} value="heart"></i>
                <i className={`pointer far fa-eye fa-3x p-1 ${this.state.eyeIconColor}`} onClick={() => this.addRemoveMovieToList(event)} value="eye"></i>
                <i className="pointer far fa-list-alt fa-3x p-1" onClick={() => this.addModal()} value="list" ></i>
              </div>

            </div>

            <div className="col-6">
              <img src={(posterPath === null) ? '../images/image_placeholder.png' : `https://image.tmdb.org/t/p/w500${posterPath}`} style={{ width: '100%' }}></img>
            </div>

          </div>

          <div className="row mt-2 p-2">
            <p>{this.props.details[1].overview}</p>
          </div>

          {reviews}
          {usersAlsoLiked}

          <Modal isOpen={this.state.addModalShow} toggle={() => this.addModal()} centered={true}>
            <ModalBody>

              <label htmlFor="lists">Which list would you like to add to?</label>

              <select name="lists" id="userLists" onChange={() => this.setState({ listId: parseInt(event.target.value) })}>
                {this.props.lists.map(item => {
                  return <option key={item.listId} value={item.listId}> {item.name}</option>;
                })}
              </select>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => this.addModal()}>Cancel</Button>
              <Button color="primary" onClick={() => this.addMovieToCustomList()}>Add to List</Button>
            </ModalFooter>
          </Modal>

        </div>
      </>

    );
  }
}
