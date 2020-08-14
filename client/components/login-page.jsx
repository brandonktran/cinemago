import React from 'react';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const property = event.target.name;
    this.setState({
      [property]: event.target.value
    });
  }

  handleSubmit(event, info) {
    event.preventDefault();
    this.props.logIn(this.state.email, this.state.password);
    this.setState({
      email: '',
      password: ''
    });
  }

  render() {

    return (<>

      <div className="container centered">
        <div className="center2 mb-4">
          <h1 className="loginTitle" >MOVIFY</h1>
          <form className="form-login" onSubmit={this.handleSubmit}>
            <input
              type="text"
              placeholder="email"
              value={this.state.email}
              onChange={this.handleChange}
              className="border-0 m-1"
              name="email"
            />
            <input
              type="password"
              placeholder="password"
              value={this.state.password}
              onChange={this.handleChange}
              className="border-0 m-1"
              name="password"
            />
            <input className="btn btn-secondary m-1" type="submit" value="Sign In"></input>
          </form>
          <div className="center2">
            <button className="btn btn-secondary m-1" onClick={() => this.props.changeView('signUp')}>Create Account</button>
          </div>
        </div>
      </div>
    </>);
  }
}
