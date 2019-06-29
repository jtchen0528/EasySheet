import React from "react";
import {Auth,Hub} from "aws-amplify";
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import {
    Button,
    Container,
    Row,
    Col,  
    Label,
    Input,
    FormFeedback,
    FormGroup,
} from 'reactstrap';

import {
    GoogleButton,
    FacebookButton,
    AmazonButton,
    OAuthButton,
    Auth0Button
} from 'aws-amplify-react';

import {userExist, createUser} from 'api/user.js';
import {createChordTable} from 'api/userChord.js';

import Confirm from'components/confirm.jsx'

import './custom.css';

export default class SignIn extends React.Component {
    constructor(props){
        super(props);
        
        this.inputEl = null;

        this.state = {
            signValue : {email:"",password:""},
            emailerr:false,
            passworderr:false,
            emailFeedback:"",
            passwordFeedback:"",
        }

        this.signIn = this.signIn.bind(this);
        this.checkUser = this.checkUser.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleSignerr = this.handleSignerr.bind(this);
    }

    componentDidMount(){ 
    }

    render(){
        let renderitem
        if(this.props.authState === "signIn")
            renderitem =
                <Container className = "form">
                    <Row>        
                         <Col xs="6" style={{paddingTop:'150px'}}>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.7rem',  textAlign:'center'}}>登入EasySheet！</p>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}}>即可享有雲端儲存、請求樂譜等功能！</p>
                        </Col>
                        <Col xs='6'  style={{textAlign:"center", paddingTop:'40px'}}>
                        <Row>
                            <Col style={{textAlign:'center'}}>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem', paddingTop:'15px'}}>用Google登入</p>
                            </Col>

                            <Col xs='6'>
                                    {this.google("962272029336-1doo6nqpngfq5i0baolj73ia803hkqhe.apps.googleusercontent.com")}
                            </Col> 
                        </Row>
                        <Row>
                            <Col style={{textAlign:'center'}}>
                                <p style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}>或是EasySheet帳號</p>
                            </Col>
                        </Row>
                        <FormGroup row>
                            <Label for="email" xs={4}  style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}} >電子信箱</Label>
                            <Col xs={8}>
                            <Input  invalid ={this.state.emailerr? true:false} name="email"  type='email' id="email" placeholder="請輸入電子信箱"   innerRef={el => {this.inputEl = el}} value={this.state.signValue.email} onChange={this.handleUserChange} required  style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                            <FormFeedback>{this.state.emailFeedback}</FormFeedback>
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="password" xs={4}  style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem',  textAlign:'center'}}>密碼</Label>
                        <Col xs={8}>
                            <Input  invalid ={this.state.passworderr? true:false} name="password" type='password' id="password" placeholder="請輸入密碼"   innerRef={el => {this.inputEl = el}} value={this.state.signValue.password} onChange={this.handlePasswordChange} required  style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}/>
                            <FormFeedback>{this.state.passwordFeedback}</FormFeedback>
                        </Col>  
                        </FormGroup>
                        </Col>  
                    </Row> 
                    <Row style={{paddingTop:'50px'}}>
                        <Col style={{textAlign: 'center', paddingTop: '20px'}} xs='3'>
                            </Col>
                            <Col xs='3'>
                            </Col>
                            <Col style={{textAlign: 'center', paddingTop: '20px'}} xs='3'>
                                <Button type = "submit" outline color="secondary" style={{fontFamily:'Noto Sans TC', fontSize:'1.2rem'}}><Link to='/signup'>創建帳號</Link></Button>
                            </Col>
                            <Col style={{textAlign: 'center', paddingTop: '20px'}} xs='3'>
                                <Button type = "submit"  color="success" style={{fontFamily:'Noto Sans TC', fontSize:'1.5rem'}} onClick = {()=>this.signIn({username:this.state.signValue.email,password:this.state.signValue.password})}>登入</Button>
                            </Col>
                    </Row>
                </Container>
        else if(this.props.authState === "confirm")
            renderitem = 
                <Confirm handleAuthStateChange={this.props.handleAuthStateChange} email={this.state.signValue.email}/>
        
        return(
            <div>
                {renderitem}
            </div>
        )
    }
    
    signIn(userdata){
        
        Auth.signIn(userdata).then(user => {     
            let data = {}
            userExist(user.username).then(res=>{
                if(res.length === 0) {
                    let userid = user.username;
                    let nickname = user.attributes.nickname;
                    let name = user.attributes.name? user.attributes.name:'';
                    let email = user.attributes.email;
                    createUser(userid,email,nickname,name).then(res=>{
                        data = {
                            userid : res.userid,
                            name : res.name,
                            nickname : res.nickname,
                            email : res.email,
                        }
                        console.log("create success");
                    })
                    createChordTable(user.username);

                }
                else {
                    data = {
                        userid : res[0].userid,
                        name : res[0].name,
                        nickname : res[0].nickname,
                        email : res[0].email,
                    }
                    console.log("exist")
                } 
            })
            this.props.handleAuthStateChange("signedIn",data);
            setTimeout(() => {
                window.location.href = '/';
            }, 300);
            
        })
        .catch(err => {
            console.log(err.message)
            this.handleSignerr(err.message)
        });
        
    }

    google(google_client_id) {
        if (!google_client_id) { return null; }
        /*
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        }).then(user => console.log(user))
        .catch(err => console.log(err));
        */
       
        return <GoogleButton
                google_client_id={google_client_id}
                onStateChange = {this.checkUser}
              />;
              
    }

    handleSignerr(err){
        let init = {
            emailerr:false,
            passworderr:false,
            emailFeedback:"",
            passwordFeedback:"",
        }
        switch(err){
            case"User is not confirmed.":
                this.props.handleAuthStateChange("confirm")
                break;
            case"User does not exist.":
                this.setState({
                    ...init,
                    emailerr:true,
                    emailFeedback:"查無此帳號"
                })
                break;
            case"Incorrect username or password.":
                this.setState({
                    ...init,
                    emailerr:true,
                    emailFeedback:"帳號或密碼錯誤"
                })
                break;
            default:
        }
    }

    handleUserChange(e){
        this.setState({
            signValue : {email : e.target.value,password : this.state.signValue.password}
        })
    }

    handlePasswordChange(e){
        this.setState({
            signValue : {email : this.state.signValue.email,password : e.target.value}
        })
    }

    checkUser(){
        
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        }).then(user => {
            if(user){
                let data = {}
                // For google
                userExist(user.id).then(res=>{
                    if(res.length === 0) {
                        createUser(user.id,user.email,'',user.name).then(res=>{
                            data = {
                                userid : res.userid,
                                name : res.name,
                                nickname : res.nickname,
                                email : res.email,
                            }
                            console.log("create success");
                        })
                        createChordTable(user.id);
                    }
                    else {
                        data = {
                            userid : res[0].userid,
                            name : res[0].name,
                            nickname : res[0].nickname,
                            email : res[0].email,
                        }
                        console.log("exist")
                    } 
                })
                this.props.handleAuthStateChange("signedIn",data)
                setTimeout(() => {
                    window.location.href = '/';
                }, 300);
            }
            else{
                this.props.handleAuthStateChange("signIn")
            }
        })
        .catch(err => console.log(err));
        
    }

}

