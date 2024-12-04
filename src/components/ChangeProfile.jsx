import { Button, Checkbox, Modal, Typography } from "antd";
import React, {useEffect, useState} from "react";
import { backendUrl, userPid } from "../utils/Const";
import { setItem } from "../utils/Chrome/setItem.js";
import { useLocation } from "react-router-dom";
import { getItem } from "../utils/Chrome/getItem.js";
import botAvatar from "../images/bot-avatar.png";

const SearchItem = (
    {
        setIsEditing,
        actionItem, 
        confirm,
        setConfirm,
        setActionItemKW
    }
) => {

    return (
        <>  
            {/* <Checkbox onChange={setConfirm} checked={confirm}></Checkbox>{" "} */}
            搜索
            {
                actionItem.keywords.map((item, index) => {
                    return (
                        <>
                        <Typography.Text editable={
                            {
                                onChange: (value) => {
                                    setActionItemKW([value]);
                                    setIsEditing(false);
                                },
                                onStart: ()=>{
                                    setIsEditing(true);
                                },
                                onEnd: ()=>{
                                    setIsEditing(false);
                                },
                                onCancel: ()=>{
                                    setIsEditing(false);
                                },
                                tooltip: <>编辑</>,
                            }
                        } keyboard key={index}>{item}</Typography.Text>
                        </>
                    );
                })
            }
            <br/>
        </>
    )
}

const DeleteItem = (
    {
        setIsEditing,
        formData,
        setConfirm,
        confirm,
        setActionItemRU
    }
) => {
    return (
        <>  
            {/* <Checkbox onChange={setConfirm} checked={confirm}></Checkbox>{" "} */}
            删除{' '}
            规则: 
            <Typography.Text keyboard>{formData.rule}</Typography.Text>
            <br/>
        </>
    )
}

const AddItem = (
    {
        setIsEditing,
        formData,
        setConfirm,
        confirm,
        setActionItemRU
    }
) => {
    return (
        <>  
            {/* <Checkbox onChange={setConfirm} checked={confirm}></Checkbox>{" "} */}
            添加{' '}
            规则: <Typography.Text 
                editable={{
                    onChange: (value) => {
                        setActionItemRU(value);
                        setIsEditing(false);
                    },
                    onStart: ()=>{
                        setIsEditing(true);
                    },
                    onEnd: ()=>{
                        setIsEditing(false);
                    },
                    onCancel: ()=>{
                        setIsEditing(false);
                    },
                    tooltip: <>编辑</>,
                }} keyboard>{formData.rule}</Typography.Text>
            <br/>
        </>
    );
}

const UpdateItem = (
    {
        setIsEditing, 
        prevData, 
        formData,
        setConfirm,
        confirm,
        setActionItemRU
    }
) => {
    return (
        <>  
            {/* <Checkbox onChange={setConfirm} checked={confirm}></Checkbox>{" "} */}
            修改{' '}
            原有规则:<Typography.Text keyboard>{prevData.rule}</Typography.Text>
            {' '}为{' '}  
            新规则: <Typography.Text 
                editable={{
                    onChange: (value) => {
                        setActionItemRU(value);
                        setIsEditing(false);
                    },
                    onStart: ()=>{
                        setIsEditing(true);
                    },
                    onEnd: ()=>{
                        setIsEditing(false);
                    },
                    onCancel: ()=>{
                        setIsEditing(false);
                    },
                    tooltip: <>编辑</>,
                }} keyboard>{formData.rule}</Typography.Text>
            <br/>
        </>
    );
}

