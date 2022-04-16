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
    Input,
    Navbar,
    Alert
} from 'reactstrap';

import { generatePDF, generatePDFByPdfMaker} from 'api/compnentToPdf-api'

import './ChordEditor.css';

import LyricsItem from 'components/LyricsItem.jsx';
import ChordBlock from 'components/ChordBlock.jsx';
import { formatWithOptions } from 'util';

export default class ChordEditor extends React.Component {

    static Protopytes = {
        song: PropTypes.string,
        lyrics: PropTypes.string,
        stage: PropTypes.string,
        onChordEditorStageChange: PropTypes.func,
        onSheetChange: PropTypes.func,
        copiedChordMarkList:PropTypes.array,
        Copied:PropTypes.bool
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
            lyricsItem: ['NA'],
            chordBlock: ['NA'],
            strummingPatterns: [],
            chordBlockContent: new Array(),
            print:true,
            Copied: false,
            chordCreatorDisplay: false,
            copiedChordMarkList: new Array(),
            userSelectChord: new Array(),
            showError: false,
            strummingCollapsed: false
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

        this.errorMessage = "";

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
        //error message
        this.closeErrorShow = this.closeErrorShow.bind(this);
        this.handleInstruction = this.handleInstruction.bind(this);
        this.setChordBlock = this.setChordBlock.bind(this);
    }

    componentDidMount() {
        this.handleRenderRhythm();
        for (let i = 0; i < this.MAX_STRUMMING_PATTERNS_NUM; i++) {
            this.state.strummingPatterns[i] = '';
        }

        for (let i = 0; i < this.MAX_CHORD_BLOCK_NUM; i++) {
            this.state.chordBlockContent.push({ type: 'chord', val: '' });
        }
    }

    componentDidUpdate(prevProps) {
        this.handleRenderRhythm();
        if (this.props.lyrics !== prevProps.lyrics) {
            this.setState({ lyricsItem: [this.props.lyrics] });
            this.displayChordEdit(false);
        }
    }

    render() {
        
        const { lyrics, song, singer, font, singercn, stage, template } = this.props;
        const { lyricsItem, copiedChordMarkList, chordBlockContent, strummingPatterns, chordCreatorDisplay, showError, strummingCollapsed } = this.state;
        
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
            chordBlock = (<p style={{ color: "#000000a8", padding: "20px", display: ((this.props.stage === 'prePrint') || (this.props.stage === 'print')) ? 'none' : '' }}>{((this.props.stage === 'prePrint') || (this.props.stage === 'print')) ? '' : '＊這裡可以放按法、樂譜指示'}</p>);
        } else {
            for (let i = 0; i < this.MAX_CHORD_BLOCK_NUM; i++) {
                chordBlock.push(<ChordBlock
                    id={i}
                    font={font}
                    ChordTable={this.ChordTable}
                    content={(chordBlockContent[i]) ? chordBlockContent[i] : { type: 'chord', val: '' }}
                    chordAdd={this.handleChordAdd}
                    chordRemove={this.handleChordRemove}
                    chordHasSelected={this.chordhasSelected}
                    setChordBlock={this.setChordBlock}
                    stage={stage}
                    template={template[0]}
                />);
            }
        }

        // 刷法block layout
        let rhythmBlock = '';
        if (template[2] !== 1) {
            if (stage !== 'chord' && stage !== 'lyricsEdit' && !strummingCollapsed) {

                var sp = [];
                for (let i = 0; i < this.MAX_STRUMMING_PATTERNS_NUM; i++) { sp[i] = (<div className={strummingPatterns[i]} data-strumming-idx={i}></div>);  }

                rhythmBlock = (
                    <Row className='mb-2' style={{ height: `${strummingCollapsed ? '20px' : '60px'}`, transition: 'all .3s' }}>
                        <Col xs={{ size: 8, offset: 1 }} className={`d-flex justify-content-center`} onClick={this.handleEditPattern}>
                            <i className={`fas fa-chevron-circle-up ${strummingCollapsed ? 'rotate' : ''} ${(stage == 'prePrint' || stage == 'print') ? 'd-none' : ''}`}></i>
                            <div className={`pattern-container ${strummingCollapsed ? 'fade' : ''}`}>
                                <canvas id="rhythm-canvas" />
                                {sp}
                            </div>
                        </Col>
                    </Row>
                );
            } else {
                rhythmBlock = (
                    <Row className='mb-2' style={{ height: `${strummingCollapsed ? '20px' : '60px'}`, transition: 'all .3s', opacity: `${(stage == 'prePrint' || stage == 'print')? 0 : 1}` }}>
                        <Col xs={{ size: 8, offset: 1 }} className='d-flex flex-column align-items-center justify-content-center' style={{ border: '0.125rem dashed', borderRadius: '0.5rem' }}>
                            <i className={`fas fa-chevron-circle-up ${strummingCollapsed ? 'rotate' : ''}`} onClick={this.handleEditPattern}></i>
                            <span style={{ color: "#000000a8" }}>*這裡可以放刷法</span>
                        </Col>
                    </Row>
                );
            }
        }

