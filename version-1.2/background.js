let currentLanguage = navigator.language;
let messageComposeTabs = [];
let notready = true;
let offline = false;

function updateLanguage() {
    currentLanguage = navigator.language;
    if (currentLanguage == "en-US" || currentLanguage == "en-GB" || currentLanguage == "en-CA") {
        messenger.composeAction.setTitle({ title: "Send Later" });
    } else if (currentLanguage == "de") {
        messenger.composeAction.setTitle({ title: "Später Senden" });
    } else if (currentLanguage == "es-ES") {
        messenger.composeAction.setTitle({ title: "Enviar más tarde" });
    } else if (currentLanguage == "fr") {
        messenger.composeAction.setTitle({ title: "Envoyer plus tard" });
    } else if (currentLanguage == "it-IT") {
        messenger.composeAction.setTitle({ title: "Invia dopo" });
    } else if (currentLanguage == "el-GR") {
        messenger.composeAction.setTitle({ title: "Αποστολή αργότερα" });
    } else {
        messenger.composeAction.setTitle({ title: "Send Later" });
    }
    console.log(currentLanguage);
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
                    if (toHeader == undefined || !/^.*@.*$/.test(toHeader)) {
                        messenger.composeAction.disable(tab.id);
                        notready = true;

                    } else {
                        if (!offline) {
                            messenger.composeAction.enable(tab.id);
                            notready = false;
                        }
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