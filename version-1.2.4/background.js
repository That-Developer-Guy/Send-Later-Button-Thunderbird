let currentLanguage = navigator.language;
let messageComposeTabs = [];
let notready = true;
let offline = false;
let preference_offline_disable = "offline-disable"

function updateLanguage() {
    currentLanguage = navigator.language;
    if (currentLanguage == "en-US" || currentLanguage == "en-GB" || currentLanguage == "en-CA") {
        messenger.composeAction.setLabel({ label: "Send Later" });
        messenger.composeAction.setTitle({ title: "Send Later" });
    } else if (currentLanguage == "de") {
        messenger.composeAction.setLabel({ label: "Später Senden" });
        messenger.composeAction.setTitle({ title: "Später Senden" });
    } else if (currentLanguage == "es-ES") {
        messenger.composeAction.setLabel({ label: "Enviar más tarde" });
        messenger.composeAction.setTitle({ title: "Enviar más tarde" });
    } else if (currentLanguage == "fr") {
        messenger.composeAction.setLabel({ label: "Envoyer plus tard" });
        messenger.composeAction.setTitle({ title: "Envoyer plus tard" });
    } else if (currentLanguage == "it-IT") {
        messenger.composeAction.setLabel({ label: "Invia dopo" });
        messenger.composeAction.setTitle({ title: "Invia dopo" });
    } else if (currentLanguage == "el-GR") {
        messenger.composeAction.setLabel({ label: "Αποστολή αργότερα" });
        messenger.composeAction.setTitle({ title: "Αποστολή αργότερα" });
    } else {
        messenger.composeAction.setLabel({ label: "Send Later" });
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
                    let bccHeader = composeDetails.bcc[0];
                    let ccHeader = composeDetails.cc[0];
                    console.log(bccHeader + " " + ccHeader + " " + toHeader)
                    if (toHeader == undefined || !/^.*@.*$/.test(toHeader)) {
                        if (bccHeader == undefined || !/^.*@.*$/.test(bccHeader)) {
                            if (ccHeader == undefined || !/^.*@.*$/.test(ccHeader)) {
                                messenger.composeAction.disable(tab.id);
                                notready = true;
                            } else {
                                if (!offline || preference_offline_disable == "offline-enable") {
                                    messenger.composeAction.enable(tab.id);
                                    notready = false;
                                }
                            }
                        } else {
                            if (!offline || preference_offline_disable == "offline-enable") {
                                messenger.composeAction.enable(tab.id);
                                notready = false;
                            }
                        }
                    } else {
                        if (!offline || preference_offline_disable == "offline-enable") {
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

setInterval(function() {
    browser.storage.local.get("OfflineDisablePreference")
        .then((result) => {
            preference_offline_disable = result.OfflineDisablePreference;
        })
        .catch((error) => {
            console.error("Error reading Preference:", error);
        });
}, 100);

function updateButton(tabs) {
    const online = navigator.onLine;
    for (let tab of tabs) {
        if (online) {
            if (!notready) {
                messenger.composeAction.enable(tab.id);
            }
            offline = false;
        } else {
            if (preference_offline_disable != "offline-enable") {
                messenger.composeAction.disable(tab.id);
            }
            offline = true;
        }
    }
}
setInterval(getComposeTabs, 100);

messenger.composeAction.onClicked.addListener(function(tab, info) {
    messenger.compose.sendMessage(tab.id, { mode: "sendLater" });
});