        // LyricsItem & ChordBlock layout
        var templateMode = '';
        switch (template.toString().replace(/,/g, '')) {
            case '100':
                templateMode = (
                    <Row className='mb-2'>
                        <Col xs='9'>
                            <div style={{ padding: "10px", paddingLeft: "30px" }}>
                                {list}
                            </div>
                        </Col>
                        <Col xs='3' style={{ paddingRight: '20px' }}> {chordBlock}</Col>
                    </Row>
                );
                break;
            case '010':
                templateMode = (
                    <Row className='mb-2'>
                        <Col className='d-flex justify-content-between align-items-center mb-2'>{chordBlock}</Col>
                        <Col className={`${this.props.stage === "prePrint" || this.props.stage === "print" ? "" : ''}`} xs='12'>
                            <div style={{ paddingLeft: "30px", alignContent: 'center', paddingRight: "65px" }}>
                                {list}
                            </div>
                        </Col>
                    </Row>
                );
                break;
            case '001':
                templateMode = (
                    <Row className='mb-2'>
                        <Col className={`${this.props.stage === "prePrint" || this.props.stage === "print" ? "" : ''}`} xs='12'>
                            <div style={{ padding: "30px", alignContent: 'center', paddingRight: "65px" }}>
                                {list}
                            </div>
                        </Col>
                    </Row>
                );
                break;
            default: console.error('error template : ' + template); break;
        }

