function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        token: document.querySelector("#token").value
    });
}

function restoreOptions() {
    var token = browser.storage.local.get("token");
    token.then(function (result) {
        document.querySelector("#token").value = result.token || '';
    }, function (error) {
        console.log(`Error: ${error}`);
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
