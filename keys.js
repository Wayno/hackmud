function(context, args) {
    // Fetch initial upgrade list
    let upgrades = #hs.sys.upgrades({filter:{name:"k3y_v1"}});

    // Assuming upgrades is an array and each upgrade has an 'i' field which is the unique ID
    let uniqueIDs = upgrades.map(upgrade => upgrade.i);

    // Fetch details for each item and extract keys
    let keyDetails = [];
    for (let id of uniqueIDs) {
        let details = #hs.sys.upgrades({i:id});  // Fetching individual upgrade details

        // Extracting the 'k3y' property if it exists
        if (details && details.k3y) {
            keyDetails.push({id: id, key: details.k3y});
        }
    }

    // Count each key and collect IDs
    let keyCounts = {};
    keyDetails.forEach(detail => {
        let key = detail.key;
        if (keyCounts[key]) {
            keyCounts[key].count += 1;
            keyCounts[key].ids.push(detail.id);
        } else {
            keyCounts[key] = { count: 1, ids: [detail.id] };
        }
    });

    // Identify IDs to keep and to delete
    let keepInfo = [];
    let deleteIDs = [];
    Object.keys(keyCounts).forEach(key => {
        let ids = keyCounts[key].ids;
        if (ids.length > 1) {
            // Keep the first ID and mark the rest for deletion
            keepInfo.push({id: ids[0], key: key});
            deleteIDs = deleteIDs.concat(ids.slice(1));
        } else {
            keepInfo.push({id: ids[0], key: key});
        }
    });

    // Check if deletion should be performed
    if (args && args.perform_deletion) {
        // Perform the deletion
        #ls.sys.cull({ i: deleteIDs, confirm: true });
        return {
            "Message": "Deletion performed on duplicate keys.",
            "Deleted IDs": deleteIDs
        };
    } else {
        // Return the IDs to keep and delete as a recommendation
        return {
            "Keep Info": keepInfo,
            "Delete IDs": deleteIDs,
            "Perform Deletion": "Run this to delete keys, keys { perform_deletion: true }"
        };
    }
}
