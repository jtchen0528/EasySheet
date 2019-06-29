import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Container
} from 'reactstrap';

import './LyricsItem.css';

export default class LyricsItem extends React.Component {
    static Protopytes = {
        lyrics: PropTypes.string,
        ChordTable: PropTypes.object,
        id: PropTypes.number,
        chordEditDisplay: PropTypes.bool,
        mergeLyricsItem: PropTypes.func,
        addLyricsItem: PropTypes.func,
        editLyricsItem: PropTypes.func,
        font: PropTypes.string,
        stage: PropTypes.string,
        preflag:PropTypes.number,
        nextflag: PropTypes.number,
        chordAdd: PropTypes.func,
        chordRemove: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            chordSelectionDisplay: false,
            chordMarkList: new Array(), // don't use '[]'. u will get error is u try 2 change array
            chordMarkDisplay: false,
            lyrics: props.lyrics,
            presSlectionstart : 0,
            preflag : 1,
            nextflag : 1,
        }

        this.handleTextEdit = this.handleTextEdit.bind(this);
        this.handleChordEdit = this.handleChordEdit.bind(this);
        this.handleChordMarkMove = this.handleChordMarkMove.bind(this);
        this.handleChordMarkEnter = this.handleChordMarkEnter.bind(this);
        this.handleChordMarkLeave = this.handleChordMarkLeave.bind(this);
        this.handleChordMarkDisplay = this.handleChordMarkDisplay.bind(this);
        this.handleChordListAdd = this.handleChordListAdd.bind(this);
        this.handleLyricsDislpay = this.handleLyricsDislpay.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChordCopy = this.handleChordCopy.bind(this);
        this.handleChordDelete = this.handleChordDelete.bind(this);
        this.handleRemoveChordMark = this.handleRemoveChordMark.bind(this);
    }

    // initial
    componentDidMount() {
        this.setState({ lyrics: this.props.lyrics });
    }
    // if lycis-item(is belong to ChordEditor) change
    componentDidUpdate(prevProps) {
        
        if (this.props.lyrics !== this.state.lyrics) {
            this.setState({ lyrics: this.props.lyrics });
        }
        this.handleLyricsDislpay();
    }

    // render
    render() {
        const { chordEditDisplay, ChordTable, id, Copied} = this.props;
        const { chordMarkList, chordMarkDisplay, chordSelectionDisplay, lyrics } = this.state;

        // chord mark list
        let chordList = '';
        if (chordMarkList.length) {
            chordList = chordMarkList.map((item, idx) => (
                <span className='chord-mark-icon' style={{ left: item.offest, textAlign: "center" }} onMouseEnter={this.handleChordMarkLeave}>
                    <i className="fas fa-times-circle" onClick={(e) => { this.handleRemoveChordMark(e, idx, item.chordName); }}></i>
                    {item.chordName}
                </span>
            ));
        }

        // chord selector's selection
        let optChord = [];
        for (var chord in ChordTable) {
            optChord.push(<option>{chord}</option>)
        }

        return (
            <Container style={{paddingTop:(this.props.stage==='lyricsEdit')?'1.5rem':'0px'}}>
                <Row>
                    <Col xs ='1'>
                        <Button className='function-btn' onClick={this.handleChordDelete} title="刪除" style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)', display: (this.props.stage === 'chord') ? '' : 'none' }}><i className="fas fa-times"></i></Button>
                    </Col>
                    <Col xs = '11'>
            <div className={`lyrics-item`} id={`lyrics-item-${id}`}style={{border:(this.props.stage === 'lyricsEdit') ? '' :'0px'  }}>

                <div className={`chord-edit`} style={{ display: 'none', backgroundColor:(this.props.stage==='chord')?"rgba(255, 255, 255, 0.8)":"", border:(this.props.stage === 'chord') ? '1px solid rgba(0, 0, 0, 0.5)' :''}} onMouseOver={this.handleChordMarkEnter} onMouseLeave={this.handleChordMarkLeave} onMouseMove={this.handleChordMarkMove}>
                    {chordList}
                    <Label className={`chord-mark ${chordMarkDisplay? 'd-block':'d-none'}`} for={`chord-select-${id}`} onClick={(this.props.stage==='chord')?this.handleChordEdit:''} style={{background:(this.props.stage==='chord')?"rgba(255, 0, 0, 0.5)":'', textAlign:"center", cursor:(this.props.stage==='chord')?'':'default'}}>{(this.props.stage==='chord')?<i className="fas fa-plus"></i>:""}</Label>
                    <div className={`chord-selector ${chordSelectionDisplay? 'd-block' : 'd-none'}`}>
                        <Form>
                            <FormGroup>
                                <Row className='w-100'>
                                    <Col sm='8'>
                                        <Input type="select" name="select" id={`chord-select-${id}`} defaultValue="自訂">
                                            {optChord}
                                        </Input>
                                    </Col>
                                    <Col sm='4'><Button className='chord-markSubmit' color="success" onClick={this.handleChordListAdd}>GO</Button></Col>
                                </Row>
                            </FormGroup>
                        </Form>
                    </div>
                    <Button onClick={() => this.handleChordCopy(chordMarkList)} title={(Copied == false) ? '複製' : '貼上'} className='function-btn' style={{ float: 'right', backgroundColor: (Copied == false) ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 0, 0.3)', display: (this.props.stage === 'chord') ? '' : 'none' }} onMouseMove={this.handleChordMarkLeave}>
                        <i className={`${(Copied) ? 'fas fa-stamp' : 'fas fa-copy'}`} onMouseEnter={this.handleChordMarkLeave}></i>
                    </Button>
                </div>

                <div className={`lyrics-edit`}>
                    <textarea className='w-100 d-block' onKeyUp={this.handleTextEdit} onChange = {this.handleInputChange} style={{border : "0px",  background:(this.props.stage==='lyricsEdit')?"rgba(255, 255, 255, 0.8)":"rgba(255,255,255,0)", fontWeight:"300", fontSize:"0.95em", padding:'0px'}}></textarea>
                </div>
            </div>
            </Col>
            </Row>
            </Container>
        )
    }

    // indicate lyrics in textarea & dynamically handle textarea's height'
    handleLyricsDislpay() {
        
        var target = document.getElementById(`lyrics-item-${this.props.id}`);
        if (target) {
            var target_txtarea = target.querySelector('textarea');
            target_txtarea.value = this.state.lyrics;
            target_txtarea.style.fontFamily = (this.props.font==='正黑體')?'Noto Sans TC':(this.props.font==='新細明體')?'Noto Serif TC':(this.props.font==='標楷體')?'font1':'';
            target_txtarea.rows = target_txtarea.value ? (target_txtarea.value.match(/\n/g)? target_txtarea.value.match(/\n/g).length+1 : 1) : 0;
        }
    }

    handleTextEdit(e) {

        var hasUpdateLyrics = false;

        if (e.key === 'Enter') {//Enter
            var txt = document.querySelector(`#lyrics-item-${this.props.id} textarea`).value;
            var breakPoint = txt.indexOf('\n\n');

            if (breakPoint > 0 && txt[breakPoint+2] !== undefined) {
                //////////////////////
                var divided_str = txt.substring(breakPoint+2);
                this.props.addLyricsItem({
                    lyrics:txt,
                    dividedLyrics: divided_str,
                    id: this.props.id
                });
                hasUpdateLyrics = true;
            }
            ////////////////////
        } else if (e.key === 'Delete') { // delete
            var areaEle = document.querySelector(`#lyrics-item-${this.props.id} textarea`);
            var nextAreaVal = document.querySelector(`#lyrics-item-${this.props.id + 1} textarea`).value;
            var selectSta = areaEle.selectionStart;

            if (selectSta === areaEle.value.length) {
                this.props.mergeLyricsItem({
                    mtd: 'delete',
                    lyrics: nextAreaVal,
                    id: this.props.id + 1
                });
                hasUpdateLyrics = true;
            }
        } else if (e.key === 'Backspace') { // backspace
            var areaEle = document.querySelector(`#lyrics-item-${this.props.id} textarea`);
            var selectSta = areaEle.selectionStart;

            if (selectSta === 0) {
                this.props.mergeLyricsItem({
                    mtd: 'backspace',
                    lyrics: areaEle.value,
                    id: this.props.id
                });
                hasUpdateLyrics = true;
            }
        } else { // down arrow
            var areaEle = document.querySelector(`#lyrics-item-${this.props.id} textarea`);
            var areaVal = areaEle.value;
            var selectSta = areaEle.selectionStart;
            var anchor = areaVal.lastIndexOf('\n', areaVal.length - 1);
            //console.log(selectSta,"first test",this.props.id)
            if (this.state.preflag === 0 && this.state.nextflag === 0){
                if (selectSta > anchor)
                    this.setState({
                        nextflag : 1,
                    })
                if (selectSta <= areaEle.value.indexOf('\n'))
                    this.setState({
                        preflag : 1,
                    })
            }
            else {
                // reset the flag
                if (selectSta <= anchor){
                    this.setState({
                        preflag : 0,
                        nextflag : 0,
                    })
                }
                if (selectSta > areaEle.value.indexOf('\n')){
                    
                }

                let firstline = areaEle.value? (areaEle.value.indexOf('\n')==-1? areaEle.value.length : areaEle.value.indexOf('\n')) : 0;
                
                //console.log("flag test, pre",this.state.preflag," next ",this.state.nextflag)
                
                if (e.key === 'ArrowDown'  && (selectSta > anchor) && (selectSta <= areaVal.length) && (this.state.presSlectionstart === selectSta)) {
                    var nextAreaEle = document.querySelector(`#lyrics-item-${this.props.id + 1} textarea`);
                    if (nextAreaEle) {
                        // get cursor position will be on the fst line
                        var nextAreaVal = nextAreaEle.value;
                        var _l = selectSta - areaVal.lastIndexOf('\n', areaVal.length - 1) -1;
                        
                        let nextFirstLine = nextAreaVal? (nextAreaVal.indexOf('\n')==-1? nextAreaVal.length : nextAreaVal.indexOf('\n')) : 0;
                        var l = Math.min(_l, nextFirstLine);
                        // focus
                        nextAreaEle.focus();
                    //    console.log(l,"down test")
                        nextAreaEle.setSelectionRange(l, l);
                    }
                } else if (e.key === 'ArrowUp' && firstline >= selectSta && (this.state.presSlectionstart === selectSta) ) { // up arrow
                    var prevAreaEle = document.querySelector(`#lyrics-item-${this.props.id - 1} textarea`);
                    if (prevAreaEle) {
                        // get cursor position will be on the lst line
                        var prevAreaVal = prevAreaEle.value;
                        var _l = prevAreaVal.lastIndexOf('\n', prevAreaVal.length - 1) +1;
                        
                        var l = Math.max((prevAreaVal.length), (selectSta + _l));
                    //    console.log(selectSta,"seltets",this.props.id)
                        // focus
                        prevAreaEle.focus();
                        prevAreaEle.setSelectionRange(l, l);
                    }
                }
            }
            this.setState({
                presSlectionstart : selectSta,
            })
        }
        // dynamically handle textarea's height
        e.target.rows = e.target.value ? ((e.target.value.match(/\n/g)) ? e.target.value.match(/\n/g).length + 1 : 1) : 0;
    }

    // toggle chord selector
    handleChordEdit(e) {
        this.setState({
            chordSelectionDisplay: !this.state.chordSelectionDisplay
        });
    //    console.log(this.props.copiedChordMarkList);
    }

    // handle copied chord
    handleChordCopy(chordList) {
        console.log(this.props.Copied,"flag test ",this.props.id);
        if (this.props.Copied) {
            // get original length
            var originalLen = this.state.chordMarkList.length;

            // create new array to chordMarkList; 因為array是object，傳遞時是傳址而非傳值
            //，所以用setState或直接 = 改變的是參考位址而非array裡的值
            this.state.chordMarkList = this.state.chordMarkList.concat(this.props.copiedChordMarkList);

            // flush 掉原本的array
            this.state.chordMarkList.splice(0, originalLen);

            // 更新chordEditor的各chord數量紀錄
            this.state.chordMarkList.forEach(newChord => {
                this.props.chordAdd(newChord.chordName);
            });
        }

        this.props.copiedChange(chordList)
    }

    // add chord mark
    handleChordListAdd(e) {

        var rowEle = e.target.parentNode.parentNode;
        var chord = rowEle.querySelector(`#chord-select-${this.props.id}`).value;
        var offset = Math.round(rowEle.parentNode.getBoundingClientRect().x - document.querySelector('.lyrics-item').getBoundingClientRect().x) + 2 + 'px';

        var _addChord = (function (_chord) {
            this.state.chordMarkList.push({
                chordName: _chord,
                chord: this.props.ChordTable[_chord],
                idx: this.state.chordMarkList.length,
                offest: offset
            });
        }).bind(this);

        // let selector disapper
        this.setState({
            chordSelectionDisplay: false
        });

        // push one chord in chord mark list
        if (chord !== '自訂') {
            _addChord(chord);
            // pop event to ChordEditor
            this.props.chordAdd(chord);
        } else {
            // pop event to ChordEditor with callback
            this.props.chordAdd(chord, -1, (newChordName) => {
                _addChord(newChordName);
            });
        }

    }

    
    handleChordMarkEnter() {
        this.setState({
            chordMarkDisplay: true
        });
    }

    handleChordMarkLeave(e) {
        //console.log(e.target);
        if (!this.state.chordSelectionDisplay) {
            this.setState({
                chordMarkDisplay: false
            });
        }
    }

    handleChordMarkDisplay() {
        this.setState({
            chordMarkDisplay: true
        });
    }
    // handle chord mark dynamically move with cursor
    handleChordMarkMove(e) {
        var mark = e.target.querySelector('.chord-mark');
        if ((mark)&&(!this.state.chordSelectionDisplay)) {
            var offest = Math.round(e.clientX - mark.clientWidth / 2 - e.target.getBoundingClientRect().x) + 'px';
            mark.style.left = offest;
            e.target.querySelector('.chord-selector').style.left = offest;
        }
    }

    handleInputChange(e) {
        this.setState({lyrics : e.target.value});
        this.props.editLyricsItem({
            lyrics: e.target.value,
            id: this.props.id
        });
    }

    handleChordDelete(e) {
        // 更新ChordEditor中的各chord數量紀錄
        this.state.chordMarkList.forEach(oldChord => {
            this.props.chordRemove(oldChord.chordName);
        });
        this.setState({ chordMarkList: new Array()    });
    }

    handleRemoveChordMark(e, _idx, chordName) {
        
        this.state.chordMarkList.splice(_idx, 1);
        this.setState({});
        this.props.chordRemove(chordName);
    }
}