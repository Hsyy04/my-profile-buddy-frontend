async function getItem(key, defaultValue = false){
    console.log(key);
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          console.log(result);
          if (result[key] === undefined) {
            resolve(defaultValue);
          } else {
            resolve(result[key]);
          }
        }
      });
    });
  }


export{getItem};