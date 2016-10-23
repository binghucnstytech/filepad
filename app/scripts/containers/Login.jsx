import React from 'react';
import BendUtils from '../common/bend-utils.js';
import { Grid, Row, Col, Panel, Button, FormControl } from 'react-bootstrap';

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            error:false,
        }
        this.formInstance = null;
    }

    componentDidMount() {
        this.formInstance = $('form#loginForm').parsley().on('field:validated', ()=>{
            this.setState({ error: false })
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        /*var isValid = this.formInstance.isValid();
        if(isValid) {

        }*/
        const username = this.refs.username.value;
        const pass = this.refs.password.value;

        BendUtils.wrapInCallback(Bend.User.login({
            username: username,
            password: pass,
        }), (err, res) => {
            console.log(err, res);
            if (err) {
                return this.setState({ error: true});
            }

            this.context.router.push('/');
        });
    }

    goSignupPage(e) {
        e.preventDefault();
        this.context.router.push('/signup');
    }

    render() {
        return (
            <div className="login-panel">
                { /* START panel */ }
                <div className="panel panel-dark panel-flat">
                    <div className="panel-heading text-center">
                        <span className="login-title">Filepad</span>
                    </div>
                    <div className="panel-body">
                        <form id="loginForm" method="post" data-parsley-validate="" onSubmit={this.handleSubmit.bind(this)}>
                            <p className="text-danger text-center" style={{display:this.state.error?'block':'none'}}>
                                {(() => {
                                    return (
                                        <span>
                                            Username or password is incorrect. please try again.
                                        </span>
                                    )
                                })()}

                            </p>
                            <div className="form-group">
                                <input type="text" ref="username" placeholder="Username" autoComplete="off" required="required" className="form-control" data-parsley-error-message="Username is required"/>
                            </div>
                            <div className="form-group">
                                <input type="password" ref="password" placeholder="Password" required="required" className="form-control" data-parsley-error-message="Password is required"/>
                            </div>
                            <button type="submit" className="btn btn-block btn-primary mt-lg">Login</button>
                            <button className="btn btn-block btn-primary mt-lg" onClick={this.goSignupPage.bind(this)}>Sign up</button>
                        </form>
                    </div>
                </div>
                { /* END panel */ }
            </div>
            );
    }

}

Login.contextTypes = {
    router: React.PropTypes.object.isRequired
}

export default Login;
