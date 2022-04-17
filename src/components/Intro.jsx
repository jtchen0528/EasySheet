import React from 'react';
import PropTypes from 'prop-types';
import {
    BrowserRouter as Router,
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
    NavLink,
    Button,
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    Alert
} from 'reactstrap';

import ChordEditor from 'components/ChordEditor.jsx';
import ShareSheets from 'components/ShareSheets.jsx';

import { getLyrics, cancelLyrics, getSinger, getLyricsfromID, requestLyrics as requestLyricsFromAPI, o_requestLyrics as o_requestLyricsFromAPI } from 'api/lyrics-api.js';
import {zhcnTozhtw} from "api/translate-api.js"

import './intro.css';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

export default class Today extends React.Component {
    static PropTypes = {
        masking: PropTypes.bool,
        unit: PropTypes.string,
        stage: PropTypes.string,
        song: PropTypes.string,
        singer: PropTypes.string,
        color: PropTypes.string,
        font: PropTypes.string,
        template: PropTypes.array,
        data: PropTypes.array,
        singercn: PropTypes.string,
        songID: PropTypes.string,
        lyrics: PropTypes.string,
        sheet: PropTypes.object
    };

    static getInitWeatherState() {
        return {
            city: 'na',
            code: -1,
            group: 'na',
            description: 'N/A',
            temp: NaN
        };
    }

