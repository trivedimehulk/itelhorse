chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: "index.html" // Replace "index.html" with your main UI file.
    });
});
