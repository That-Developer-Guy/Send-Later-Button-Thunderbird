let currentLanguage = navigator.language;
let messageComposeTabs = [];
let notready = true;
let offline = false;

function updateLanguage() {
    if (currentLanguage == "en-US" || currentLanguage == "en-GB" || currentLanguage == "en-CA") {
        messenger.composeAction.setTitle({ title: "Send Later" });
    } else if (currentLanguage == "de") {
        messenger.composeAction.setTitle({ title: "Später Senden" });
    } else {
        messenger.composeAction.setTitle({ title: "Send Later" });
    }
}
setInterval(updateLanguage, 1000);

function getComposeTabs() {
    messenger.tabs.query({ type: "messageCompose" })
        .then(tabs => {
            const messageComposeTabs = tabs;
            updateButton(messageComposeTabs);
            for (let tab of messageComposeTabs) {
                let details = messenger.compose.getComposeDetails(tab.id);
                let composeDetailsPromise = Promise.resolve(details);

                composeDetailsPromise.then(composeDetails => {
                    let toHeader = composeDetails.to[0];
                    if (toHeader == undefined) {
                        messenger.composeAction.disable(tab.id);
                        notready = true;

                    } else {
                        messenger.composeAction.enable(tab.id);
                        notready = false;
                    }
                });
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function updateButton(tabs) {
    const online = navigator.onLine;
    for (let tab of tabs) {
        if (online) {
            if (!notready) {
                messenger.composeAction.enable(tab.id);
            }
            offline = false;
        } else {
            messenger.composeAction.disable(tab.id);
            offline = true;
        }
    }
}
setInterval(getComposeTabs, 100);

messenger.composeAction.onClicked.addListener(function(tab, info) {
    messenger.compose.sendMessage(tab.id, { mode: "sendLater" });
});
