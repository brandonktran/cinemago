import React from 'react';
import ViewReviewsCard from './view-reviews-card';
import { CSSTransitionGroup } from 'react-transition-group';

class ViewReviewsPage extends React.Component {

  render() {
    return (<>
      <div className="pl-4">
        <button className="btn btn-outline-danger" onClick={() => this.props.backToProfile()}>Go Back</button>
      </div>
      <div className="container pt-2 pb-5">
        <h1 className="pl-3 pt-2">My Reviews</h1>
        <div className="row container mt-1">
          <CSSTransitionGroup
            key={'my-reviews'}
            transitionName="example"
            transitionAppear={false}
            transitionAppearTimeout={500}
            transitionEnter={true}
            transitionLeave={true}
            className="w-100">
            {this.props.reviews.map((item, index) => {
              return (
                <ViewReviewsCard
                  key={index}
                  deleteReview={this.props.deleteReview}
                  editReview={this.props.editReview}
                  changeView={this.props.changeView}
                  item={item} />);
            })}
          </CSSTransitionGroup>

        </div>

      </div>
    </>);
  }

}

export default ViewReviewsPage;
