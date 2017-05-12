import React, { PropTypes } from "react";
import StarRatingComponent from "react-star-rating-component";
import FacebookProvider, { Comments } from "react-facebook";

class Reviews extends React.Component {
  constructor(props) {
    super(props);
    this.recordStarRating = this.recordStarRating.bind(this);
    this.state = {
      rating: 0,
      username: "",
      userID: "",
      comment: "",
      reviews: [],
      isAuth: false,
      isAdmin: false,
      status: "open",
      error: "",
      averageRating: 0
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getAllReviews = this.getAllReviews.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.closeReview = this.closeReview.bind(this);
    this.openReview = this.openReview.bind(this);
    this.getAveragerating = this.getAveragerating.bind(this);
  }

  componentWillMount() {
    this.getAllReviews();
    this.getCurrentUser();
    this.getAveragerating();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.reviews.length !== nextState.reviews.length) {
      return true;
    }
    return false;
  }

  getAveragerating() {
    Meteor.call("averageRating/review", this.props.product._id, (error, success) => {
      if (!error) {
        this.setState({ averageRating: success });
      }
    });
  }

  getAllReviews() {
    Meteor.call("find/review", this.props.product._id, (error, success) => {
      if (!error) {
        this.setState({ reviews: success });
      }
    });
  }

  getCurrentUser() {
    Meteor.call("current/user", Meteor.user()._id, (error, success) => {
      if (!error) {
        if (success.profile.addressBook) {
          this.setState({
            username: success.profile.addressBook[0]["fullName"],
            userID: success._id,
            isAuth: true
          });
        }
        (Meteor.user().username === "Admin") ? this.setState({ isAdmin: true }) : "";
      }
    });
  }

  closeReview() {
    Meteor.call("close/review", this.props.product._id, (error) => {
      if (!error) {
        this.getAllReviews();
      }
    });
  }

  openReview() {
    Meteor.call("open/review", this.props.product._id, (error) => {
      if (!error) {
        this.getAllReviews();
      }
    });
  }

  recordStarRating(nextValue) {
    this.setState({ rating: nextValue });
  }

  onSubmit(event) {
    event.preventDefault();
    const data = {
      productId: this.props.product._id,
      username: this.state.username,
      userID: this.state.userID,
      rating: this.state.rating,
      comment: this.state.comment
    };
    if (!data.comment) {
      return this.setState({ error: "Please, add a review" });
    }
    return Meteor.call("insert/review", data, (error) => {
      if (!error) {
        this.setState({
          rating: 0,
          comment: ""
        });
        this.getAllReviews();
        this.getAveragerating();
        this.setState({ error: "" });
      }
    });
  }

  deleteComment(commentID) {
    Meteor.call("delete/review", commentID, (error) => {
      if (!error) {
        this.getAllReviews();
        this.getAveragerating();
      }
    });
  }

  onChange(event) {
    this.setState({ comment: event.target.value });
  }

  render() {
    const { reviews, isAuth, isAdmin } = this.state;
    return (
      <div className="container">
        <div className="col-md-6 review-block">
          <div id="reviews" className="row">
          <h2>Average rating: { this.state.averageRating} </h2>
            {
              isAdmin
              ?
                this.props.product.reviewStatus === "close"
                ?
                  <button className="btn btn-default btn-info" onClick={this.openReview}>Open review for this Product</button>
                :
                  <button className="btn btn-default btn-info" onClick={this.closeReview}>Close review for this Product</button>
              : ""
            }
          {
            isAuth || isAdmin && this.props.product.reviewStatus !== "close"
            ?
              <div>
                <h3>Submit a review</h3>
                  <div id="comment-box">
                    <h5 className="label label-info">Comment:</h5>
                    <textarea
                      id="comment"
                      className="form-control"
                      placeholder="Write your experience with this product"
                      value={this.state.comment}
                      onChange={this.onChange}
                    />
                    <br />
                    <div>
                      <strong>Rating:</strong>
                        <StarRatingComponent
                          name="product-rating"
                          onStarClick={this.recordStarRating}
                          value={this.state.rating}
                        />
                    </div>
                    <p className="alert-error">
                      { this.state.error }
                    </p>
                    <button type="submit" id="send" onClick={this.onSubmit} className="btn btn-primary pull-left">Submit Review</button>
                  </div>
                </div>
            :
              <h4>Login or Update your profile to add reviews</h4>
          }
          </div>

          <div className="userreview row">
            <h3>Product Reviews</h3>
            {
              (reviews.length > 0) ?
                reviews.map((eachReview, index) => {
                  return (
                    <div className="well well-sm" key={index}>
                      {
                        `${eachReview.username}:
                        ${eachReview.comment}
                        `
                      }
                      <br />
                      <StarRatingComponent
                        name={index.toString()}
                        starCount={5}
                        value={eachReview.rating}
                        editing={false}
                      />
                      {
                        eachReview.userID === this.state.userID || isAdmin
                        ? <i className="fa fa-trash pull-right" onClick={() => this.deleteComment(eachReview._id)} />
                        : ""
                      }
                    </div>
                  );
                }) :
              " "
            }
          </div>
        </div>
        <div className="col-md-6 review-block">
          <FacebookProvider appId="405482403172045">
            <Comments href={window.location.href} />
          </FacebookProvider>
        </div>
      </div>
    );
  }
}

Reviews.propTypes = {
  products: PropTypes.object.isRequired
};

export default Reviews;
