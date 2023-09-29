messenger.composeAction.onClicked.addListener(function(tab, info) {
    messenger.compose.sendMessage(tab.id, { mode: "sendLater" });
});
