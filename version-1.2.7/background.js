let messageComposeTabs = [];
let notready = true;
let offline = false;
let busy_details_promise = false;
let preference_offline_disable = "offline-disable";

async function updateLanguage() {
    let currentLanguage = await messenger.i18n.getUILanguage();
    const url = messenger.runtime.getURL("locale/locale_composeAction.json");
    const response = await fetch(url);
    const locales = await response.json();
    if (locales[currentLanguage]) {
        messenger.composeAction.setLabel({ label: locales[currentLanguage].label });
        messenger.composeAction.setTitle({ title: locales[currentLanguage].title });
    } else {
        messenger.composeAction.setLabel({ label: locales["en-US"].label });
        messenger.composeAction.setTitle({ title: locales["en-US"].title });
    }
}
setInterval(updateLanguage, 1000);

function updateComposeTabs() {
    if (busy_details_promise) return;
    busy_details_promise = true;
    updateButton(messageComposeTabs);

    const promises = [];
    for (let tab of messageComposeTabs) {
        let details = messenger.compose.getComposeDetails(tab.id);
        let composeDetailsPromise = Promise.resolve(details);
        composeDetailsPromise.then(composeDetails => {
            let toHeader = composeDetails.to[0];
            let bccHeader = composeDetails.bcc[0];
            let ccHeader = composeDetails.cc[0];
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
        promises.push(composeDetailsPromise);
    }
    Promise.allSettled(promises).finally(() => {
        busy_details_promise = false;
    });
}

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.OfflineDisablePreference) {
        preference_offline_disable = changes.OfflineDisablePreference.newValue;
    }
});

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

function updateComposeTabsList() {
    messenger.tabs.query({ type: "messageCompose" })
        .then(tabs => {
            messageComposeTabs = tabs;
        })
        .catch(error => {
            console.error(error);
        });
}

messenger.tabs.onUpdated.addListener(updateComposeTabsList);
messenger.tabs.onCreated.addListener(updateComposeTabsList);
messenger.tabs.onRemoved.addListener(updateComposeTabsList);

setInterval(updateComposeTabs, 100);

messenger.composeAction.onClicked.addListener(function(tab, info) {
    messenger.compose.sendMessage(tab.id, { mode: "sendLater" });
});