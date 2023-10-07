// Create a right-click context menu item for links
chrome.contextMenus.create({
    id: 'miso-right-click',
    title: 'Open in your misskey instance',
    contexts: ['link']
});

// Get node software name
async function getNodeSoftwareName(queryUrl) {
    const queryDomain = queryUrl.hostname;

    try {
        // Send GET request to host/.well-known/nodeinfo
        const response = await fetch(`https://${queryDomain}/.well-known/nodeinfo`, {
            method: 'GET',
            headers: {
                'User-Agent': 'miso - Browser extension for misskey'
            }
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error('Failed to fetch nodeinfo');
        }

        const data = await response.json();

        // Check if the JSON has the expected format
        if (!data.links || !Array.isArray(data.links)) {
            return null;
        }

        // Find the latest version of nodeinfo
        const latestNodeInfo = data.links.reduce((latest, current) => {
            if (!latest || current.rel > latest.rel) {
                return current;
            }
            return latest;
        }, null);

        if (!latestNodeInfo || !latestNodeInfo.href) {
            return null;
        }

        // Send GET request to the latest version of nodeinfo URL
        const nodeInfoResponse = await fetch(latestNodeInfo.href, {
            method: 'GET',
            headers: {
                'User-Agent': 'miso - Browser extension for misskey'
            }
        });

        // Check if response is OK
        if (!nodeInfoResponse.ok) {
            throw new Error('Failed to fetch latest nodeinfo');
        }

        const nodeInfoData = await nodeInfoResponse.json();

        // Extract software/name from the response JSON
        if (nodeInfoData.software && nodeInfoData.software.name) {
            return nodeInfoData.software.name;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Handle url (Misskey)
function handleUrlMisskey(queryUrl) {
    // Get the user instance's domain and API key from chrome.storage
    chrome.storage.local.get(['userInstanceDomain', 'userInstanceApiKey'], function(data) {
        const userInstanceDomain = data.userInstanceDomain;
        const userInstanceApiKey = data.userInstanceApiKey;

        // Parse the url
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
                        const noteUrl = `${userInstanceDomain}/notes/${data.object.id}`;
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

// Handle url (Masodon)
function handleUrlMastdon(queryUrl) {
    // Get the user instance's domain and API key from chrome.storage
    chrome.storage.local.get(['userInstanceDomain', 'userInstanceApiKey'], function(data) {
        const userInstanceDomain = data.userInstanceDomain;
        const userInstanceApiKey = data.userInstanceApiKey;

        // Parse the url
        const queryDomain = queryUrl.hostname;
        // 0:,1:@srgr0(@misskey.srgr0.com) or 0:,1:@srgr0(@misskey.srgr0.com),2:xxxxxx
        const queryPath = queryUrl.pathname.split("/");

        // Check the path of the URL
        if (queryPath.length === 3) {
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
                        const noteUrl = `${userInstanceDomain}/notes/${data.object.id}`;
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
chrome.action.onClicked.addListener(async (tab) => {
    const queryUrl = new URL(tab.url)
    const nodeSoftwareName = await getNodeSoftwareName(queryUrl);
    if (nodeSoftwareName === 'misskey') {
        handleUrlMisskey(queryUrl);
    } else if (nodeSoftwareName === 'mastodon') {
        handleUrlMastdon(queryUrl);
    } else {
        console.error('Unknown node software');
    }
});

// Listen for a click on the context menu item
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'miso-right-click') {
        const queryUrl = new URL(info.linkUrl)
        const nodeSoftwareName = await getNodeSoftwareName(queryUrl);
        if (nodeSoftwareName === 'misskey') {
            handleUrlMisskey(queryUrl);
        } else if (nodeSoftwareName === 'mastodon') {
            handleUrlMastdon(queryUrl);
        } else {
            console.error('Unknown node software');
        }
    }
});
