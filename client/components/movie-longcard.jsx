import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

class MovieLongCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addModalShow: false, dropdownOpen: false, listId: null };
    this.addModal = this.addModal.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setState({ listId: this.props.lists[0].listId });
  }

  handleClick(event) {
    this.props.getMovieDetails(this.props.id);
    window.scrollTo(0, 0);
  }

  addModal() {
    this.setState((prevState, props) => { return { addModalShow: !prevState.addModalShow }; });
  }

  add() {
    this.props.addItemToList(this.state.listId, this.props.fullInfo);
    this.addModal();
  }

  render() {
    let posterURL;
    if (this.props.poster_path !== null) {
      posterURL = `https://image.tmdb.org/t/p/w500${this.props.poster_path}`;
    } else {
      posterURL = '../images/image_placeholder.png';
    }
    let year;
    if (this.props.fullInfo.release_date) {
      year = this.props.fullInfo.release_date.substr(0, 4);
    } else {
      year = 'Not Available';
    }
    return (<>
      <div >
        <div className="row m-2 border white">
          <div className="col m-2 ml-0">
            <img src={posterURL} className="card-img" styles=""></img>
          </div>
          <div className="col mr-4 mt-2">
            <h1 className="card-title">{this.props.fullInfo.original_title}</h1>
            <h4 className="card-subtitle mb-2 text-muted">Popularity:{this.props.fullInfo.popularity}</h4>
            <h4 className="card-subtitle mb-2 text-muted">Rating:{this.props.fullInfo.vote_average}</h4>
            <h4 className="card-subtitle mb-2 text-muted">Release Year:{year}</h4>
            <p className="card-text">{this.props.fullInfo.overview.substring(0, 150) + '...'}</p>
            <div className="form-row flex-nowrap">
              <Button outline={true} color="info" className="dynamicButton m-2" onClick={() => this.handleClick(event)}>View Details</Button>
              <Button outline={true} color="success" onClick={() => this.addModal()} className="dynamicButton m-2">Add To list</Button>
            </div>
            <div>

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
                  <Button color="primary" onClick={() => { this.add(); }}>Add to List</Button>{' '}
                </ModalFooter>
              </Modal>

            </div>
            {/* <button className="btn btn-secondary" onClick={() => { this.props.addItemToList(1, this.props.fullInfo); }}>
              Add item to list
            </button> */}
          </div>
        </div>

      </div>

    </>);
  }
}

export default MovieLongCard;
