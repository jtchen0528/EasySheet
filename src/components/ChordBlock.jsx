import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col
} from 'reactstrap';

import './ChordBlock.css';

export default class LyricsItem extends React.Component {
    static Protopytes = {
        id: PropTypes.number,
        font: PropTypes.string,
        content: PropTypes.object,
        ChordTable: PropTypes.object,
        chordAdd: PropTypes.func,
        chordRemove: PropTypes.func,
        chordHasSelected: PropTypes.func,
        setChordBlock: PropTypes.func,
        stage: PropTypes.string,
        template: PropTypes.number
    };

    constructor(props) {
        super(props);

        this.state = {
            type: props.type || 'chord',// or , text
            chordSelectionDisplay: false,
            tagSelectionDisplay: false,
            text: '',
            chord: null,
            imgSrc: null,
            imgText: ''
        }

        this.blockInit = this.blockInit.bind(this);
        this.handleTagSwitch = this.handleTagSwitch.bind(this);
        this.handleChordChange = this.handleChordChange.bind(this);
        this.handleChordSelectionDisplay = this.handleChordSelectionDisplay.bind(this);
        this.handleChordSelect = this.handleChordSelect.bind(this);
        this.handleNavbarToggle = this.handleNavbarToggle.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleImageUpload = this.handleImageUpload.bind(this);
        this.handleUpdateContent = this.handleUpdateContent.bind(this);
    }

    componentDidMount() {
        this.blockInit();
    }

    // when chord change
    componentDidUpdate(prevProps) {

        if (this.props.content.type === 'chord' && this.props.content.val !== this.state.chord) {
            this.blockInit();
        }
    }

