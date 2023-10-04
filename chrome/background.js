// Create a right-click context menu item for links
chrome.contextMenus.create({
    id: 'miso-right-click',
    title: 'Open in your misskey instance',
    contexts: ['link']
});

// Function to handle the main logic
function handleUrl(queryUrl) {
    // Get the user instance's domain and API key from chrome.storage
    chrome.storage.local.get(['userInstanceDomain', 'userInstanceApiKey'], function(data) {
        var userInstanceDomain = data.userInstanceDomain;
        var userInstanceApiKey = data.userInstanceApiKey;

        // Parse the URL
        const queryDomain = queryUrl.hostname;
        // 0:,1:notes,2:xxxxxx or 0:,1:@srgr0
        const queryPath = queryUrl.pathname.split("/");

        // Check the path of the URL
        if (queryPath[1] === "notes") {
            if (queryDomain !== userInstanceDomain) {
                fetch(`${userInstanceDomain}/api/ap/show`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uri: queryUrl, i: userInstanceApiKey}),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.type === 'Note') {
                        var noteUrl = `${userInstanceDomain}/notes/${data.object.id}`;
                        chrome.tabs.create({ url: noteUrl });
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        } else {
            if (queryDomain !== userInstanceDomain) {
                // Check if the username has a domain
                // 0:,1:srgr0,2:misskey.srgr0.com or 0:,1:srgr0
                const userParts = queryPath[1].split("@");
                var userUrl;
                if (userParts.length === 3) {
                    userUrl = `${userInstanceDomain}/@${userParts[1]}@${userParts[2]}`;
                } else {
                    userUrl = `${userInstanceDomain}/@${userParts[1]}@${queryDomain}`;
                }
                chrome.tabs.create({ url: userUrl });
            }
        }
    });
}

// Listen for a click on the browser action icon
chrome.action.onClicked.addListener((tab) => {
    const queryUrl = new URL(tab.url)
    handleUrl(queryUrl);
});

// Listen for a click on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'miso-right-click') {
        const queryUrl = new URL(info.linkUrl)
        handleUrl(queryUrl);
    }
});
