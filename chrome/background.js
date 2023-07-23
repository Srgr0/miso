// Listen for a click on the browser action icon
chrome.action.onClicked.addListener((tab) => {
  // Get the current URL
  var currentUrl = tab.url;

  // Get the site domain and API key from storage
  chrome.storage.local.get(['siteDomain', 'apiKey'], function(data) {
      var siteDomain = data.siteDomain;
      var apiKey = data.apiKey;

      // Make a POST request to the site domain
      fetch(`${siteDomain}/api/ap/show`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({uri: currentUrl, i: apiKey}),
      })
      .then(response => response.json())
      .then(data => {
          // Check the type of the response
          if (data.type === 'User') {
              // Open a new tab with the user's URL
              var userUrl = `${siteDomain}/@${data.object.username}@${data.object.host}`;
              chrome.tabs.create({ url: userUrl });
          } else if (data.type === 'Note') {
              // Open a new tab with the note's URL
              var noteUrl = `${siteDomain}/notes/${data.object.id}`;
              chrome.tabs.create({ url: noteUrl });
          }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  });
});
