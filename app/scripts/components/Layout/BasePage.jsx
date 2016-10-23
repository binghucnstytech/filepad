import React from 'react';

class BasePage extends React.Component {

    render() {
        return (
            <div className="bg-white">
                {this.props.children}
            </div>
        );
    }

}

export default BasePage;