    constructor(props) {
        super(props);

        this.inputEl = null;

        this.state = {
            loading: false,
            showErr: false,
            masking: true,
            stage: 'begin',
            template: [1, 0, 0],
            data: [],
            lyrics: '請輸入歌詞',
            color: '#FFFAD9',
            font: '正黑體',
            singer: '',
            song: '',
        };

        this.handleFormQuery = this.handleFormQuery.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.onFormSubmit=this.onFormSubmit.bind(this);
        this.handleFontChange=this.handleFontChange.bind(this);
        this.handleColorChange=this.handleColorChange.bind(this);
        this.handleSingerChange=this.handleSingerChange.bind(this);
        this.handleSongChange=this.handleSongChange.bind(this);
        this.handletemplate0Change=this.handletemplate0Change.bind(this);
        this.handletemplate1Change=this.handletemplate1Change.bind(this);
        this.handletemplate2Change=this.handletemplate2Change.bind(this);
        this.handleLyricsChange = this.handleLyricsChange.bind(this);
        this.onChordEditorStageChange = this.onChordEditorStageChange.bind(this);
        this.onSheetChange = this.onSheetChange.bind(this);

        this.handleShareSheets = this.handleShareSheets.bind(this);

        this.handleChord=this.handleChord.bind(this);
        this.handleChordback=this.handleChordback.bind(this);
        this.searchID=this.searchID.bind(this);

        this.handleSharePreview=this.handleSharePreview.bind(this);
        this.handleInstruction=this.handleInstruction.bind(this);

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div>
                <div className={`today welcome ${this.state.stage}`}>
                    <div className={`today welcometext`}>
                        <p>Welcome to EasySheet！<br/> A simple editor for guitar chords and lyrics.</p>
                    </div>
                    <div className={`today startbutton`}>
                        <Button color="success" size="lg" onClick={this.handleStart} > Start chording! </Button>
                        <br/>
                    </div>
                </div>
                <div className={`today template ${this.state.stage}`}>
                    <div className={`today choose title`}>
                        <p>Step 1: Title, Singer, Sheet template, Color, and Font.</p>
                    </div>
                    <Container className="form">
                        <Form onSubmit={this.onFormSubmit}>
                        <Row  className={`today choose context`} form>
                            <Col xs="12" lg="6">
                                <p className="today choose center">Select a template</p>
                                <Row>
                                    <Col xs ="4">
                                        <img src="images/templates/template1.jpg" alt="" className="responsive"  onClick={this.handletemplate0Change}/>
                                    </Col>
                                    <Col xs ="4">
                                        <img src="images/templates/template2.jpg" alt="" className="responsive" onClick={this.handletemplate1Change}/>
                                    </Col>
                                    <Col xs ="4">
                                        <img src="images/templates/template3.jpg" alt="" className="responsive" onClick={this.handletemplate2Change}/>
                                    </Col>
                                </Row>
                                <Row form className="tempbot">
                                    <Col sm="4" className={`today choose center`}>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" name="template" className={`today choose cursor`} getRef={el => {this.inputEl = el}} value={this.state.template[0]} onChange={this.handletemplate0Change} checked={this.state.template[0]}/>
                                            </Label>
                                        </FormGroup>       
                                    </Col> 
                                    <Col sm="4" className={`today choose center`}>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" name="template" className={`today choose cursor`} getRef={el => {this.inputEl = el}} value={this.state.template[1]} onChange={this.handletemplate1Change} checked={this.state.template[1]}/>
                                            </Label>
                                        </FormGroup>       
                                    </Col> 
                                    <Col sm="4" className={`today choose center`}>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" name="template" className={`today choose cursor`} getRef={el => {this.inputEl = el}} value={this.state.template[2]} onChange={this.handletemplate2Change} checked={this.state.template[2]}/>
                                            </Label>
                                        </FormGroup>       
                                    </Col> 
                                </Row>
                            </Col>
                            <Col xs="12"  lg="6" >
                                <div className="rightchoose">
                                <p className="today choose center">Song Info</p>
                                <FormGroup row>
                                  <Label for="songname" sm={3} className={`today choose center`}>Title</Label>
                                        <Col sm={9} style={{'align-self': 'center'}}>
                                            <Input  name="songname" id="songname" placeholder="Title of the song"   getRef={el => {this.inputEl = el}} value={this.state.song} onChange={this.handleSongChange}/>
                                        </Col>
                                </FormGroup>
                                <FormGroup row>
                                  <Label for="singer" sm={3} className={`today choose center`}>Composer</Label>
                                        <Col sm={9} style={{'align-self': 'center'}}>
                                            <Input  name="singer" id="singer" placeholder="Singer or band"   getRef={el => {this.inputEl = el}} value={this.state.singer} onChange={this.handleSingerChange} />
                                        </Col>
                                </FormGroup>
                                <FormGroup row>
                                  <Label for="color" sm={3} className={`today choose center`}>Color</Label>
                                        <Col sm={9} style={{'align-self': 'center'}}>
                                            <Input  type="color" name="color" id="singer" placeholder="Color of the music sheet"  getRef={el => {this.inputEl = el}} value={this.state.color} onChange={this.handleColorChange} className={`today choose cursor`}/>
                                        </Col>
                                </FormGroup>
                                <FormGroup row>
                                  <Label for="font" sm={3} className={`today choose center`}>Font</Label>
                                        <Col sm={9} style={{'align-self': 'center'}}>
                                            <Input  type="select" name="font" id="font" defaultValue="正黑體"  getRef={el => {this.inputEl = el}} value={this.state.font} onChange={this.handleFontChange} className={`today choose cursor`}>
                                                <option>標楷體</option>
                                                <option>新細明體</option>
                                                <option>正黑體</option>
                                            </Input>
                                        </Col>
                                </FormGroup>
                                </div>
                            </Col>
                        </Row>
                        </Form>
                        <Row >
                            <Col xs="5" lg="3" className={`today choose center`}>
                                <Button color="secondary" size="lg" onClick={this.handleStart}>Back</Button>
                            </Col>
                            <Col xs="2" lg="6">
                                {this.state.loading && <Alert color='warning' className='loading'>Loading...</Alert>}
                            </Col>
                            <Col xs="5" lg="3" className={`today choose center`}>
                                <Button color="success" size="lg" onClick={this.onFormSubmit}>Next</Button>
                            </Col>
                        </Row>
                        <Row style={{'justify-content': 'center'}}>
                            {this.state.showErr && <Alert color='danger' className='warning'>Please put in title and composer.</Alert>}
                        </Row>
                    </Container>
                </div>
                <div className={`today edit ${this.state.stage}`}>
                    <div className={`today choose title`}>
                        <p>Edit the lyrics typesettings</p>
                    </div>
                    <Container className="form">
                    <Row>
                        <Col xs="3">
                        </Col>
                        <Col xs="6">
                            <div className={`today lyricsbox center`} >
                                <textarea name="lyrics2" id="" className={`today respons lyrics ${(this.state.font === '標楷體') ? 'font1' : (this.state.font==='新細明體') ? 'font2' : 'font3'}`} id="textbox" placeholder="請輸入歌詞"></textarea>
                            </div>
                        </Col>
                        <Col xs="3">
                        </Col>
                    </Row>
                    <Row>
                        <Col  xs="5" lg="3" className={`today choose center`}>
                            <Button color="secondary" size="lg" onClick={this.handleChordback}>Back</Button>
                        </Col>
                        <Col xs="2" lg="6">
                        </Col>
                        <Col  xs="5" lg="3" className={`today startbutton`}>
                            <Button color="success" size="lg" onClick={this.handleChord}>Start Chording!</Button>
                        </Col>
                    </Row>
                    </Container>
                </div>

                <div className={`${(this.state.stage === 'Instruction1') ? '' : 'd-none'}`}>
                    <div className={`today choose title`}>
                        <p>Tutorial: Lyrics typesettings</p>
                    </div>
                    <Container style={{width:'80%'}}>
                        <div>
                        <Row>
                            <Col xs='4'>
                                <img src="images/tutorial/1.gif" alt="" className="responsive"/>
                            </Col>
                            <Col xs='4'>
                                <img src="images/tutorial/2.gif" alt="" className="responsive"/>
                            </Col>
                            <Col xs='4'>
                                <img src="images/tutorial/3.gif" alt="" className="responsive"/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Press "Enter" at the end of the line will open a new lyric box for the line below. <br/> Each lyric box has a chords row on top.</p>
                            </Col>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Put lines that has the same melody/chord in the same block in order to save space.</p>
                            </Col>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Remove the repeated lines to make the music sheet succinct, simple type *2 or *3.</p>
                            </Col>
                        </Row>
                        </div>
                    </Container>
                    <div style={{textAlign:'center', paddingTop:'20px'}}>
                            <Button color="success" size="lg" onClick={this.handleInstruction} > Start Editing </Button>
                    </div>
                </div>

                <div className={`${(this.state.stage === 'Instruction2') ? '' : 'd-none'}`}>
                    <div className={`today choose title`}>
                        <p>Tutorial: Compose chords.</p>
                    </div>
                    <Container style={{width:'80%'}}>
                        <Row>
                            <Col xs='1'></Col>
                            <Col xs='4'>
                                <Row>
                                    <Col>
                                        <img src="images/tutorial/4.gif" alt="" className="responsive" style={{maxHeight:'120px'}}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p style={{textAlign: 'center', paddingTop:'10px'}}>Hover on the chord row, press "＋" to add a chord.</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <img src="images/tutorial/5.gif" alt="" className="responsive" style={{maxHeight:'120px'}}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p style={{textAlign: 'center', paddingTop:'10px'}}>Click copy, paste and delete bottoms on the rows to quickly edit the chords.</p>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs='2'></Col>
                            <Col xs='4'>
                                <Row>
                                    <img src="images/tutorial/6.gif" alt="" className="responsive" style={{maxHeight:'250px'}}/>
                                </Row>
                                <Row>
                                    <p style={{textAlign: 'center', paddingTop:'10px'}}>Click "Add" from the list to add your own chords and fingering patterns.</p>
                                </Row>
                            </Col>
                            <Col xs='1'></Col>
                        </Row>
                    </Container>
                    <div style={{textAlign:'center', paddingTop:'20px'}}>
                            <Button color="success" size="lg" onClick={this.handleInstruction} > Back </Button>
                    </div>
                </div>
                
                <div className={`${(this.state.stage === 'Instruction3') ? '' : 'd-none'}`}>
                    <div className={`today choose title`}>
                        <p>Tutorial: Add instructions on the sheet</p>
                    </div>
                    <Container style={{width:'80%'}}>
                        <Row >
                            <Col xs='4'>
                                <img src="images/tutorial/7.gif" alt="" className="responsive"/>
                            </Col>
                            <Col xs='4'>
                                <img src="images/tutorial/8.gif" alt="" className="responsive"/>
                            </Col>
                            <Col xs='4'>
                                <img src="images/tutorial/1.gif" alt="" className="responsive"/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Click in the arrows to modify the rythms.</p>
                            </Col>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Add fingering patterns, instruction in text, or any images in the empty blocks.</p>
                            </Col>
                            <Col xs='4'>
                                <p style={{textAlign: 'center', paddingTop:'10px'}}>Click on the cross to delete the content in the block.</p>
                            </Col>
                        </Row>
                    </Container>
                    <div style={{textAlign:'center', paddingTop:'20px'}}>
                            <Button color="success" size="lg" onClick={this.handleInstruction} > Back </Button>
                    </div>
                </div>

                <div className={`${(this.state.stage !== 'begin' && this.state.stage !== 'started' && this.state.stage !== 'lyrics'&& this.state.stage !== 'ShareSheets'&&this.state.stage !== 'print'&&this.state.stage !== 'SharePreview'&&this.state.stage!=='Instruction1'&&this.state.stage!=='Instruction2'&&this.state.stage!=='Instruction3') ? '' : 'd-none'}`}>
                    <ChordEditor {...this.state} lyricsItem={[this.state.lyrics]} onChordEditorStageChange={this.onChordEditorStageChange} onSheetChange={this.onSheetChange}></ChordEditor>
                 </div>
                 <div className={`${(this.state.stage === 'ShareSheets') ? '' : 'd-none'}`}>
                    <ShareSheets {...this.state}></ShareSheets>
                 </div>
                 <div className={`${(this.state.stage === 'print') ? '' : 'd-none'}`}>
                    <div className={`today welcometext`}>
                        <p>Thank you for using EasySheet!<br/>Share your music sheet to your friends!</p>
                    </div>
                    <div className={`today startbutton`}>
                        <Button color="success" size="lg" className='mx-2' onClick={this.handleStart} > Back to Homepage </Button>
                        {/* <Button color="success" size="lg" className='mx-2' onClick={this.handleSharePreview} style={{display:''}} > SharePreview </Button> */}
                        {/* <Button color="success" size="lg" className='mx-2' onClick={this.handleShareSheets} style={{display:''}} > ShareSheets </Button> */}
                        <br/>
                    </div>
                </div>
                <div className={`${(this.state.stage === 'SharePreview') ? '' : 'd-none'}`}>
                    <div style={{textAlign:'center'}}>
                        <iframe src="images/test.pdf" frameborder="0" height="842px" width="75%"></iframe>
                    </div>
                    <div className={`today startbutton`}>
                        <Button color="success" size="lg" onClick={this.handleStart} > Back to Homepage </Button>
                        <br/>
                    </div>
                </div>
            </div>
        );
    }

    getLyrics(song) {
        this.setState({
            masking: true,
        }, () => { // called back after setState completes
            // getLyrics(song).then(data => {
            //     this.setState({
            //         data: data.data
            //     });
            // }).catch(err => {
            //     console.error('Error getting lyrics', err);
            // });
            this.setState({
                data: "(Edit your lyrics here.)"
            });
        });
        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    getSinger(singer) {
        this.setState({
            masking: true,
        }, () => { // called back after setState completes
            // getSinger(singer).then(singercn => {
            //     this.setState({
            //         singercn: singercn.singercn
            //     });
            // }).catch(err => {
            //     console.error('Error getting lyrics', err);
            // });
            this.setState({
                singercn: singer
            });
        });
        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    searchID(data, singercn){
        if(singercn){
        var i;
     //   console.log(singercn);
        for(i=4; i>=0; i--){
            var n = data[i].singer.search(singercn);
     //       console.log(n);
      //      console.log(data[i].singer);
            if(n!=-1){
                this.setState({
                    songID: data[i].id
                });
            }
        }
        }
    }

    getLyricsfromID(songID) {
        this.setState({
            masking: true,
        }, () => { // called back after setState completes
//             getLyricsfromID(songID).then(lyrics => {
//  //               console.log(lyrics.lyrics);
//                 this.setState({
//                     lyrics: lyrics.lyrics
//                 });
//             }).catch(err => {
//                 console.error('Error getting lyrics', err);
//             });
            this.setState({
                lyrics: "(Edit your lyrics here.)"
            });
        });
        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    handleStart(){
        console.log('Start Sheet');
        if(this.state.stage ==='started'){
            this.setState({
                stage: 'begin'
            });
        }else if(this.state.stage ==='begin'){
            this.setState({
                stage: 'started'
            });
        }else if(this.state.stage ==='print'){
            window.location.href = 'https://jtchen0528.github.io/EasySheet/';//`www.facebook.com`;
            this.setState({
                stage: 'begin'
            });
        }else if(this.state.stage ==='SharePreview'){
            this.setState({
                stage: 'begin'
            });
        }
    }

    handleInstruction(){
        if(this.state.stage==='Instruction1'){
            this.setState({
                stage: 'lyricsEdit'
            });
        }else if(this.state.stage==='Instruction2'){
            this.setState({
                stage: 'chord'
            });
        }else if(this.state.stage==='Instruction3'){
            this.setState({
                stage: 'chordEdit'
            });
        }
    }

    handleShareSheets(){
        console.log('ShareSheets');
        if(this.state.stage ==='ShareSheets'){
            this.setState({
                stage: 'begin'
            });
        }else if(this.state.stage ==='begin'){
            this.setState({
                stage: 'ShareSheets'
            });
        }
    }


    handleFontChange(e) {
        this.setState({font: e.target.value});
    }

    handleColorChange(e) {
        this.setState({color: e.target.value});
    }

    handleSingerChange(e) {
        this.setState({singer: e.target.value});
    }

    handleSongChange(e) {
        this.setState({song: e.target.value});
    }

    handletemplate0Change(e){
        this.setState({template:[1, 0, 0]});
        setTimeout(() => {
            console.log(this.state.template);
        }, 600);
    }

    handletemplate1Change(e){
        this.setState({template:[0, 1, 0]});
        setTimeout(() => {
            console.log(this.state.template);
        }, 600);
    }

    handletemplate2Change(e){
        this.setState({template:[0, 0, 1]});
        setTimeout(() => {
            console.log(this.state.template);
        }, 600);
    }

    handleLyricsChange(e) {
        this.setState({lyrics: e.target.value});
    }

    onFormSubmit() {

        this.setState({
            masking: true,
            loading: true
        }, () => { // called back after setState completes

            // requestLyricsFromAPI({
            // //o_requestLyricsFromAPI({
            //     songName: this.state.song,
            //     singer: this.state.singer
            // }).then(res => {
                
            //     this.setState({
            //         lyrics: (res.song_id !== 0) ? zhcnTozhtw(res.lyrics) : '',
            //         songID: res.song_id,
            //         singercn: zhcnTozhtw(res.singer),
            //         stage: (this.state.stage === 'started') ? 'Instruction1' : 'started'
            //     });
            //     document.getElementById("textbox").value = this.state.lyrics;
                
            //     // if exists tolerable error, notify user
            //     if (res.alert_msg) console.error(res.alert_msg);

            //     console.log(this.state);

            // }).catch(err => {
            //     console.error('[Error rquest lyrics] ', err);
            // });
            console.log(this.state.singer)
            if (this.state.singer == '' || this.state.song == '') {
                this.setState({
                    masking: false,
                    loading: false,
                    showErr: true
                });
            } else {
                this.setState({
                    lyrics: "(Edit your lyrics here.)\n(Press \"Enter\" at the end of this line)\n(Use Delete and Backspace to edit.)\n(Clear the message to start editing!)",
                    songID: 1,
                    singercn: this.state.singer,
                    stage: (this.state.stage === 'started') ? 'Instruction1' : 'started'
                });
            }

        });
        setTimeout(() => {
            this.setState({
                masking: false,
                loading: false
            });
        }, 600);

        /*this.getLyrics(this.state.song);
        setTimeout(()=>{
            this.getSinger(this.state.singer);
            setTimeout(() => {
                this.searchID(this.state.data, this.state.singercn);
                setTimeout(() => {
                    this.getLyricsfromID(this.state.songID);
                    setTimeout(() => {
                        if(this.state.stage ==='started'){
                            this.setState({
                                stage: 'lyrics'
                            });
                        }
                        document.getElementById("textbox").value = this.state.lyrics;
                    }, 400);
                }, 400);
            }, 400);
        }, 400);*/
    }

    

    handleChord(){
        var x = document.getElementById("textbox").value;
        //setTimeout(() => {
                this.setState({
                    stage: 'lyricsEdit',
                    lyrics: x
                });
                console.log(this.state);
        //}, 400);
    }

    handleChordback(){
        this.setState({
            stage: 'started'
        });
    }

    onChordEditorStageChange(nextStage) {
        this.setState({
            stage: nextStage
        });
    }

    onSheetChange(sheet) {
        this.setState({
            sheet: sheet
        });
    }

    handleFormQuery(city, unit) {
        this.getWeather(city, unit);
    }

    handleSharePreview(){
        this.setState({
            stage: 'SharePreview'
        });
    }

}
