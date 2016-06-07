import React, { PropTypes, Component } from 'react';
import BendUtils from '../common/bend-utils.js';
import _ from 'lodash';
import classes from 'classnames';
import { Router, Route, Link, Navigation, TransitionHook } from 'react-router';
import LoadingIndicator from '../components/LoadingIndicator.js'


// export default class Dashboard extends Component {
var Dashboard = React.createClass({

    /*
    constructor(){

        console.log("router:");
    },
    */

    mixins: [ Navigation],
    getInitialState() {
        return {
            pads: [],
            isInitializing: true,
            isCreating: false,
            isRemoving: false,
            renamingID: ''
        };
    },

    componentDidMount() {
        console.log("What?");
        this.fetchPads((err,pads) => {
            if(err) {
                console.log("Error while fetching pads!");
                console.log(err);
                this.setState({
                    isInitializing: false
                });
                return;
            }

            this.setState({
                pads: pads,
                // renamingID: _.first(pads)._id,
                isInitializing: false
            });
        });

        console.log(this.context);
    },

    fetchPads(callback) {
        var query = new Bend.Query();
        // query.fields(["_id","_bmd","name","description"]);
        query.ascending("_bmd.createdAt");
        BendUtils.wrapInCallback(Bend.DataStore.find("pad",query),callback);
    },

    editPad(id) {
        // console.log("edit: "+id);
        this.transitionTo('/pad/'+id);
    },

    renamePad(id) {
        var pad = _.find(this.state.pads,(pad) => pad._id === id);
        if(!pad) return;

        this.setState({
            renamingID: id,
            _padName: pad.name
        },() => {
            var input = React.findDOMNode(this.refs.nameInput);
            if(input) {
                console.log("We'have found input!");
                input.focus();
                input.select();
            }
        });
    },

    removePad(id) {
        this.setState({ isRemoving: true });
        BendUtils.wrapInCallback(Bend.DataStore.destroy("pad",id),(err,res) => {
            if(err) {
                console.log("Error while removing pad!");
                this.setState({ isRemoving: false });
                return;
            }

            console.log("Pad has been removed successfully!");
            console.log(res);
            this.setState({
                isRemoving: false,
                pads: _.without(this.state.pads,_.find(this.state.pads,(pad) => pad._id === id))
            });
        });
    },

    onInputBlur(e) {
        this.applyNewName();
    },

    applyNewName() {
        var pads = _.clone(this.state.pads,true);
        var pad = _.find(pads,(pad) => pad._id === this.state.renamingID);
        if(pad) {
            pad.name = React.findDOMNode(this.refs.nameInput).value;
            this.setState({
                pads: pads,
                renamingID: ''
            });

            BendUtils.wrapInCallback(Bend.DataStore.save("pad",pad),function(err,res){
                if(err) {
                    console.log("Error while renaming pad!");
                    console.log(err);
                    return;
                }

                console.log("Pad has been renamed successfully!");
                console.log(res);

            });
        }
    },

    onInputKeyDown(e) {
        switch(e.keyCode) {
            case 13: {
                this.applyNewName();
            } break;

            case 27: {
                this.setState({
                    renamingID: ''
                });
            } break;
        }
    },

    onInputChange(e) {
        this.setState({
            _padName: e.target.value
        });
    },

    renderPads() {
        const { pads, renamingID, _padName } = this.state;
        return _.map(pads,(pad) => {

            var isRenaming = pad._id === renamingID;
            var nonInputStyle = {
                display: isRenaming ? 'none' : ''
            };

            return (<li key={pad._id} className={classes(isRenaming ? 'is-renaming' : '')}>
                <div className="name" style={nonInputStyle}>{pad.name}</div>
                {!isRenaming && _.isEmpty(renamingID) ? (
                    <div className="controls">
                        <button onClick={this.editPad.bind(this,pad._id)}>Edit</button>
                        <button onClick={this.renamePad.bind(this,pad._id)}>Rename</button>
                        <button onClick={this.removePad.bind(this,pad._id)}>Delete</button>
                    </div>
                ) : null}
                {isRenaming ? <input ref="nameInput" type="text" value={_padName} onChange={this.onInputChange.bind(this)} onBlur={this.onInputBlur.bind(this)} onKeyDown={this.onInputKeyDown.bind(this)}/> : null}
            </li>)
        },this);
    },

    defaultPadObject() {
        return {
            name: "Default Name",
            blocks: []
        }
    },

    createNewPad() {
        this.setState({ isCreating: true });
        BendUtils.wrapInCallback(Bend.DataStore.save("pad",this.defaultPadObject()),(err,result) => {
            if(err) {
                console.log("Error while creating new pad!");
                console.log(err);
                this.setState({ isCreating: false });
                return;
            }

            console.log("Saved successfully!");
            console.log(result);

            this.setState({
                isCreating: false,
                pads: _.union(this.state.pads,[result])
            });

        });
    },

    renderInitializing() {
        return (
            <div>
                <div className="dashboard-background"/>
                <LoadingIndicator visible={true}/>
            </div>
        );
    },

    render() {
        const { pads, isInitializing, isCreating } = this.state;

        if(isInitializing) {
            return this.renderInitializing();
        }

        return (
            <div>
                <div className="dashboard-background"/>
                <div className="dashboard">
                    <ul className="pads-list">
                        <li className="footer">
                            <div className="logo"/>
                            <div className="create-new" onClick={this.createNewPad.bind(this)}><div className="icon-overlay"/>Create New</div>
                        </li>
                        {this.renderPads()}
                    </ul>
                </div>
            </div>
        );
    }
});

export default Dashboard;