const ChangeProfile = (
    {
        actionData,
        setAction,
        setActionMessage, 
        sid,
        setEnabled,
        setLoading,
    }
) => {
    const [nowData, setNowData] = useState([]);
    const [isConfirm, setIsConfirm] = useState(new Array(10).fill(true));
    const location = useLocation();

    //防止编辑规则的时候误触确定
    const [isediting, setIsEditing] = useState(false);
    async function getData(){
        const data = await getItem("profiles",[]);
        setNowData(data);
    }
    useEffect(() => {
        getData();
    }, [location]);
    
    async function updateFunc(id, item) {
        const newData = nowData.map(card => card.iid === id ? item : card);
        fetch(`${backendUrl}/save_rules`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({isbot:true, isdel:false, rule:item, iid:id, pid: userPid}),
        }).then(res => res.json())
        .then(data => {
            console.log("update rules (server) win");
            setItem('profiles', newData).then(ret=>{
                console.log("update rules (chrome) win");
                setNowData(newData);
            })
            .catch(err=>{
                console.log("update rules (chrome) fail:"+err);
            })
        })
        .catch(err => {
            console.log("update rules (server) fail:"+err);
        });
    }

    async function deleteFunc(id){
        const newData = nowData.filter(item => item.iid !== id);
        fetch(`${backendUrl}/save_rules`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({isbot:true, isdel:true, rule:{}, iid:id, pid: userPid}),
        }).then(res => res.json())
        .then(data => {
            console.log("delete rules (server) win");
            setItem('profiles', newData).then(ret=>{
                console.log("delete rules (chrome) win");
                setNowData(newData);
            })
            .catch(err=>{
                console.log("delete rules (chrome) fail:"+err);
            })
        })
        .catch(err => {
            console.log("delete rules (server) fail:"+err);
        });
    }
    
    async function  addFunc(item){
        const newData = [...nowData, item];
        fetch(`${backendUrl}/save_rules`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({isbot:true, isdel:false, rule:item, iid:item.iid, pid: userPid}),
        }).then(res => res.json())
        .then(data => {
            console.log("add rules (server) win");
            setItem('profiles', newData).then(ret=>{
                console.log("add rules (chrome) win");
                setNowData(newData);
            }).catch(err=>{
                console.log("add rules (chrome) fail:"+err);
            })
        }).catch(err =>{
            console.log("add rules (server) fail:"+err);
        })
        let ret = await setItem('profiles', newData);
        console.log("add rules (chrome): "+ret);
        setNowData(newData);
    }


    function handleCancel(){
        console.log("cancel");
        setEnabled(false);
        setLoading(true);
        console.log(actionData);
        fetch(`${backendUrl}/make_new_message`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({pid: userPid, sid:sid, platform:0, ac_actions:[], wa_actions:actionData}),
        }).then(res => res.json())
        .then(data => {
            const res_data = data['data']
            const newMessage = {sender: "bot", message: res_data['content'], avatar: botAvatar};
            setActionMessage(chatHistory => [...chatHistory, newMessage]);
            setEnabled(true);
            setLoading(false);
        })
        setAction([]);
        setIsConfirm(new Array(10).fill(true));
    }
    function saveFunc(){
        console.log("save");
        const ac_actions = actionData.filter((item, index) => isConfirm[index]);
        const wa_actions = actionData.filter((item, index) => !isConfirm[index]);
        setEnabled(false);
        setLoading(true);
        actionData.forEach((item, index) => {
            if(isConfirm[index]){
                if(item.type === 1){
                    addFunc(item.profile);
                }
                else if(item.type === 2){
                    updateFunc(item.profile.iid, item.profile);
                }
                else if(item.type === 3){
                    deleteFunc(item.profile.iid);
                }
                else if(item.type === 4){
                    console.log("search");
                    const keywords = item.keywords
                    const platform = item.profile.platform;
                    keywords.forEach((kw)=>{
                        if(platform === 0){
                            const url = `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(kw)}`;
                            chrome.runtime.sendMessage({ url: url });
                        } else if(platform === 1){
                            const url = `https://search.bilibili.com/all?keyword=${encodeURIComponent(kw)}`;
                            chrome.runtime.sendMessage({ url: url });
                        }
                    });
                    fetch(`${backendUrl}/save_search`,{
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json', 
                        },
                        body: JSON.stringify({keyword: keywords[0], pid: userPid, platform:platform}),
                    });
                }
                // setIsConfirm(isConfirm.map((itemm, id) => index === id ? !itemm : itemm));
                // console.log(isConfirm[index]);
            }
        });
        fetch(`${backendUrl}/make_new_message`,{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({pid: userPid, sid:sid, platform:0, ac_actions:ac_actions, wa_actions:wa_actions}),
        }).then(res => res.json())
        .then(data => {
            setEnabled(true);
            setLoading(false);
            const res_data = data['data']
            const newMessage = {sender: "bot", message: res_data['content'], avatar: botAvatar};
            setActionMessage(chatHistory => [...chatHistory, newMessage]);

        })
        setAction([]);
        console.log("save end");
        // console.log(isConfirm);
    }

    function setConfirm(id){
        // setIsConfirm(isConfirm.map((item, index) => index === id ? !item : item));
    }

    function setActionItemKW(kw, index){
        setAction(actionData.map((itemm, id) => index === id ? {...itemm, keywords:kw} : itemm));
    }
    function setActionItemRU(new_rule, index){
        if(new_rule.indexOf("我不想看")!==0){
            alert("不行,重写! 规则必须以\"我不想看\"开头");
            return;
        }
        setAction(actionData.map((itemm, id) => index === id ? {...itemm, profile: {...itemm.profile, rule:new_rule}} : itemm));
    }
    
    const title = "我将帮您进行编辑, 请确认:"; 
    return(
        <Modal 
            title={title} 
            open={actionData.length !== 0} 
            onOk={()=>{saveFunc()}} 
            onCancel={()=>{handleCancel()}}
            footer={[
                <Button onClick={()=>{handleCancel()}} disabled={isediting}>取消</Button>,
                <Button type="primary" onClick={()=>{saveFunc()}} disabled={isediting}>确定</Button>
            ]}>
            {
                actionData.map((item, index) => {
                    return (
                        <div key={index}>
                            {item.type === 4 ? <SearchItem
                                setIsEditing={setIsEditing}
                                actionItem={item}
                                confirm={isConfirm[index]}
                                setConfirm={()=>{setConfirm(index)}}
                                setActionItemKW={(item)=>{setActionItemKW(item, index)}}/>:
                            item.type === 3 ? <DeleteItem
                                setIsEditing={setIsEditing}
                                formData={item.profile}
                                confirm={isConfirm[index]}
                                setConfirm={()=>{setConfirm(index)}}
                                setActionItemRU={(item)=>{setActionItemRU(item, index)}}/>:
                            item.type === 2 ? <UpdateItem
                                setIsEditing={setIsEditing}
                                prevData={nowData.find(card => card.iid === item.profile.iid)}
                                formData={item.profile}
                                confirm={isConfirm[index]}
                                setConfirm={()=>{setConfirm(index)}}
                                setActionItemRU={(item)=>{setActionItemRU(item, index)}}/>:
                            item.type === 1 ? <AddItem
                                setIsEditing={setIsEditing}
                                formData={item.profile}
                                prevData={nowData.find(card => card.iid === item.profile.iid)}
                                confirm={isConfirm[index]}
                                setConfirm={()=>{setConfirm(index)}}
                                setActionItemRU={(item)=>{setActionItemRU(item, index)}}/>:
                            <></>}
                        </div>
                    );
                })
            }
        </Modal>
    );
}

export default ChangeProfile;