    // render
    render() {
        const { id, ChordTable, stage, content, template } = this.props;
        const { type, chordSelectionDisplay, tagSelectionDisplay, chord, imgSrc } = this.state;

        // chord selector's selection
        let optChord = [], _chord;
        for (_chord in ChordTable) {
            optChord.push(<option>{_chord}</option>)
        }

        // content
        let _content = ''
        switch (type) {
            case 'chord':
                _content = (
                    <div className={`chord`}>
                        <i className={`fas fa-times-circle ${(tagSelectionDisplay) ? 'hover' : ''}`} data-box-type="reset" onClick={this.handleTagSwitch}></i>
                        {(!chord) ?
                            <div className={`intro is-empty ${(stage == 'print' || stage == 'prePrint') ? 'fade' : ''}`}>
                                <p>點擊以新增和弦</p>
                                <i className="fas fa-plus-circle"></i>
                            </div>
                            : ''}
                        <canvas />
                    </div>
                );
                break;
            case 'text':
                _content = (
                    <div className={`text`}>
                        <i className={`fas fa-times-circle ${(tagSelectionDisplay) ? 'hover' : ''}`} data-box-type="reset" onClick={this.handleTagSwitch}></i>
                        <textarea placeholder={(stage == 'print' || stage == 'prePrint') ? '' : 'type here...'} onChange={this.handleUpdateContent} defaultValue={content.val}></textarea>
                    </div>
                );
                break;
            case 'image':
                if (imgSrc) {
                    _content = (
                        <Label for={`content-img-${id}`} className={`image`} style={{ cursor: 'pointer' }}>
                            <i className={`fas fa-times-circle ${(tagSelectionDisplay) ? 'hover' : ''}`} data-box-type="reset" onClick={this.handleTagSwitch}></i>
                            <img src={imgSrc}></img>
                            <Input type="file" name="file" id={`content-img-${id}`} className='d-none' onChange={this.handleImageUpload} />
                            <input type="text" name="text" placeholder={(stage == 'print' || stage == 'prePrint') ? '' : 'type here...'} onChange={this.handleUpdateContent} defaultValue={content.val}/>
                        </Label>
                    );
                } else {
                    _content = (
                        <Label for={`content-img-${id}`} className={`image is-empty ${(stage == 'print' || stage == 'prePrint') ? 'fade' : ''}`} style={{ cursor: 'pointer' }}>
                            <i className={`fas fa-times-circle ${(tagSelectionDisplay) ? 'hover' : ''}`} data-box-type="reset" onClick={this.handleTagSwitch}></i>
                            <p>點擊以新增圖片</p>
                            <i className="fas fa-plus-circle"></i>
                            <Input type="file" name="file" id={`content-img-${id}`} className='d-none' onChange={this.handleImageUpload} />
                            <input type="text" name="text" placeholder={(stage == 'print' || stage == 'prePrint') ? '' : 'type here...'} onChange={this.handleUpdateContent} defaultValue={content.val} />
                        </Label>
                    );
                }
                break;
            default: console.log(type); break;
        }

        return (
            <div id={`chord-block-${id}`} className="box" style={{ fontFamily: this.props.font }} onMouseLeave={this.handleNavbarToggle} onMouseEnter={this.handleNavbarToggle}>
                <nav className={`${(tagSelectionDisplay) ? 'hover' : ''}`}>
                    <span className={`tab fas fa-guitar ${(type === 'chord') ? 'active' : ''}`} data-box-type="chord" onClick={this.handleTagSwitch} title='chord'></span>
                    <span className={`tab fas fa-quote-left ${(type === 'text') ? 'active' : ''}`} data-box-type="text" onClick={this.handleTagSwitch} title='text'></span>
                    <span className={`tab fas fa-file-image ${(type === 'image') ? 'active' : ''}`} data-box-type="image" onClick={this.handleTagSwitch} title='image'></span>
                </nav>
                <div className={`content ${(tagSelectionDisplay) ? 'hover' : ''}`}>
                    <div onClick={this.handleChordSelectionDisplay}>
                        {(chordSelectionDisplay)?
                            <div className={`chord-selector ${(template)? 'right' : 'down'}-display`}>
                                <Form>
                                    <FormGroup>
                                        <Row className='w-100'>
                                            <Col sm='8'>
                                                <Input type="select" name="select" id={`chord-select-${id}`} defaultValue="自訂">
                                                    {optChord}
                                                </Input>
                                            </Col>
                                            <Col sm='4'><Button className='chord-markSubmit' color="success" onClick={this.handleChordSelect}>Go</Button></Col>
                                        </Row>
                                    </FormGroup>
                                </Form>
                            </div>
                        :''}
                        {_content}
                    </div>
                </div>
            </div>
        )
    }

    blockInit(props = this.props.content) {
        
        const { type, val, imgSrc } = props;
        switch (type) {
            case 'chord':
                this.handleChordChange(val);
                this.setState({ type: type, chord: (val) ? val : '' });
                break;
            case 'text':
                this.setState({ type: type, text: val });
                break;
            case 'image':
                this.setState({ type: type, imgSrc: (imgSrc) ? imgSrc : null, imgText: val });
                break;
            default: console.log(type, val); break;
        }
    }

