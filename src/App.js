import React, { useEffect, useState } from 'react';
import {Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import FuzzyRequest from './pages/FuzzyRequest';
import ProfileAlignment from './pages/ProfileAlignment';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile/Profile';
import EmptyPage from './pages/EmptyPage';
import StartButton from './components/StartButtion';
import { Content } from 'antd/es/layout/layout';
import {getItem} from './utils/Chrome/getItem.js';
import { backendUrl, userPid } from './utils/Const.js';

const hisOpen = await getItem('isOpen');
console.log(hisOpen);
console.log("his length is "+window.history.length);

function App() {
  const [isOpen, setIsOpen] = useState(hisOpen);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // 如果需要根据 isOpen 的变化来进行导航
    if (isOpen && (location.pathname ==="/index.html")
    ) {
      navigate("/home");
    }
    // 依赖项数组中包含 isOpen，确保只有在 isOpen 改变时才执行
  }, [isOpen, location, navigate]);

  const openBuddy = async ()=>{
    const newIsOpen = !isOpen;
    navigate(newIsOpen ? "/home" : "/");
    chrome.storage.sync.set({isOpen: !isOpen}, ()=>{console.log("isOpen set to "+!isOpen)});
    setIsOpen(newIsOpen);
    const data = await getItem("profiles",[]);
    fetch(`${backendUrl}/record_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({pid: userPid, profiles:data})
    });
  }

  return (
    <>
      {/* <Typography.Text keyboard> 已经打开: {count}s </Typography.Text> */}
      <Content style={{width:"400px", paddingInline:10}}>
      {
        location.pathname !=="/home" && location.pathname !=="/" && window.history.length>1 ? <></>: <StartButton isOpen={isOpen} startFunction={openBuddy}/>
      }
          <Routes>
            <Route path="/fuzzy" element={<FuzzyRequest></FuzzyRequest>}></Route>
            <Route path="/alignment" element={<ProfileAlignment></ProfileAlignment>}></Route>
            <Route path="/feedback" element={<Feedback></Feedback>}></Route>
            <Route path="/profile" element={<Profile></Profile>}></Route>
            <Route path="/home" element={<Home></Home>}></Route>
            <Route path="/" element={<EmptyPage></EmptyPage>}></Route>
          </Routes>
      </Content>
    </>
  );
}

export default App;