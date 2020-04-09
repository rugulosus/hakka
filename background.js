var tabId = null;

function createTab() {
    var res = browser.tabs.create(
        {
            active: true,
            url: browser.extension.getURL("reader.html")
        }
    ).then(
        tab => {
           tabId = tab.id;
        }, 
        error => {
            console.log(`Error: ${error}`);
        }
    );
}

function openPage() {
    if (tabId === null) {
        createTab();
    } else {
        browser.tabs.get(tabId).then(
            tab => {
                browser.tabs.update(tabId, {active: true});
                browser.windows.update(tab.windowId, {drawAttention: true});
            },
            error => {
                createTab();
            }
        );
    }
}

chrome.browserAction.onClicked.addListener(openPage);
