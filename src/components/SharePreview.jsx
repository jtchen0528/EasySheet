import React from 'react';
import PropTypes from 'prop-types';

import {
    Container,
    Row,
    Col,
    Button,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';

import { generatePDF, generatePDFByPdfMaker} from 'api/compnentToPdf-api'

import './SharePreview.css';

import LyricsItem from 'components/LyricsItem.jsx';
import ChordBlock from 'components/ChordBlock.jsx';
import { formatWithOptions } from 'util';

export default class SharePreview extends React.Component {

    static Protopytes = {
        sheet: PropTypes.object
    };
    constructor(props) {
        super(props);

        this.ChordTable = {
            'custom': [0, 0, 0, 0, 0, 0],
            C: [0, 3, 2, 0, 1, 0],
            Cmaj7: [0, 3, 2, 0, 0, 0],
            C7: [0, 3, 2, 3, 1, 0],
            'C#m': [4, 6, 6, 5, 4, 4],
            D: [0, 0, 0, 2, 3, 2],
            Dm: [0, 0, 0, 2, 3, 1],
            Dm7: [0, 0, 0, 2, 1, 1],
            D7: [0, 0, 0, 2, 1, 2],
            E: [0, 2, 2, 1, 0, 0],
            Em: [0, 2, 2, 0, 0, 0],
            Em7: [0, 2, 0, 0, 0, 0],
            E7: [0, 2, 0, 1, 0, 0],
            F: [1, 3, 2, 2, 1, 1],
            Fmaj7: [0, 0, 3, 2, 1, 0],
            Fm: [0, 0, 3, 1, 1, 1],
            G: [3, 2, 0, 0, 0, 3],
            G7: [3, 2, 0, 0, 0, 1],
            'G#m': [4, 6, 6, 4, 4, 4],
            A: [0, 0, 2, 2, 2, 0],
            Am: [0, 0, 2, 2, 1, 0],
            Am7: [0, 0, 2, 0, 1, 0],
            A7: [0, 0, 2, 0, 2, 0],
            B: [0, 2, 4, 4, 4, 2],
            Bm: [2, 2, 4, 4, 3, 2],
            Bm7: [2, 2, 4, 2, 3, 2],
            B7: [0, 2, 1, 2, 0, 2]
        }

        this.state = {
            lyricsItem: this.props.sheet.lyricsItem,
            chordBlock: this.props.sheet.chordBlock,
            strummingPatterns: this.props.sheet.strummingPatterns,
            print:this.props.sheet.print,
            Copied: this.props.sheet.Copied,
            chordCreatorDisplay: this.props.sheet.chordCreatorDisplay,
            copiedChordMarkList: this.props.sheet.copiedChordMarkList,
            userSelectChord: this.props.sheet.userSelectChord,
        }

        // 畫面上ChordBlock的最多數量
        this.MAX_CHORD_BLOCK_NUM = 6;
        // 畫面上rhythm pattern的最多數量
        this.MAX_STRUMMING_PATTERNS_NUM = 16;

        this.stageTable = {
            'lyricsEdit': { prev: 'lyricsEdit', next: 'chord' },
            'chord': { prev: 'lyricsEdit', next: 'chordEdit' },
            'chordEdit': { prev: 'chord', next: 'prePrint' },
            'prePrint' : {prev: 'chordEdit', next:'print'},
            'print' : {prev: 'prePrint', next:'print'},
            'SharePreview' : {prev: '', next:''}
        }

        this.strummingTable = {
            '': 'down',
            'down': 'bottom half',
            'bottom half': 'down bottom half',
            'down bottom half': 'top half',
            'top half': 'down top half',
            'down top half': 'break',
            'break': ''
        }

        this.tunes = ['e', 'B', 'G', 'D', 'A', 'E'];
        this.chordAddClbk = null;

        this.addLyricsItem = this.addLyricsItem.bind(this);
        this.mergeLyricsItem = this.mergeLyricsItem.bind(this);
        this.editLyricsItem = this.editLyricsItem.bind(this);
        this.handlePrevStage = this.handlePrevStage.bind(this);
        this.handleNextStage = this.handleNextStage.bind(this);
        this.handleCopyChange = this.handleCopyChange.bind(this);
        this.handleChordAdd = this.handleChordAdd.bind(this);
        this.handleChordRemove = this.handleChordRemove.bind(this);
        this.handleRenderRhythm = this.handleRenderRhythm.bind(this);
        // 檢查和弦是否已經出現在右側欄位中
        this.chordhasSelected = this.chordhasSelected.bind(this);
        // 處理刷法編輯
        this.handleEditPattern = this.handleEditPattern.bind(this);
        // 處理自訂chord編輯畫面的顯現 & 編輯
        this.handleChordCreator = this.handleChordCreator.bind(this);
    }

    componentDidMount() {
        this.handleRenderRhythm();
        for (let i = 0; i < this.MAX_STRUMMING_PATTERNS_NUM; i++) {
            this.state.strummingPatterns[i] = '';
        }
        console.log(this.state);
        console.log(this.props.sheet);
    }

    componentDidUpdate(prevProps) {
        this.handleRenderRhythm();

    }

    render() {

        const { lyrics, song, singer, font, singercn, stage } = this.props.sheet;
        const { lyricsItem, copiedChordMarkList, userSelectChord, strummingPatterns, chordCreatorDisplay } = this.state;
        
    //    console.log(this.props.stage,"stage test")
        
        // display all lyrics item
        let list = [];
        if (lyricsItem && lyricsItem.length) {
            for (let i = 0; i < lyricsItem.length; i++) {
                list.push(<LyricsItem
                    {...this.state}
                    addLyricsItem={this.addLyricsItem}
                    mergeLyricsItem={this.mergeLyricsItem}
                    editLyricsItem={this.editLyricsItem}
                    chordAdd={this.handleChordAdd}
                    chordRemove={this.handleChordRemove}
                    lyrics={lyricsItem[i]}
                    id={i}
                    font={font}
                    stage={this.props.stage}
                    copiedChordMarkList={copiedChordMarkList}
                    copiedChange = {this.handleCopyChange}
                    Copied = {this.state.Copied}
                    ChordTable={this.ChordTable}>   
                </LyricsItem>);
            }
        }

        // display all ChordBox
        let chordBlock = [];
        if (this.props.stage == 'lyricsEdit') {
            chordBlock = (<p style={{ color: "#000000a8", padding: "20px", display: ((this.props.stage === 'prePrint') || (this.props.stage === 'print')) ? 'none' : '' }}>{((this.props.stage === 'prePrint') || (this.props.stage === 'print')) ? '' : '＊Fingering patterns, instructions or images'}</p>);
        } else {
            for (let i = 0; i < this.MAX_CHORD_BLOCK_NUM; i++) {
                chordBlock.push(<ChordBlock
                    id={i}
                    font={font}
                    ChordTable={this.ChordTable}
                    chord={`${(userSelectChord[i]) ? userSelectChord[i].chordName : ''}`}
                    chordAdd={this.handleChordAdd}
                    chordRemove={this.handleChordRemove}
                    chordHasSelected={this.chordhasSelected}
                />);
            }
        }

        // 刷法block
        let rhythmBlock = (
            <Col xs={{ size: 8, offset: 1 }} className='d-flex flex-column align-items-center justify-content-center' style={{border: '0.125rem dashed', borderRadius: '0.5rem' }}>
                <span style={{ color: "#000000a8" }}>＊Rythm and tempo here</span>
            </Col>
        );
        if (this.props.stage !== 'lyricsEdit') {

            var sp = [];
            for (let i = 0; i < this.MAX_STRUMMING_PATTERNS_NUM; i++) {
                sp[i] = (<div className={strummingPatterns[i]} data-strumming-idx={i}></div>);
            }

            rhythmBlock = (
                <Col xs={{ size: 8, offset: 1 }} className='d-flex justify-content-center'>
                    <div className="pattern-container" onClick={this.handleEditPattern}>
                        <canvas id="rhythm-canvas"></canvas>
                        {sp}
                    </div>
                </Col>
            );
        }


        // chord自編區域
        let chordCreator = '';
        if (chordCreatorDisplay && stage !== 'print' && stage !== 'prePrint' && stage !== 'lyricsEdit') {

            // chord自編區域中的琴格
            let fingerBoard = [];
            for (let i = 0; i < 6; i++) {
                fingerBoard.push(
                    <tr>
                        <td>{this.tunes[i]}</td>
                        <td><div className="dot"></div></td>
                        <td><div className="dot"></div></td>
                        <td> <div className="dot"></div></td>
                        <td> <div className="dot"></div></td>
                    </tr>
                );
            }

            chordCreator = (
                <div id='user-create-chord' className='p-2 mx-2' onClick={this.handleChordCreator}>
                    <i className="fas fa-times-circle"></i>
                    <table className='mb-2'><tbody>{fingerBoard}</tbody></table>
                    <Row>
                        <Col xs='12' md={{ size: 5, offset: 1 }}>
                            <FormGroup>
                                <Label for="user-create-chord-name">Chord Name</Label>
                                <Input type="text" name="text" id="user-create-chord-name"></Input>
                            </FormGroup>
                        </Col>
                        <Col xs='12' md={{ size: 5, offset: 1 }}>
                            <FormGroup>
                                <Label for="user-create-chord-capo">Capo</Label>
                                <Input type="select" name="select" id="user-create-chord-capo" defaultValue>
                                    <option>0</option>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button color="success" className='d-block ml-auto' onClick={this.handleChordCreate}>確認送出</Button>
                </div>
            );
        }

        return (
            <div>
                <div className={`today choose title`}>
                    <p>{(this.props.stage == 'lyricsEdit') ? 'Step 2: 編排歌詞' : (this.props.stage == 'chord') ? 'Step 3: 填選曲調' : (this.props.stage == 'chordEdit') ? 'Step 4: 編輯樂譜指示' : (this.props.stage == 'prePrint') ? 'Step 5: 確認預覽' :'' }</p>
                </div>
            <div style={{display:(this.props.template[0]===1)?'':'none'}}>
            <Container className='form chord-editor' >
                <p><br/></p>
                        <p style={{position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>
                            請在您想增加音調的行末按下Enter <br/>
                            並且將重複旋律的歌詞(Verses)放在一起 <br/>
                        </p>
                        <p style={{paddingLeft:'20px', position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>
                            在音調欄上新增並選擇音調 <br/>
                            綠色/黃色按鈕為複製/貼上整行 <br/>
                            紅色按鈕為刪除整行 <br/>
                        </p>
                        <p style={{position:'absolute', top:'800px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>請盡量不要超過這裡</p>
                        <p style={{position:'absolute', top:'830px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>請絕對不要超過這裡</p>
                <div id = {"toPrint"} style = {this.state.print?{width : "592.28px", height : "842px", background:this.props.color}:{}} className = {`${this.state.print?"mx-auto":""}`}>
                    <Container style={{ padding: 0}}>
                        <Row className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`}>
                            <Col className='text-center chord-editor-title'>
                                <h2 style={{paddingTop:"20px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(song == '') ? 'Song title missing' : song}</h2>
                                <h5 style={{textAlign:"right", paddingRight:"50px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(singer == '') ? ((singercn == '') ? '記得輸入歌手喔' : singercn) : singer}</h5>
                            </Col>
                        </Row>
                        <Row className='mb-2' style={{ height: '60px', transition: 'all .3s' }}>{rhythmBlock}</Row>
                        <Row className='mb-2'>
                            <Col xs='9'>
                                <div style={{padding:"10px", paddingLeft:"30px"}}>
                                {(this.props.template[0]===1)?list:''}
                                </div>
                            </Col>
                            <Col xs='3' style={{paddingRight:'20px'}}> {chordBlock}</Col>
                        </Row>
                    </Container>
                    {chordCreator}
                </div>
                <p><br/></p>
                <Row >
                    <Col xs="5" lg="3" className={`choose center`}>
                        <Button color="secondary" size="lg" onClick={this.handlePrevStage} style={{display: (this.props.stage === "lyricsEdit")?'none':''}}>上一步</Button>
                    </Col>
                    <Col xs="2" lg="6">
                    </Col>
                    <Col xs="5" lg="3" className={`startbutton`}>
                        <Button color="success" size="lg" onClick={this.handleNextStage} >{this.props.stage ==="print" ||this.props.stage ==="prePrint" ? "下載":"下一步"}</Button>
                    </Col>
                </Row>
            </Container>
            </div>
            <div style={{display:(this.props.template[1]===1)?'':'none'}}>
            <Container className='form chord-editor' >
                <p><br/></p>
                <p style={{position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>
                            請在您想增加音調的行末按下Enter <br/>
                            並且將重複旋律的歌詞(Verses)放在一起 <br/>
                        </p>
                        <p style={{paddingLeft:'20px', position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>
                            在音調欄上新增並選擇音調 <br/>
                            綠色/黃色按鈕為複製/貼上整行 <br/>
                            紅色按鈕為刪除整行 <br/>
                        </p>
                        <p style={{position:'absolute', top:'800px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>請盡量不要超過這裡</p>
                        <p style={{position:'absolute', top:'830px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>請絕對不要超過這裡</p>
                <div id = {"toPrint"} style = {this.state.print?{width : "592.28px", height : "842px", background:this.props.color}:{}} className = {`${this.state.print?"mx-auto":""}`}>
                    <Container style={{ padding: 0}}>
                        <Row className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`}>
                            <Col className='text-center chord-editor-title'>
                                <h2 style={{paddingTop:"20px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(song == '') ? 'Song title missing' : song}</h2>
                                <h5 style={{textAlign:"right", paddingRight:"50px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(singer == '') ? ((singercn == '') ? 'Singer Missing' : singercn) : singer}</h5>
                            </Col>
                        </Row>
                        <Row className='mb-2' style={{ height: '60px', transition: 'all .3s' }}>{rhythmBlock}</Row>
                        <Row className='mb-2'>
                        <Col className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`}  xs='12'>
                                <p style={{color:"#000000a8", padding:"20px", display:((this.props.stage === 'lyricsEdit')) ?'':'none'}}>＊Fingering patterns, instructions or images</p>
                                <Row>
                                    <Col xs='2'>
                                        {chordBlock[0]}
                                    </Col>
                                    <Col xs='2'>
                                        {chordBlock[1]}
                                    </Col>
                                    <Col xs='2'>
                                        {chordBlock[2]}
                                    </Col>
                                    <Col xs='2'>
                                        {chordBlock[3]}
                                    </Col>
                                    <Col xs='2'>
                                        {chordBlock[4]}
                                    </Col>
                                    <Col xs='2'>
                                        {chordBlock[5]}
                                    </Col>
                                </Row>
                        </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`} xs='12'>
                                <div style={{paddingLeft:"30px", alignContent:'center', paddingRight:"65px"}}>
                                {(this.props.template[1]===1)?list:''}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <p><br/></p>
                <Row >
                    <Col xs="5" lg="3" className={`choose center`}>
                        <Button color="secondary" size="lg" onClick={this.handlePrevStage} style={{display: (this.props.stage === "lyricsEdit")?'none':''}}>上一步</Button>
                    </Col>
                    <Col xs="2" lg="6">
                    </Col>
                    <Col xs="5" lg="3" className={`startbutton`}>
                        <Button color="success" size="lg" onClick={this.handleNextStage} >{this.props.stage ==="print" ||this.props.stage ==="prePrint" ? "下載":"下一步"}</Button>
                    </Col>
                </Row>
            </Container>
            </div>
            <div style={{display:(this.props.template[2]===1)?'':'none'}}>
            <Container className='form chord-editor' >
                <p><br/></p>
                <p style={{position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>
                            請在您想增加音調的行末按下Enter <br/>
                            並且將重複旋律的歌詞(Verses)放在一起 <br/>
                        </p>
                        <p style={{paddingLeft:'20px', position:'absolute', top:'500px',paddingLeft:'10px', maxWidth:'230px', textAlign:'left', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>
                            在音調欄上新增並選擇音調 <br/>
                            綠色/黃色按鈕為複製/貼上整行 <br/>
                            紅色按鈕為刪除整行 <br/>
                        </p>
                        <p style={{position:'absolute', top:'800px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'lyricsEdit')) ? '' : 'none' }}>請盡量不要超過這裡</p>
                        <p style={{position:'absolute', top:'830px', paddingLeft:'20px', textAlign:'center', fontFamily:'Noto Sans TC', color: "#000000a8", display: ((this.props.stage === 'chord')) ? '' : 'none' }}>請絕對不要超過這裡</p>
                
                <div id = {"toPrint"} style = {this.state.print?{width : "592.28px", height : "842px", background:this.props.color}:{}} className = {`${this.state.print?"mx-auto":""}`}>
                    <Container style={{ padding: 0}}>
                        <Row className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`}>
                            <Col className='text-center chord-editor-title'>
                                <h2 style={{paddingTop:"20px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(song == '') ? 'Song title missing' : song}</h2>
                                <h5 style={{textAlign:"right", paddingRight:"50px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(singer == '') ? ((singercn == '') ? 'Singer Missing' : singercn) : singer}</h5>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col >
                                <span style={{color:"#000000a8", paddingLeft:"50px", display:((this.props.stage === 'prePrint')||(this.props.stage === 'print')) ?'none':''}}>{((this.props.stage === 'prePrint')||(this.props.stage === 'print')) ? '' :'＊Rythm and tempo here' }</span>
                            </Col>
                        </Row>
                        <Row className='mb-2'>
                            <Col className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`} xs='12'>
                                <div style={{padding:"30px", alignContent:'center', paddingRight:"65px"}}>
                                {(this.props.template[2]===1)?list:''}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <p><br/></p>
                <Row >
                    <Col xs="5" lg="3" className={`choose center`}>
                        <Button color="secondary" size="lg" onClick={this.handlePrevStage} style={{display: (this.props.stage === "lyricsEdit")?'none':''}}>上一步</Button>
                    </Col>
                    <Col xs="2" lg="6">
                    </Col>
                    <Col xs="5" lg="3" className={`startbutton`}>
                        <Button color="success" size="lg" onClick={this.handleNextStage} >{this.props.stage ==="print" ||this.props.stage ==="prePrint" ? "下載":"下一步"}</Button>
                    </Col>
                </Row>
            </Container>
            </div>
            
            </div>
         )
    }

    // normal edit
    editLyricsItem(item = { id: -1, lyrics: '' }) {
        if (item.id >= 0 && this.lyrics !== '') {
            this.setState({
                lyricsItem: this.state.lyricsItem.map((str, idx) => {
                    if (item.id === idx) return item.lyrics;
                    else return str;
                })
            });
        }
    }

    // add item///////////////////////////////
    addLyricsItem(item = { id: -2, dividedLyrics: '' , lyrics :''}) {
        if (item.id >= -1 && item.lyrics !== '') {
            if (item.id === -1) this.setState({ lyricsItem: this.state.lyricsItem.push(item.dividedLyrics) });
            else {
                this.state.lyricsItem.splice(item.id + 1, 0, item.dividedLyrics);
                this.setState({
                    lyricsItem: this.state.lyricsItem.map((str, idx) => {
                        if (item.id === idx) {
                            var _str = item.lyrics.replace(item.dividedLyrics, '');
                            return _str.substring(0, _str.length-2);
                        }
                        else return str;
                    })
                });
            }
        }
    }

    // merge item
    mergeLyricsItem(item = { id: -1, lyrics: '', mtd: '' }) {// delete this item by key delete
        if (item.mtd === 'delete') {
            if (item.id >= 0 ) {
                this.state.lyricsItem.splice(item.id, 1); 
                this.setState({
                    lyricsItem: this.state.lyricsItem.map((str, idx) => {
                        if (idx === item.id - 1) return str +'\n'+ item.lyrics;
                        else return str;
                    })
                });
            }
        } else if (item.mtd === 'backspace') {// delete this item by key backspace
            if (item.id > 0 && item.lyrics !== '') {
                this.state.lyricsItem.splice(item.id, 1); 
                this.setState({
                    lyricsItem: this.state.lyricsItem.map((str, idx) => {
                        if (idx === item.id - 1) return str + '\n' + item.lyrics;
                        else return str;
                    })
                });
            }
        }
    }

    displayChordEdit(display = true) {
        if (display) {
            var item = document.querySelectorAll('.lyrics-item').forEach(ele => {
                ele.querySelector('.chord-edit').style.display = 'block';
                ele.querySelector('textarea').disabled = true;
            });
        } else {
            var item = document.querySelectorAll('.lyrics-item').forEach(ele => {
                ele.querySelector('.chord-edit').style.display = 'none';
                ele.querySelector('textarea').disabled = false;
            });
        }
    }

    handlePrevStage() {
        this.props.onChordEditorStageChange(this.stageTable[this.props.stage].prev);
        switch (this.stageTable[this.props.stage].prev) {
            case 'lyricsEdit':
                this.displayChordEdit(false);
                this.setState({
                    print:true,
                })
                break;
            case 'chordEdit':
                break;
            case 'chord':
                this.displayChordEdit(true);
                break;
            case 'print':
            default: console.log(this.props.stage); break;
        }
    }

    handleNextStage() {
        
        this.props.onChordEditorStageChange(this.stageTable[this.props.stage].next);
        switch (this.stageTable[this.props.stage].next) {
            case 'lyricsEdit':
                this.displayChordEdit(false);
                break;
            case 'chordEdit':
            case 'chord':
                this.setState({
                    print:true,
                })
                this.displayChordEdit(true);
                break;
            case 'print':
                generatePDF("toPrint");
                //generatePDFByPdfMaker('toPrint'); 另一種方式；先開啟再下載
                var sheet={
                    lyricsItem: this.state.lyricsItem,
                    chordBlock: this.state.chordBlock,
                    strummingPatterns: this.state.strummingPatterns,
                    print:this.state.print,
                    Copied: this.state.Copied,
                    chordCreatorDisplay: this.state.chordCreatorDisplay,
                    copiedChordMarkList: this.state.copiedChordMarkList,
                    userSelectChord: this.state.userSelectChord,
                }
                this.props.onSheetChange(sheet);
                break;     
            default: console.log(this.props.stage); break;
        }
        console.log(this.props.stage);
    }
    handleCopyChange(changeedChordMarkList){
        console.log(this.state.Copied,"outer test")
        if(!this.state.Copied) {
            this.setState({
                Copied: true,
                copiedChordMarkList: changeedChordMarkList
            });
        }
        else {
            this.setState({
                Copied:false,
            })
            console.log(this.state.Copied,"outer flase test")
        }
    }

    // 若有新增 chord
    handleChordAdd(chord, selectedByUser = -1, clbk) {

        // 如果使用者要自訂chord，將其callback存入
        if (chord === 'custom') {
            if (this.state.chordCreatorDisplay) {
                console.error('unfinished chord edit exists. Please close it and try again.');
            } else {
                this.setState({  chordCreatorDisplay: true });
                if (clbk) this.chordAddClbk = clbk;
            }
            return;
        }

        // 如果有callback，先執行並重制
        if (this.chordAddClbk) {
            this.chordAddClbk(chord);
            this.chordAddClbk = null;
        }

        var hasSelected = this.state.userSelectChord;
        if (hasSelected.length < this.MAX_CHORD_BLOCK_NUM) {

            var i = this.chordhasSelected(chord);
            if (i >= 0) {
                hasSelected[i].times++;
            } else {
                //this.state.userSelectChord.push();
                if (selectedByUser < 0) {
                    let i = 0, hasInstall = false;
                    while ( i <= this.MAX_CHORD_BLOCK_NUM) {
                        if (!this.state.userSelectChord[i]) {
                            this.state.userSelectChord[i] = { chordName: chord, times: 1 };
                            hasInstall = true;
                            break;
                        }
                        i++;
                    }
                    if (!hasInstall) this.state.userSelectChord[this.state.userSelectChord.length] = { chordName: chord, times: 1 };
                }
                else this.state.userSelectChord[selectedByUser] = { chordName: chord, times: 1 };
            }
            this.setState({});
        }
    }

    // 檢查這個chord有無被使用者選過
    chordhasSelected(chord) {
        var hasExisted = -1;
        var hasSelected = this.state.userSelectChord;

        // 檢查是否記錄過此chord
        for (let i = 0; i < hasSelected.length; i++) {
            // 若出現過 增加其選取次數(times)
            if (hasSelected[i] && hasSelected[i].chordName === chord) {
                hasExisted = i;
                break;
            }
        }
        return hasExisted;
    }

    // 若 LyricsItem 移除chord
    handleChordRemove(chord) {

        var hasSelected = this.state.userSelectChord;
        if (hasSelected.length) {

            var i = this.chordhasSelected(chord);
            if ( i >= 0) {
                // 若從畫面中消失，把這個chord從userSelectChord移除
                console.log(hasSelected)
                if (!--hasSelected[i].times) {
                    this.setState({
                        userSelectChord: this.state.userSelectChord.filter((select, idx) => {
                            return idx !== i;
                        })
                    });
                    console.log(hasSelected)

                }
                return;
            }
        }
    }

    // 繪製刷法背景
    handleRenderRhythm() {
        // pattern
        var c = document.getElementById('rhythm-canvas');
        if (c) {
            c.width = c.parentNode.clientWidth;
            c.height = c.parentNode.clientHeight + 2;
            var ctx = c.getContext('2d');

            // background
            /*ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, c.width, c.height);*/

            //bottom line
            /*ctx.fillStyle = '#000';
            ctx.lineWidth = 10;
            ctx.lineCap = 'square';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, c.height);
            ctx.stroke();*/

            //string
            var stringGap = c.height / 5;
            ctx.lineWidth = 2;
            for (let i = 0; i <= 5; i++) {
                ctx.beginPath();
                ctx.moveTo(0, stringGap * i + (i === 5 ? -1 : 1));
                ctx.lineTo(c.width, stringGap * i + (i === 5 ? -1 : 1));
                ctx.stroke();
            }

            // depart line
            ctx.beginPath();
            ctx.moveTo(c.width / 2, 0);
            ctx.lineTo(c.width / 2, c.height);
            ctx.stroke();
        }
    }

    // 編輯刷法
    handleEditPattern(e) {
        if (e.target.nodeName == 'DIV') {
            this.state.strummingPatterns[e.target.getAttribute('data-strumming-idx')] = this.strummingTable[e.target.className];
            e.target.className = this.strummingTable[e.target.className];
        }
    }
    
    // 編輯和弦區塊操作
    handleChordCreator(e) {
        var target = e.target;
        
        if (target.classList.contains('fas')) {// 關掉編輯和弦區塊
            this.setState({
                chordCreatorDisplay: false
            });
        } else if (target.classList.contains('dot')) {// 使用者編輯中
            var ele = null;
            if (target.parentNode.parentNode.querySelector('div.active')) {
                ele = target.parentNode.parentNode.querySelector('div.active');
            }
            target.classList.add('active');

            if (ele) ele.classList.remove('active');
        } else if (target.classList.contains('btn-success')) {// 送出編輯結果
            var formEle = target.parentNode;
            var newChordCapo = parseInt(formEle.querySelector('#user-create-chord-capo').value);
            var newChordName = formEle.querySelector('#user-create-chord-name').value;
            var newChordMtd = [];

            if (!newChordName) {
                console.error('Chord name undefined.');
                return;
            }

            // 找出每一條弦的點按處，並加上capo
            var trEle = formEle.querySelectorAll('tr');
            for (let i = 0; i < 6; i++) {
                var tdEle = trEle[i].querySelectorAll('td > div');
                var fingerBoard = -1;
                for (let j = 0; j < tdEle.length; j++) {
                    if (tdEle[j].classList.contains('active')) {
                        fingerBoard = j;
                        break;
                    }
                }
                newChordMtd[5-i] = fingerBoard +1 + newChordCapo;
            }

            // redefine ChordTable
            this.ChordTable[newChordName] = newChordMtd;
            // 加入使用者的選單
            this.handleChordAdd(newChordName);

            this.setState({
                chordCreatorDisplay: false
            });
        }
    }
}