    // switch tag between 'chord' & 'text'
    handleTagSwitch(e) {
        var nextType = e.target.getAttribute('data-box-type');
        // 取得上層block element
        var blockEle = e.target.parentNode.parentNode;

        if (nextType !== this.state.type) {

            // remove 掉 chord selector
            if (this.state.type === 'chord' && this.state.chordSelectionDisplay) this.state.chordSelectionDisplay = false;
            // 紀錄text
            if (this.state.type === 'text') this.state.text = blockEle.querySelector(`textarea`).value;
            // 紀錄image的source
            if (this.state.type === 'image') {
                this.state.imgSrc = (blockEle.querySelector(`img`)) ? blockEle.querySelector(`img`).src : '';
                this.state.imgText = blockEle.querySelector(`input[type=text]`).value;
            }

            this.setState({
                type: nextType
            }, () => {
                var currentState = this.state.type, val ='', imgSrc ='';
                //若tag被切換至chord，redraw chord
                if (currentState === 'chord') {
                    this.handleChordChange(this.state.chord);
                    val = this.state.chord;
                }
                //若tag被切換至text，rewrite text
                else if (currentState === 'text') {
                    blockEle.querySelector(`textarea`).value = this.state.text;
                    val = this.state.text;
                }
                //若tag被切換至image，rewrite image text
                else if (currentState === 'image') {
                    blockEle.querySelector(`input[type=text]`).value = this.state.imgText;
                    val = this.state.imgText;
                    imgSrc = this.state.imgSrc;
                }
                //若按close，reset block
                else if (currentState === 'reset') {
                    if(this.state.chord) this.props.chordRemove(this.state.chord);
                    this.setState({
                        type: 'chord',
                        chord: '',
                        text: '',
                        imgText: '',
                        imgSrc: null
                    }, () => {
                        this.handleChordChange('');
                    });
                    val = '';
                    imgSrc = null;
                }

                // 把事件pop上去給chordEditor
                this.props.setChordBlock({
                    type: (currentState === 'reset') ? 'chord' : currentState,
                    val: val,
                    imgSrc: imgSrc
                }, this.props.id, (currentState==='reset'));
            });
        }
    }

    handleChordChange(chordName) {

        const padding = 8;
        const lineWidth = 1;
        // canvas initialize
        var c = document.querySelector(`#chord-block-${this.props.id} canvas`);

        if (!c) {
            console.error('[Chord Box] no root element');
            return;
        }

        c.width = c.parentNode.clientWidth;
        c.height = c.parentNode.clientHeight;
        var ctx = c.getContext('2d');
        var chordArr = (this.props.ChordTable[chordName]) ? this.props.ChordTable[chordName] : [];
        
        // 如果是delete，清除canvas
        if (!chordArr || chordArr.length < 6) {
            ctx.clearRect(0, 0, c.width, c.height);
            return;
        }

        var pd = padding;
        var lw = lineWidth;
        var capo = 25;
        var max = 0;

        // find min(equals to capo) & max to decide how many frets
        for (let i = 0; i < 6; i++) {
            capo = Math.min(capo, chordArr[i]);
            max = Math.max(max, chordArr[i]);
        }

        // offest dot
        var dot = chordArr.map( d => {
            return (d - capo + ((capo === 0) ? 0 : 1));
        });

        //this.render = function () {
        var cw = c.width - 2 * pd;
        var ch = c.height - 2 * pd;

        // decide col gap
        var col_gap = (cw) / 8;

        // decide row gap & number
        var row_line_number = Math.max(max - capo + ((capo === 0) ? 0 : 1), 3);
        var row_gap = ch / (row_line_number + 0.25);

        // background
        /*ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);*/

        // draw bottom line or indicate capo
        ctx.fillStyle = '#000';
        if (capo < 2) {
            ctx.lineWidth = 8 * lw;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pd + col_gap*3, pd);
            ctx.lineTo(pd + col_gap * 8, pd);
            ctx.stroke();
        } else {
            ctx.font = col_gap + 'px Arial';
            ctx.textBaseline = 'middle';
            ctx.fillText(capo, col_gap * 3-10, pd + row_gap / 2);
        }

        // row lines
        ctx.lineWidth = lw;
        for (let i = 0; i <= row_line_number; i++) {
            ctx.beginPath();
            ctx.moveTo(pd + col_gap*3, pd + row_gap * i);
            ctx.lineTo(pd + col_gap * 8, pd + row_gap * i);
            ctx.stroke();
        }

        // col lines & dot & tune
        var tune = ['E', 'A', 'D', 'G', 'B', 'e'];
        var btm_l = c.height - pd/2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(pd + col_gap * (i + 3), pd);
            ctx.lineTo(pd + col_gap * (i + 3), pd + ch - 0.25 * row_gap);
            ctx.stroke();

