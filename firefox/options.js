document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from being submitted normally

    var siteDomain = document.getElementById('siteDomain').value;
    var apiKey = document.getElementById('apiKey').value;

    browser.storage.local.set({siteDomain: siteDomain, apiKey: apiKey}, function() {
        console.log('Values are stored in Chrome storage');
    });
});
