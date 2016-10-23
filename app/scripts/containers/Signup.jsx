import React from 'react';
import BendUtils from '../common/bend-utils.js';
import { Grid, Row, Col, Panel, Button, FormControl } from 'react-bootstrap';

class Signup extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            error:false,
            success:false,
            msg:""
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
        const confirmPass = this.refs.passwordConfirm.value;
        const email = this.refs.email.value;
        if(pass != confirmPass) {
            alert("Password and confirm password is dismatched.");
            return;
        }

        var user = {
            username:username,
            password:pass,
            email:email
        }

        this.setState({
            error: false,
        });

        console.log("here");
        BendUtils.wrapInCallback(Bend.User.signup(user), (err, res) => {
            console.log(err, res);
            if (err) {
                var msg;
                if(err.name.indexOf("This username is already taken") != -1) {
                    msg = "This username is already taken. Please retry your request with a different username";
                    this.setState({
                        error: true,
                        msg:msg
                    });
                } else {
                    this.setState({
                        success: true,
                        msg:"Your account has created successfully. Please login now."
                    })
                }
            } else {
                this.setState({
                    success: true,
                    msg:"Your account has created successfully. Please login now."
                })
            }
        });
    }

    goLoginPage(e) {
        e.preventDefault();
        this.context.router.push('/login');
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
                                            {this.state.msg}
                                        </span>
                                    )
                                })()}

                            </p>
                            <p className="text-center" style={{display:this.state.success?'block':'none'}}>
                                {(() => {
                                    return (
                                        <span>
                                            {this.state.msg}
                                        </span>
                                    )
                                })()}

                            </p>
                            <div style={{display:this.state.success?'none':'block'}}>
                                <div className="form-group">
                                    <input type="text" ref="username" placeholder="Username" autoComplete="off" required="required" className="form-control" data-parsley-error-message="Username is required"/>
                                </div>
                                <div className="form-group">
                                    <input type="email" ref="email" placeholder="Email" autoComplete="off" required="required" className="form-control" data-parsley-error-message="Email is required"/>
                                </div>
                                <div className="form-group">
                                    <input type="password" ref="password" placeholder="Password" required="required" className="form-control" data-parsley-error-message="Password is required"/>
                                </div>
                                <div className="form-group">
                                    <input type="password" ref="passwordConfirm" placeholder="Password confirm" required="required" className="form-control"/>
                                </div>
                                <button type="submit" className="btn btn-block btn-primary mt-lg">Signup</button>
                            </div>
                            <button className="btn btn-block btn-primary mt-lg" onClick={this.goLoginPage.bind(this)} style={{marginTop:'5px'}}>Login</button>
                        </form>
                    </div>
                </div>
                { /* END panel */ }
            </div>
            );
    }

}

Signup.contextTypes = {
    router: React.PropTypes.object.isRequired
}

export default Signup;
