document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from being submitted normally

    var userInstanceDomain = document.getElementById('siteDomain').value;
    var userInstanceApiKey = document.getElementById('apiKey').value;

    chrome.storage.local.set({userInstanceDomain: userInstanceDomain, userInstanceApiKey: userInstanceApiKey}, function() {
        console.log('Values are stored in Chrome storage');
    });
});
