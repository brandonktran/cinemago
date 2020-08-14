import React from 'react';
import { Card, CardText, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import StarRatingComponent from 'react-star-rating-component';

class ViewReviewsCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = { modalShow: false, text: this.props.item.content, rating: this.props.item.rating };
    this.toggleModal = this.toggleModal.bind(this);
    this.handleText = this.handleText.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggleModal() {
    this.setState((prevState, props) => { return { modalShow: !prevState.modalShow }; });
  }

  onStarClick(nextValue, prevValue, name) {
    this.setState({ rating: nextValue });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.toggleModal();
    this.props.editReview(this.props.item.reviewId, this.state.text, this.state.rating);
    this.setState({ text: this.state.text });
  }

  handleText(event) {
    this.setState({ text: event.target.value });
  }

  render() {
    return (
      <>
        <div className="row m-2 border container white">
          <div className="col m-2">
            <h5>{this.props.item.title}</h5>
            <p style={{ alignItems: 'baseline-position' }}>
              <StarRatingComponent
                name="userRating"
                starCount={5}
                value={this.state.rating} />
            </p>
            <p>{this.props.item.content}</p>
          </div>
          <div>
            <Button outline={true} color="secondary" className="m-2" onClick={() => this.toggleModal()}>Edit Review</Button>
            <button className='btn btn-outline-danger m-2' onClick={() => this.props.deleteReview(this.props.item.reviewId)}>Delete Review</button>
          </div>

        </div >

        <Modal isOpen={this.state.modalShow} toggle={() => this.toggleModal()} centered={true}>
          <ModalHeader toggle={() => this.toggleModal()}>update your review</ModalHeader>
          <ModalBody>
            <form className="container">
              <StarRatingComponent
                name="rate1"
                starCount={5}
                value={this.state.rating}
                style={{ justifyContent: 'center' }}
                onStarClick={this.onStarClick.bind(this)}
              />
              <input onChange={this.handleText} value={this.state.text} className="form-control" placeholder="Name of new list" id="listName"></input>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => this.toggleModal()}>Cancel</Button>
            <Button color="primary" onClick={() => this.handleSubmit(event)}>Update Review</Button>{' '}
          </ModalFooter>
        </Modal>
      </>

    );

  }
}
export default ViewReviewsCard;
