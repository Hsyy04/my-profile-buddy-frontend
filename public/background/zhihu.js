const backendUrl = "http://47.113.200.248:8000" //客户端后端 (用户数据的处理分析)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.type==='build_request_browse'){
        const jsonData = request.data;
        fetch(`${backendUrl}/browse`, { method: 'POST', body: jsonData })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            sendResponse(data);
        });
    }
    else if(request.type === "build_request_click"){
        const jsonData = request.data;
        fetch(`${backendUrl}/click`, { method: 'POST', body: jsonData });
    }
    else if (request.url) {
        chrome.tabs.create({ url: request.url, active: false }, function (tab) {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.remove(tabId);
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }
});
