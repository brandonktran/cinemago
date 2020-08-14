import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import MovieSlide from './movie-slide';

export default class ListCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { deleteModalShow: false, searchModalShow: false, listMovies: [] };
    this.deleteModal = this.deleteModal.bind(this);
    this.searchModal = this.searchModal.bind(this);
  }

  componentDidMount() {
    const fetchURL = '/api/listItems/' + this.props.item.listId;
    fetch(fetchURL)
      .then(result => result.json())
      .then(data => this.setState({ listMovies: data }))
      .catch(err => console.error(err));
  }

  deleteModal() {
    this.setState((prevState, props) => { return { deleteModalShow: !prevState.deleteModalShow }; });
  }

  searchModal() {
    this.setState((prevState, props) => { return { searchModalShow: !prevState.searchModalShow }; });
  }

  render() {
    if (this.props.item.type === 'custom') {
      return (<>
        <div className="w-100 p-2 border white">
          <h3 className="mt-2 ml-2">{this.props.item.name}</h3>
          <div>
            <div className="form-row flex-nowrap">
              <Button outline={true} color="secondary" onClick={() => this.searchModal()} className="listButton m-2">Add To list</Button>
              <button className="listButton btn btn-outline-secondary m-2" onClick={() => { this.props.getItemsInList(this.props.item.listId); }}>View List Content</button>
              <Button outline={true} color="danger" className="listButton m-2" onClick={() => this.deleteModal()}>Delete List</Button>
            </div>
            <MovieSlide getMovieDetails={this.props.getMovieDetails} movies={this.state.listMovies} />
            <Modal isOpen={this.state.searchModalShow} toggle={() => this.searchModal()} centered={true}>
              <ModalBody>
                Leave this page and search for movies?
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={() => this.searchModal()}>Cancel</Button>
                <Button color="primary" onClick={() => { this.props.changeView('search'); }}>Go to Search Page </Button>{' '}
              </ModalFooter>
            </Modal>
          </div>
          <div>
            <Modal isOpen={this.state.deleteModalShow} toggle={() => this.deleteModal()} centered={true}>
              <ModalBody>
                Are you sure you want to delete this list?
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" className="m-2" onClick={() => this.deleteModal()}>Cancel</Button>
                <Button color="danger" onClick={() => this.props.deleteList(this.props.item.listId)}>Delete List </Button>{' '}
              </ModalFooter>
            </Modal>
          </div>
        </div>
      </>);
    } else {
      return (<>

        <div className="w-100 p-2 border white">
          <h3 className="mt-2 ml-2">{this.props.item.name}</h3>
          <div>
            <div className="form-row flex-nowrap">
              <Button outline={true} color="secondary" onClick={() => this.searchModal()} className="listButton m-2">Add To list</Button>
              <button className="listButton btn btn-outline-secondary m-2" onClick={() => { this.props.getItemsInList(this.props.item.listId, this.props.item.name); }}>View List Content</button>
            </div>
            <MovieSlide getMovieDetails={this.props.getMovieDetails} movies={this.state.listMovies} />
            <Modal isOpen={this.state.searchModalShow} toggle={() => this.searchModal()} centered={true}>
              <ModalBody>
                Leave this page and search for movies?
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={() => this.searchModal()}>Cancel</Button>
                <Button color="primary" onClick={() => { this.props.changeView('search'); }}>Go to Search Page </Button>{' '}
              </ModalFooter>
            </Modal>
          </div>
        </div>

      </>);
    }
  }
}
