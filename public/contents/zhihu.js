const backendUrl = "http://localhost:8000" //客户端后端 (用户数据的处理分析)
// const userPid = "大梦想家豪哥" //用户的id
const userPid = "Hsyy04" //用户的id
// const userPid = "DST" //用户的id

async function getIsOpen() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get("isOpen", (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          if (result.isOpen === undefined) {
            resolve(false);
          } else {
            resolve(result.isOpen);
          }
        }
      });
    });
  }
/* 记录用户在推荐列表页的点击事件 */
window.addEventListener('load', function () {
  if (this.window.location.href === "https://www.zhihu.com/"){
    const targetNode = document.querySelector('.css-1fsnuue');
    targetNode.addEventListener('click', async function (event) {
      let target = event.target;  // 用户点击的元素
      if (target.tagName === 'A' &&
        target.getAttribute('data-za-detail-view-element_name') === 'Title' &&
        target.getAttribute('data-za-detail-view-id') === '2812') {  // 先看看元素是否为标题中可点击的部分，如果是，什么都不做
        } else {                                                         // 如果不是，再看看元素是否为摘要中可点击的部分（体现在target是否为null上）
          target = target.closest('.RichContent-inner, .RichContent-cover');
        }
        // 经过上面的if-else，如果元素是标题中可点击的部分，或者摘要中可点击的部分，不为null
        if (target) {  // 说明交互了
            target = target.closest('.Card.TopstoryItem.TopstoryItem-isRecommend');  // 找到卡片
            const title_div = target.querySelector('.ContentItem-title').firstChild
            const title = title_div.querySelector('a').innerText;      // 获得标题

            const jsonData = JSON.stringify({ pid: userPid, platform: 0, title: title});     
            fetch(`${backendUrl}/click`, { method: 'POST', body: jsonData }) ; // 服务端保存
            console.log('click data:', jsonData);
        }
    }, true);    
  } else if(this.window.location.href === "https://www.bilibili.com/"){
    const targetNode = document.querySelector('.recommended-container_floor-aside');
    targetNode.addEventListener('click', async function (event) {
      let target = event.target;  // 用户点击的元素
      if (target.tagName === 'A' && target.getAttribute('data-idx') === 'click' ) { 
        target = target.parentNode;
        } else {                                                         // 如果不是，再看看元素是否为摘要中可点击的部分（体现在target是否为null上）
          target = target.closest('.bili-video-card__info--tit');
        }
        // 经过上面的if-else，如果元素是标题中可点击的部分，或者摘要中可点击的部分，不为null
        if (target) {  // 说明交互了
          const title = target.getAttribute('title');      // 获得标题
          const jsonData = JSON.stringify({ pid: userPid, platform: 1, title: title});
          fetch(`${backendUrl}/click`, { method: 'POST', body: jsonData }) ; // 服务端保存
          console.log('click data:', jsonData);
        }
    }, true);    
  }
});
      
/* 处理单个卡片的逻辑 */
async function processElement(element, platform=0) {

    let title = undefined
    let content = undefined
    let url = undefined
    if(platform === 0){
        // 获取标题
        const title_tag = element.querySelector(".ContentItem-title");
        title = title_tag.innerText;

        // //获取 content
        const content_tag = element.querySelector(".css-376mun")
        content = content_tag.innerText;

        // 获取 answer_url
        const url_tag = element.querySelector('.ContentItem-title').firstChild
        url = url_tag.querySelector("a").href

    }
    else if(platform ===1){ 
      const title_tag = element.querySelector(".bili-video-card__info--tit")
      title = title_tag.getAttribute("title")
    }
    // 上下文过滤
    const isOpen = await getIsOpen();
    const jsonData = JSON.stringify({ pid: userPid, platform: platform, title: title, content: content, url: url, is_filter: isOpen});
    fetch(`${backendUrl}/browse`, { method: 'POST', body: jsonData })
        .then(response => response.json())
        .then(data => {
            if (data['data'] === true) {
                // element.style.backgroundColor = '#d3d3d3';
                element.remove(); 
                console.log("remove:"+title)
            }
            console.log("processing one:"+title)
            if(isOpen === true){
              var add_label_div = element.querySelector('.ContentItem-title').firstChild
              var label = document.createElement('label'); 
              label.classList.add("FEfUrdfMIKpQDJDqkjte")
              label.innerHTML = '处理完了';
              label.style.backgroundColor = 'rgb(146, 207, 191)';
              add_label_div.insertAdjacentElement('beforeend', label); 
            }
    
        });
}

/* 页面加载完成后，处理初始已存在的元素、处理新添加元素 */
window.addEventListener('load', function () {
  if(this.window.location.href === "https://www.zhihu.com/"){
    // 处理初始已存在的元素
    const initialElements = document.querySelectorAll('.Card.TopstoryItem.TopstoryItem-isRecommend');
    initialElements.forEach((value, key)=>processElement(value, 0));
    // 处理新添加元素
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {
                if (addedNode.className === 'Card TopstoryItem TopstoryItem-isRecommend') {
                    processElement(addedNode, 0);
                }
            })
        });
    });
    const targetNode = document.querySelector('.css-1fsnuue');  // 选择要观察变化的目标节点
    const config = { childList: true, subtree: false };         // 配置MutationObserver以监视子节点的添加
    observer.observe(targetNode, config);                       // 启动观察器并传入配置
    // observer.disconnect();
  }else if(this.window.location.href === "https://www.bilibili.com/"){
    // 处理初始已存在的元素
    const initialElements = document.querySelectorAll('.feed-card');
    initialElements.forEach((value, key)=>processElement(value, 1));
    // 处理新添加元素
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {
                if (addedNode.className === '.feed-card') {
                    processElement(addedNode, 1);
                }
            })
        });
    });
    const targetNode = document.querySelector('.recommended-container_floor-aside');  // 选择要观察变化的目标节点
    const config = { childList: true, subtree: false };         // 配置MutationObserver以监视子节点的添加
    observer.observe(targetNode, config);                       // 启动观察器并传入配置
    // observer.disconnect();
  }
});
