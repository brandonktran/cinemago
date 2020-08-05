import React from 'react';

export default class ListCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {

  }

  render() {
    return (<>
      <div className="col-11 m-2 border">
        <h3>{this.props.item.name}</h3>
        <button className="m-2">
          <svg width="3em" height="3em" viewBox="0 0 16 16" className="bi bi-file-earmark-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M2 3a2 2 0 0 1 2-2h5.293a1 1 0 0 1 .707.293L13.707 5a1 1 0 0 1 .293.707V13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3zm7 2V2l4 4h-3a1 1 0 0 1-1-1zm-.5 2a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V11a.5.5 0 0 0 1 0V9.5H10a.5.5 0 0 0 0-1H8.5V7z" />
          </svg>
        </button>
      </div>

    </>);
  }
}
