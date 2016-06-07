import React, { Component, PropTypes } from 'react';
import classes from 'classnames'


class ViewModeToggle extends Component {
    static propTypes = {
        viewMode: PropTypes.string
    };

    onItemClick(itemName) {
        if(this.props.onChange) {
            this.props.onChange(itemName);
        }
    }

    render() {
        const { viewMode } = this.props;
        return (
            <div className="view-mode-toggle">
                <div className={classes('item',viewMode === 'preview' ? 'active' : '')} onClick={this.onItemClick.bind(this,'preview')}>PREVIEW</div>
                <div className={classes('item',viewMode === 'editor' ? 'active' : '')} onClick={this.onItemClick.bind(this,'editor')}>EDITOR</div>
            </div>
        );
    }
}

export default class NavigationBar extends Component {
    onViewModeChange(newViewMode) {
        if(this.props.onViewModeChange) {
            this.props.onViewModeChange(newViewMode);
        }
    }

    render() {
        const { viewMode, name } = this.props;
        return (
            <div>
                <div className="navigation-bar">
                    <a href="/#">
                        <div className="page-title">{name}</div>
                    </a>
                    <ViewModeToggle viewMode={viewMode} onChange={this.onViewModeChange.bind(this)}/>
                </div>
            </div>
        );
    }
}