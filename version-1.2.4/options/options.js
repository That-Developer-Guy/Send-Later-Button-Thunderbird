document.addEventListener('DOMContentLoaded', () => {
    messenger.storage.local.get("OfflineDisablePreference")
        .then((result) => {
            if (result.Preference) {
                document.querySelector(`input[name="options-disable"][value="${result.OfflineDisablePreference}"]`).checked = true;
            } else {
                document.querySelector('input[name="options-disable"][value="offline-disable"]').checked = true;
            }
        })
        .catch(() => {
            document.querySelector('input[name="options-disable"][value="offline-disable"]').checked = true;
        });

    document.querySelector('#save-button').addEventListener('click', function() {
        let selectedOption = document.querySelector('input[name="options-disable"]:checked').value;
        messenger.storage.local.set({ "OfflineDisablePreference": selectedOption })
            .then(() => {
                console.log("Preference saved:", selectedOption);
            })
            .catch(error => {
                console.error('Error storing option:', error);
            });
    });
    messenger.storage.local.set({ "OfflineDisablePreference": "offline-disable" });
});