            // dot
            if (dot[i]) {
                ctx.beginPath();
                ctx.arc(pd + col_gap * (3 + i), pd + row_gap * (dot[i] - 0.5), (Math.min(row_gap, col_gap)) / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // tune
            ctx.font = Math.floor(col_gap*2/3 ) + 'px Arial';
            ctx.textBaseline = 'Alphabetic';
            ctx.fillText(tune[i], pd + col_gap * (i + 3) - Math.floor(col_gap / 2) / 2, btm_l);
        }
        // chord name
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = "center";
        ctx.fillText(chordName, pd+col_gap, c.height / 2);

        this.props.setChordBlock({ type: 'chord', val: chordName }, this.props.id);
    }

    handleChordSelectionDisplay(e) {
        if (this.state.type === 'text' || this.state.type === 'image' || this.props.stage === 'prePrint' || this.props.stage === 'print') {
            this.setState({
                chordSelectionDisplay: false
            });
        } else if (this.state.type === 'chord' && e.target.nodeName === 'CANVAS') {
            this.setState({
                chordSelectionDisplay: !this.state.chordSelectionDisplay
            });
            return false;
        }
    }

    handleChordSelect(e) {
        var rowELe = e.target.parentNode.parentNode;
        var addChordName = rowELe.querySelector('select').value;

        if (this.props.chordHasSelected(addChordName) >= 0) {
            console.error('this chord has been assigned.');
            return;
        }

        // don't need to update, because this.props.chordAdd will update this
        this.state.chordSelectionDisplay = false;
        this.state.tagSelectionDisplay = false;

        var _addChord = (function (chordName) {
            this.handleChordChange(chordName);
            if (this.state.chord) this.props.chordRemove(this.state.chord);
            this.state.chord = chordName;
        }).bind(this);

        if(addChordName !== '自訂') {
            if (this.state.chord !== addChordName) {
                _addChord(addChordName);
                this.props.chordAdd(addChordName, this.props.id);
            }
        } else {
            this.props.chordAdd(addChordName, this.props.id, (newChordName) => {
                _addChord(newChordName);
            });
            this.setState({ chordSelectionDisplay: false });
        }
    }

    handleMouseLeave() {
        this.setState({
            chordSelectionDisplay: false
        });
    }
    handleNavbarToggle() {
        
        if (this.props.stage === 'prePrint' || this.props.stage === 'print' || this.props.stage === 'chord') {
            this.setState({
                tagSelectionDisplay: false
            });
            return;
        }else if (!this.state.chordSelectionDisplay) {
            this.setState({
                tagSelectionDisplay: !this.state.tagSelectionDisplay
            });
        }
    }

    handleImageUpload(e) {
        // 如果檔案大於1個，return
        if (e.target.files.length > 1) {
            console.error('only accept 1 file.');
            return;
        }
        var file = e.target.files[0];
        // 如果檔案格式錯誤，return
        if (!file.type.match(/jpeg/g) && !file.type.match(/image/g) && !file.type.match(/jpg/g)) {
            console.error('file format only accepts .jpg, .jpeg, .png.');
            return;
        }
        var reader = new FileReader();
        reader.onloadend = (function() {
            this.setState({
                imgSrc: reader.result
            });
            this.state.imgSrc = reader.result;
            this.props.setChordBlock({ type: 'image', imgSrc: reader.result, val: this.state.imgText }, this.props.id);
        }).bind(this);
        reader.readAsDataURL(file);
    }

    handleUpdateContent(e) {
        if (this.props.stage !== 'print' && this.props.stage !== 'prePrint') {
            if (this.state.type === 'text') this.props.setChordBlock({ type: 'text', val: e.target.value }, this.props.id);
            else if (this.state.type === 'image') this.props.setChordBlock({ type: 'image', val: e.target.value, imgSrc: this.state.imgSrc }, this.props.id);
        }
    }
}