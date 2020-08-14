import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

export default class MessageCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = { removeModalShow: false };
    this.removeModal = this.removeModal.bind(this);
  }

  removeModal() {
    this.setState((prevState, props) => { return { removeModalShow: !prevState.removeModalShow }; });
  }

  remove() {
    this.props.deleteMessage(this.props.id);
    this.removeModal();
  }

  render() {
    console.log(this.props.id);
    return (<div className="border p-3 m-2 white">

      <h5>From: {this.props.item.name}</h5>
      <p>Content: {this.props.item.content}</p>
      <Button color="outline-danger" onClick={() => this.removeModal()} className="m-2">Delete</Button>
      <Modal isOpen={this.state.removeModalShow} toggle={() => this.removeModal()} centered={true}>
        <ModalBody>
          Are you sure you want to delete this message?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => this.removeModal()}>Cancel</Button>
          <Button color="outline-danger" onClick={() => { this.remove(); }}>Delete Message</Button>{' '}
        </ModalFooter>
      </Modal>
    </div>);
  }
}
