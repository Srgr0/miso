// Listen for a click on the browser action icon
browser.browserAction.onClicked.addListener((tab) => {
    // Get the site domain and API key from chrome.storage
    browser.storage.local.get(['siteDomain', 'apiKey'], function(data) {
        var siteDomain = data.siteDomain;
        var apiKey = data.apiKey;

        // Parse the current URL
        const currentUrl = new URL(tab.url);
        const currentDomain = currentUrl.hostname;
        // 0:,1:notes,2:xxxxxx or 0:,1:@srgr0
        const currentPath = currentUrl.pathname.split("/");
        // Check the path of the URL
        if (currentPath[1] === "notes") {
            if (currentDomain !== siteDomain) {
                // Make a POST request to the site domain
                fetch(`${siteDomain}/api/ap/show`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uri: tab.url, i: apiKey}),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.type === 'Note') {
                        // Open a new tab with the note's URL
                        var noteUrl = `${siteDomain}/notes/${data.object.id}`;
                        browser.tabs.create({ url: noteUrl });
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        } else {
            if (currentDomain !== siteDomain) {
                // Check if the username has a domain
                // 0:,1:srgr0,2:misskey.srgr0.com or 0:,1:srgr0
                const userParts = currentPath[1].split("@");
                var userUrl;
                if (userParts.length === 3) {
                    userUrl = `${siteDomain}/@${userParts[1]}@${userParts[2]}`;
                } else {
                    userUrl = `${siteDomain}/@${userParts[1]}@${currentDomain}`;
                }
                browser.tabs.create({ url: userUrl });
            }
        }
    });
});