        // chord自編區域
        let chordCreator = '';
        if (chordCreatorDisplay && stage !== 'print' && stage !== 'prePrint' && stage !== 'lyricsEdit') {

            // chord自編區域中的琴格
            let fingerBoard = [];
            for (let i = 0; i < 6; i++) {
                let dots = [];
                for (let j = 0; j < 4; j++) { dots.push(<td><div className="dot"></div></td>) }

                fingerBoard.push(
                    <tr>
                        <td>{this.tunes[i]}</td>
                        {dots}
                    </tr>
                );
            }

            var optCapo = [];
            for (let i = 0; i < 9; i++) { optCapo.push(<option>{i}</option>) };

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
                                <Input type="select" name="select" id="user-create-chord-capo" defaultValue='0'>{optCapo}</Input>
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
                    <p style={{display:'inline', paddingLeft:'50px'}}>{(this.props.stage == 'lyricsEdit') ? 'Step 2: 編排歌詞' : (this.props.stage == 'chord') ? 'Step 3: 填選曲調' : (this.props.stage == 'chordEdit') ? 'Step 4: 編輯樂譜指示' : (this.props.stage == 'prePrint') ? 'Step 5: 確認預覽' :'' }</p>
                    <div style={{fontSize:'1.5rem', display: 'inline', paddingLeft:'50px'}}>
                        <Button color="info" onClick={this.handleInstruction}>教學</Button>
                    </div>
                </div>
                <Container className='form chord-editor' >
                    <p><br/></p>
                    <div id = {"toPrint"} style = {this.state.print?{width : "592.28px", height : "842px", background:this.props.color}:{}} className = {`${this.state.print?"mx-auto":""}`}>
                        <Container style={{ padding: 0}}>
                            <Row className={`${this.props.stage === "prePrint" || this.props.stage === "print"?"":''}`}>
                                <Col className='text-center chord-editor-title'>
                                    <h2 style={{paddingTop:"20px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(song == '') ? '記得輸入歌名喔' : song}</h2>
                                    <h5 style={{textAlign:"right", paddingRight:"50px", fontFamily:(this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':''}}>{(singer == '') ? ((singercn == '') ? '記得輸入歌手喔' : singercn) : singer}</h5>
                                </Col>
                            </Row>
                            {rhythmBlock}
                            {templateMode}
                        </Container>
                        {chordCreator}
                    </div>
                    <p><br/></p>
                    <Row >
                        <Col xs="5" lg="3" className={`choose center`}>
                            <Button color="secondary" size="lg" onClick={this.handlePrevStage} style={{display: (this.props.stage === "lyricsEdit")?'none':''}}>上一步</Button>
                        </Col>
                        <Col xs="2" lg="6"></Col>
                        <Col xs="5" lg="3" className={`startbutton`}>
                            <Button color="success" size="lg" onClick={this.handleNextStage} >{this.props.stage ==="print" ||this.props.stage ==="prePrint" ? "下載":"下一步"}</Button>
                        </Col>
                    </Row>
                </Container>
                {showError && <Alert color='danger' className='loading' style={{position: 'fixed', bottom: '0px', textAlign: 'center', right: '50%', transform: 'translateX(50%)'}}>{this.errorMessage}<Button color="danger" onClick={this.closeErrorShow}>確認</Button></Alert>}
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
                    print: true
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
        
        if(this.props.stage==='prePrint'){
                generatePDF("toPrint");
        }
        //為了讓進入下個state前可以輸出pdf
        setTimeout(() => {
        this.props.onChordEditorStageChange(this.stageTable[this.props.stage].next);
        switch (this.stageTable[this.props.stage].next) {
            case 'lyricsEdit':
                this.displayChordEdit(false);
                break;
            case 'chordEdit':
            case 'chord':
                this.setState({
                    print: true
                })
                this.displayChordEdit(true);
                break;
            case 'print':
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
                    template: this.props.template,
                    font: this.props.font,
                    song: this.props.song,
                    singer: this.props.singer,
                    singercn: this.props.singercn,
                    stage: this.props.stage,
                    color: this.props.color
                }// Hmm... maybe use var sheet ={ ...this.props } instead?
                this.props.onSheetChange(sheet);
                break;     
            default: console.log(this.props.stage); break;
        }
        console.log(this.props.stage);
    }, (this.props.stage==='prePrint')?600:0);

    }

    handleInstruction(){
        if(this.props.stage==='lyricsEdit'){
            this.props.onChordEditorStageChange('Instruction1');
        }else if(this.props.stage==='chord'){
            this.props.onChordEditorStageChange('Instruction2');
        }else if(this.props.stage==='chordEdit'){
            this.props.onChordEditorStageChange('Instruction3');
        }
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
                this.errorMessage = 'unfinished chord edit exists. Please close it and try again.';
                this.setState({ showError: true })
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

            var j = this.chordhasSelected(chord);
            if (j >= 0) {
                hasSelected[j].times++;
            } else {
                //this.state.userSelectChord.push();
                if (selectedByUser < 0) {
                    let i = 0, hasInstall = false;
                    while (i < this.MAX_CHORD_BLOCK_NUM) {
                        var _ctn = this.state.chordBlockContent[i];
                        if (_ctn.type === 'chord' && !_ctn.val) {
                            _ctn.val = chord;
                            hasInstall = true;
                            break;
                        }
                        i++;
                    }
                    if (!hasInstall) this.state.chordBlockContent[this.state.chordBlockContent.length] = { type: 'chord', val: chord };
                }
                else this.state.chordBlockContent[selectedByUser] = { type: 'chord', val: chord };

                // stack in chord been selected set
                this.state.userSelectChord[this.state.userSelectChord.length] = { chordName: chord, times: 1 };
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
            console.log(i, hasSelected[i])
            if ( i >= 0) {
                // 若從畫面中消失，把這個chord從userSelectChord移除
                if (!--hasSelected[i].times) {
                    this.setState({
                        userSelectChord: this.state.userSelectChord.filter((select, idx) => {
                            return idx !== i;
                        }),
                        chordBlockContent: this.state.chordBlockContent.map((block) => {
                            console.log(block.val, chord);
                            return (block.val !== chord) ? block : { type: 'chord', val: '' };
                        })
                    });
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
            c.height = 60;
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
        if (this.props.stage == 'chord' || this.props.stage == 'chordEdit'){
            if (e.target.nodeName == 'DIV') {
                this.state.strummingPatterns[e.target.getAttribute('data-strumming-idx')] = this.strummingTable[e.target.className];
                e.target.className = this.strummingTable[e.target.className];
            } else if (e.target.nodeName == 'I') {
                console.log(this.state.strummingCollapsed)
                this.setState({
                    strummingCollapsed: !this.state.strummingCollapsed
                });
            }
        } else {
            this.errorMessage = 'Press "下一步" to edit.';
            this.setState({ showError: true });
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
                this.errorMessage = 'Chord name undefined.';
                this.setState({ showError: true });
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
    
    closeErrorShow() {
        this.setState({
            showError: false
        });
    }

    setChordBlock(updateObj, idx, forceUpdate = false) {

        this.state.chordBlockContent[idx] = updateObj;
        if (forceUpdate) {
            this.setState({});
        }
    }
}