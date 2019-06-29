import React from 'react';
import PropTypes from 'prop-types';

import {
    Container,
    Row,
    Col,
    Button
} from 'reactstrap';

import './ShareSheets.css';


export default class ShareSheets extends React.Component {

    static Protopytes = {
        sheets: PropTypes.array
    };
    constructor(props) {
        super(props);

        this.state = {
            sheets:[
                    {sheetID:0, song: '告白氣球0', composetime:'2019/05/31', username:'Jack0', template:[1,0,0]},
                    {sheetID:1, song: '告白氣球1', composetime:'2019/04/31', username:'Jack0', template:[0,1,0]},
                    {sheetID:2, song: '告白氣球2', composetime:'2019/03/31', username:'Jack0', template:[0,0,1]},
                    {sheetID:3, song: '告白氣球3', composetime:'2019/02/31', username:'Jack0', template:[1,0,0]},
                    {sheetID:4, song: '告白氣球4', composetime:'2019/01/31', username:'Jack0', template:[0,0,1]},
                    {sheetID:5, song: '告白氣球5', composetime:'2019/00/31', username:'Jack0', template:[0,1,0]},
                    {sheetID:6, song: '告白氣球6', composetime:'2019/09/31', username:'Jack0', template:[1,0,0]},
                    {sheetID:7, song: '告白氣球7', composetime:'2019/08/31', username:'Jack0', template:[0,1,0]},
                    {sheetID:8, song: '告白氣球8', composetime:'2019/07/31', username:'Jack0', template:[0,1,0]},
                    {sheetID:9, song: '告白氣球9', composetime:'2019/06/31', username:'Jack0', template:[0,0,1]},
                    {sheetID:10, song: '告白氣球10', composetime:'2019/05/31', username:'Jack0', template:[1,0,0]},
                    {sheetID:11, song: '告白氣球11', composetime:'2019/04/31', username:'Jack0', template:[0,0,1]},
                    {sheetID:12, song: '告白氣球12', composetime:'2019/03/31', username:'Jack0', template:[0,0,1]},
            ]
        }

        this.handlePrevStage = this.handlePrevStage.bind(this);
        this.handleNextStage = this.handleNextStage.bind(this);
    }
    
    componentDidUpdate(prevProps) {

    }

    render() {
        return (
            <div>
                <div className={`today choose title`}>
                    <p>{(this.props.stage == 'ShareSheets') ? ' 共享歌詞' : ''}</p>
                </div>
            <Container className='form chord-editor'  style={{minHeight:"500px"}}>
                    <Row>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[0].template[0]?'1':this.state.sheets[0].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[0].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[0].username}</p>
                        </Col>
                        <Col xs='6' sm='4'  lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[1].template[0]?'1':this.state.sheets[1].template[1]?'2':'3')+'.jpg'} alt="" className="responsive"  style={{padding:"15px"}}/>
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[1].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[1].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[2].template[0]?'1':this.state.sheets[2].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[2].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[2].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[3].template[0]?'1':this.state.sheets[3].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[3].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[3].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[4].template[0]?'1':this.state.sheets[4].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}}/>
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[4].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[4].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[5].template[0]?'1':this.state.sheets[5].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[5].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[5].username}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[7].template[0]?'1':this.state.sheets[7].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[7].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[7].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[8].template[0]?'1':this.state.sheets[8].template[1]?'2':'3')+'.jpg'} alt="" className="responsive"  style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[8].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[8].username}</p>
                        </Col>
                        <Col xs='6' sm='4'lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[9].template[0]?'1':this.state.sheets[9].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[9].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[9].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[10].template[0]?'1':this.state.sheets[10].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}}/>
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[10].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[10].username}</p>
                        </Col>
                        <Col xs='6' sm='4'  lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[11].template[0]?'1':this.state.sheets[11].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}} />
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[11].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[11].username}</p>
                        </Col>
                        <Col xs='6' sm='4' lg='2'>
                            <img src={ 'images/templates/template'+(this.state.sheets[12].template[0]?'1':this.state.sheets[12].template[1]?'2':'3')+'.jpg'} alt="" className="responsive" style={{padding:"15px"}}/>
                            <p style={{textAlign:'center', margin:'0px'}}>{this.state.sheets[12].song}</p>
                            <p style={{textAlign:'center'}}>{this.state.sheets[12].username}</p>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'center',   margin: 'auto', fontFamily: 'Noto Sans TC'}}>
                        <Button color="secondary" size="lg" onClick={this.handlePrevStage} >上一步</Button>
                    </div>
            </Container>
            </div>
         )
    }

    handlePrevStage() {

    }

    handleNextStage() {
        
    }
}