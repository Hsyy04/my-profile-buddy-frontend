import React, {useState, useRef, useEffect} from "react";
import "./Chatbot.css";
import userAvatar from "../../images/user-avatar.png";
import botAvatar from "../../images/bot-avatar.png";
import { Drawer, Input, Spin} from 'antd';
import { Content } from "antd/es/layout/layout";
import ChatHeader from "./ChatHeader";
import SessionList from "./SessionList";
import { useLocation } from "react-router-dom";
import ChangeProfile from "../ChangeProfile";
import { backendUrl, taskOptions, userPid } from "../../utils/Const";
import Markdown from 'react-markdown'
const { Search } = Input;
const Messages = ({allmessage}) => {
    return (
        <>
            {allmessage.map((msg, index, input) => (
                <div class={` message ${msg.sender}`} key={index}>
                    <img class="avatar" src={msg.avatar} alt="avatar"/>
                    <div class="text"> 
                        <Markdown style={{margin:0, padding:0}}>{msg.message}</Markdown>
                    </div>
                </div>
            ))}
        </>
    );
}

const Chatbot = (
    {title}
) =>{
    const [enabeld, setEnabled] = useState(true);
    const [message, setMessage] = useState("");
    const chatEndRef = useRef(null);
    const [showSession, setShowSession] = useState(false);
    const [allSessions, setAllSessions] = useState([]);
    const location = useLocation();
    const [nowsid, setNowSid] = useState(0); 
    const [chatHistory, setChatHistory] = useState([]);

    //处理更改画像的问题
    const [action, setAction] = useState([]);

    //处理加载过慢问题
    const [loading, setLoading] = useState(false);

    const addSession = () => {
        console.log("add session");
        setShowSession(false);
        setEnabled(false);
        setLoading(true);
        setNowSid(-1);
        setAllSessions(allsessions=>[...allsessions, {sid:-1, task:title, platform:0, summary:"NEW ONE"}]);
        //这里需要从服务端获取一条默认的系统消息
        if (title === 0){
            fetch(`${backendUrl}/get_alignment`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({pid:userPid,  platform:0}),
            }).then(response => response.json())
            .then(data=>{
                console.log(data['code']);
                const res_data = data['data']
                const newMessage = {sender: "bot", message: res_data['response'], avatar: botAvatar};
                setChatHistory([newMessage]);
                setEnabled(true);
                setLoading(false);
            })
        } else if(title === 2){
            fetch(`${backendUrl}/get_feedback`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({pid:userPid,  platform:0}),
            }).then(response => response.json())
            .then(data=>{
                console.log(data['code']);
                const res_data = data['data']
                const newMessage = {sender: "bot", message: res_data['response'], avatar: botAvatar};
                setChatHistory([newMessage]);
                setEnabled(true);
                setLoading(false);
            });
        }
    }
    //打开对话的显示
    useEffect(() => {
        setEnabled(false);
        setLoading(true);
        fetch(`${backendUrl}/chatbot/get_sessions`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({pid:userPid, task:title}), 
        })
        .then(response => response.json())
        .then(data=>{
            console.log(data['code']);
            const res_data = data['data']
            setAllSessions(res_data['sessions']);
            let initSessions = res_data['sessions'];
            if (initSessions.length > 0){
                setNowSid(initSessions[initSessions.length-1]['sid']);
                fetch(`${backendUrl}/chatbot/get_history/${initSessions[initSessions.length-1]['sid']}`,{
                    method: 'GET'
                }).then(response => response.json())
                .then(data=>{
                    console.log(data['code']);
                    const res_data = data['data']
                    setChatHistory(res_data['messages'].map(element => {
                       return {
                            sender: element['sender'],
                            message: element['content'],
                            avatar: element['sender']==="user"?userAvatar:botAvatar
                       } 
                    }));
                    setEnabled(true);
                    setLoading(false);
                })
                .catch((error)=>{
                    console.error('Error:',error);
                });
            }
            else{
                if (title === 0){
                    fetch(`${backendUrl}/get_alignment`,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json', 
                        },
                        body: JSON.stringify({pid:userPid,  platform:0}),
                    }).then(response => response.json())
                    .then(data=>{
                        console.log(data['code']);
                        const res_data = data['data']
                        const newMessage = {sender: "bot", message: res_data['response'], avatar: botAvatar};
                        setChatHistory([newMessage]);
                        setEnabled(true);
                        setLoading(false);
                    })
                } else if(title === 2){
                    fetch(`${backendUrl}/get_feedback`,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json', 
                        },
                        body: JSON.stringify({pid:userPid,  platform:0}),
                    }).then(response => response.json())
                    .then(data=>{
                        console.log(data['code']);
                        const res_data = data['data']
                        const newMessage = {sender: "bot", message: res_data['response'], avatar: botAvatar};
                        setChatHistory([newMessage]);
                        setEnabled(true);
                        setLoading(false);
                    });
                }
            }
        })
        .catch((error)=>{
            console.error('Error:',error);
            
        }); 
    }, [location, title])

    //查看以前的session
    function getHisChat(sid){
        setShowSession(false);
        if (sid === -1){ //相当于点击了新建的.
            return ;
        }
        fetch(`${backendUrl}/chatbot/get_history/${sid}`)
        .then(response => response.json())
        .then(data=>{
            console.log(data['code']);
            const res_data = data['data']
            setChatHistory(res_data['messages'].map(element => {
                return {
                     sender: element['sender'],
                     message: element['content'],
                     avatar: element['sender']==="user"?userAvatar:botAvatar
                } 
             }));
        })
        .catch((error)=>{
            console.error('Error:',error);
            
        });
        setNowSid(sid);
    }

    useEffect(() => {
        // 每当chatHistory变化时，执行滚动到底部的操作
        const chatBody = chatEndRef.current;
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight; // 滚动到底部
        }
        
    }, [chatHistory]); // 滚动到底部


    //发送消息后的处理逻辑
    const sendMessage = () => {
        if (message === "") { //检查消息时候合法
            return;
        }

        //新建用户消息
        const userMessage = {sender: "user", message: message, avatar: userAvatar};
        setChatHistory(chatHistory => [...chatHistory, userMessage]);
        setEnabled(false);
        
        fetch(`${backendUrl}/chatbot`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({sid:nowsid, sender:"user", content:userMessage.message, pid:userPid, task:title, platform:0}), 
        })
        .then(response => response.json())
        .then(data=>{
            console.log(data['code']);
            const res_data = data['data']
            
            if (nowsid !== res_data['sid']){ //说明是新保存的对话session
                setAllSessions(allsessions=>{
                    return allsessions.map(element => 
                        element['sid'] === nowsid ? {sid: res_data['sid'], pid:res_data['pid'], task:res_data['task'], platform:res_data['platform'], summary:res_data['summary']} : element
                      );
                    });
                setNowSid(res_data['sid']);
            }

            if(res_data.action.length!==0){
                //需要弹出对话框, 然后让用户判断是否更新画像
                setAction(res_data.action);
            }
            else{
                const newMessage = {sender: "bot", message: res_data['content'], avatar: botAvatar};
                setChatHistory(chatHistory => [...chatHistory, newMessage]);
            }
            setEnabled(true); //输入框可以继续输入
        })
        .catch((error)=>{
            console.error('Error:',error);   
        });
   
        setMessage("");
    }

    return (
        <>
            <Content style={{
                height:"430px",
                width:"100%",
            }}
            >
                <ChatHeader title={taskOptions[title]} clickMore={()=>{setShowSession(true)}}/>
                <Spin spinning={loading}>
                <Content class="chat-container">
                    <div class="chat-body" id="chat-body" ref={chatEndRef}>
                        <Messages allmessage={chatHistory}/>
                    </div>
                    <div class="chat-footer">
                        <Search
                            placeholder="Input here..."
                            allowClear
                            onChange={
                                (e) => {
                                    setMessage(e.target.value);
                            }}
                            value={message}
                            enterButton="Send"
                            size="large"
                            onSearch={sendMessage}
                            enabeld={enabeld}
                            loading={!enabeld}
                            />
                    </div>
                </Content>
                </Spin>
            </Content>
            <Drawer 
                title="Session List" 
                open={showSession}
                style={{padding:0, margin:0, paddingBlock:0, paddingInline:0, backgroundColor:"#f0f2f5"}} 
                onClose={()=>setShowSession(false)}>
                    <SessionList title={"Session List"} 
                        addSession={addSession}
                        allsessions={allSessions}
                        clickSession={getHisChat}
                    />
            </Drawer>
            <ChangeProfile
                actionData={action}
                setAction={setAction}
                setActionMessage={setChatHistory}
                sid={nowsid}
                setEnabled = {setEnabled}
                setLoading = {setLoading}
            />
        </>
    );
}

export default Chatbot;