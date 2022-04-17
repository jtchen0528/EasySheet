import React from 'react';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';

import Intro from 'components/Intro.jsx';

import './Main.css';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unit: 'metric',
        };

        this.handleUnitChange = this.handleUnitChange.bind(this);
        this.handleLogo = this.handleLogo.bind(this);
    }

    render() {
        return (
            <Router>
                <div className={`main bg-faded ${this.state.group}`}>
                    <div className='container'>
                        <img src="images/logo.png" className={`logo`} onClick={this.handleLogo}/>
                    </div>
                    <Route exact path="/" render={() => (
                        <Intro unit={this.state.unit} onUnitChange={this.handleUnitChange} />
                    )}/>
                </div>
            </Router>
        );
    }

    handleUnitChange(unit) {
        this.setState({
            unit: unit
        });
    }
    
    handleLogo(){
        window.location.href = 'https://jtchen0528.github.io/EasySheet/';//`www.facebook.com`;
    }
}

