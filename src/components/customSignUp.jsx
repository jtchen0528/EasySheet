import React from "react";
import {Auth} from "aws-amplify";
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
    FormFeedback
} from 'reactstrap';

import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

import {
    GoogleButton,
    FacebookButton,
    AmazonButton,
    OAuthButton,
    Auth0Button
} from 'aws-amplify-react';

import Amplify from 'aws-amplify';
import awsmobile from '../aws-exports';

import Confirm from'components/confirm.jsx'

import './custom.css';

Amplify.configure(awsmobile);
export default class SignUp extends React.Component {
    constructor(props){
        super(props);
        
        this.inputEl = null;

        this.state = {
            
            username:'',
            password:'',
            email:'',
            phonenumber:'',
            nickname:'',
            passworderr:false,
            emailerr:false,
            passwordfeedback:"",
            emailfeeback:""
        }

       

        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleNicknameChange = this.handleNicknameChange.bind(this);
        this.handleCodeChange = this.handleCodeChange.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
        this.handleSignUperr = this.handleSignUperr.bind(this);
    }

    componentDidMount(){
    }

    render(){
        let data = {
            username:this.state.username,
            password:this.state.password,
            email:this.state.email,
            nickname:this.state.nickname
        }
        let renderitem

        console.log(this.props.authState)
        if (this.props.authState === "signIn")

            renderitem =      
                    <Container className = "form" style={{padding:'50px'}}>
                        <Row>
                            <Col xs="6">
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.7rem',  textAlign:'center', paddingTop:'80px'}}>註冊EasySheet！</p>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}}>即可享有雲端儲存、請求樂譜等功能！</p>
                            </Col>
                            <Col xs="6" style={{textAlign:"center", paddingTop:'20px'}} >
                            <FormGroup row>
                                <Label for="username"  style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}} xs={4}>帳號</Label>
                                <Col xs={8}>
                                <Input  name="username" id="username" placeholder="請輸入帳號"  innerRef={el => {this.inputEl = el}} value={this.state.username} onChange={this.handleUserChange} style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                                </Col>
                             </FormGroup>
                            <FormGroup row>
                                <Label for="nickname" style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}} xs={4}>姓名/暱稱</Label>
                                <Col xs={8}>
                                <Input  name="nickname" id="nickname" placeholder="請輸入姓名或暱稱"   innerRef={el => {this.inputEl = el}} value={this.state.nickname} onChange={this.handleNicknameChange} style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="email" style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}} xs={4}>電子信箱</Label>
                                <Col xs={8}>
                                <Input invalid ={this.state.emailerr? true:false} type="email" name="email" id="email" placeholder="請輸入電子信箱"   innerRef={el => {this.inputEl = el}} value={this.state.email} onChange={this.handleEmailChange} style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                                <FormFeedback>{this.state.emailfeeback}</FormFeedback>
                                </Col>
                             </FormGroup>
                            <FormGroup row>
                                <Label for="password"  style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}} xs={4}>密碼</Label>
                                <Col xs={8}>
                                <Input invalid ={this.state.passworderr? true:false} type="password" name="password" id="password" placeholder="請輸入密碼"   innerRef={el => {this.inputEl = el}} value={this.state.password} onChange={this.handlePasswordChange} style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                                <FormFeedback>{this.state.passwordfeedback}</FormFeedback>
                                </Col>
                            </FormGroup>
                            <Row>
                            <Col style={{textAlign:'center'}}>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1rem'}}>＊密碼需要英文數字至少各一個＊</p>
                            </Col>
                        </Row>
                            </Col>  
                        </Row> 
                        <Row>
                            <Col style={{textAlign: 'center', paddingTop: '20px'}} xs='3'>
                            <Link to='/signin'><Button color="secondary" style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem'}}>返回</Button></Link>
                            </Col>
                            <Col xs='6'>
                            </Col>
                            <Col style={{textAlign: 'center', paddingTop: '20px'}} xs='3'>
                                <Button type = "submit" color="success" style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem'}} onClick = {()=>this.handleSignUp(this.state.email,this.state.nickname,this.state.password,this.state.email)}>送出</Button>
                            </Col>
                        </Row>
                    </Container>
            else if (this.props.authState === "confirm")
                renderitem =     
                    <Confirm handleAuthStateChange={this.props.handleAuthStateChange} email={this.state.email}/>
                
            return (
            <div>
                {renderitem}
            </div>    
            )
    }

    handleUserChange(e){
        this.setState({
            username:e.target.value
        })
    }
    
    handlePasswordChange(e){
        this.setState({
            password:e.target.value
        })
    }

    handleNicknameChange(e){
        this.setState({
            nickname:e.target.value
        })
    }

    handleEmailChange(e){
        this.setState({
            email:e.target.value
        })
    }

    handleCodeChange(e){
        this.setState({
            code:e.target.value
        })
    }

    handleSignUp(username,nickname,password,email){
        
        Auth.signUp({
            username,
            password,
            attributes: {
                email, // optional
                nickname, // optional - E.164 number convention
                // other custom attributes
            },
            validationData: [] //optional
        })
        .then(data=>{
            this.props.handleAuthStateChange("confirm")
        })
        .catch(err=>{
            if(err.message){
                this.handleSignUperr(err.message);
            }
            else{
                this.handleSignUperr(err);
            }
        })
        
    }

    handleSignUperr(err){
        let init= {
            passworderr:false,
            emailerr:false,
            passwordfeedback:"",
            emailfeeback:""
        }
        switch (err){
            case "An account with the given email already exists.":
                this.setState({
                    ...init,
                    emailerr:true,
                    emailfeeback:"電子郵已存在"
                })
                break;
            case "Username cannot be empty":
                this.setState({
                    ...init,
                    emailerr:true,
                    emailfeeback:"電子郵件是必須的"
                })
                break;
            case "Password cannot be empty":
                this.setState({
                    ...init,
                    passworderr:true,
                    passwordfeedback:"密碼請勿空白"
                })  
                break;
            case"1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6":
                this.setState({
                    ...init,
                    passworderr:true,
                    passwordfeedback:"密碼必須大於6個英數字"
                })  
                break;
        }

    }
}
