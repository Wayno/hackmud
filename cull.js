function(context, args) {
    let itemsToDelete = ["log_writer_v1", "expose_access_log_v1", "w4rn_message", "w4rn_er", "public_script_v1", "w4rn", "cron_bot_v1", "channel_count_v1", "CON_TELL"];
    let excludeList = ["k3y_v1", "k3y_v2", "script_slot_v1", "char_count_v1"]; // Items to exclude from deletion
    let excludeRarity = [2, 3, 4]; // Array to hold excluded rarities
    let idsToDelete = new Set();
    let itemInstances = {}; // To track occurrences of each item

    // Fetch all upgrades
    let allUpgrades = #hs.sys.upgrades({loaded:"false", full: true});

    // First pass: mark specified items for deletion, respecting the exclude list and rarity
    allUpgrades.forEach(upgrade => {
        if (itemsToDelete.includes(upgrade.name) && !excludeList.includes(upgrade.name) && !excludeRarity.includes(upgrade.rarity)) {
            idsToDelete.add(upgrade.i); // Add to deletion list
        } else if (!excludeList.includes(upgrade.name) && !excludeRarity.includes(upgrade.rarity)) {
            // Track remaining items to check for duplicates
            if (itemInstances[upgrade.name]) {
                itemInstances[upgrade.name].push(upgrade.i);
            } else {
                itemInstances[upgrade.name] = [upgrade.i];
            }
        }
    });

    // Second pass: identify duplicates to delete extras, keeping one
    Object.keys(itemInstances).forEach(itemName => {
        let ids = itemInstances[itemName];
        if (ids.length > 1) { // If more than one instance exists
            // Skip the first and add the rest to the deletion list, respecting the rarity exclusion
            ids.slice(1).forEach(id => {
                let upgrade = allUpgrades.find(upgrade => upgrade.i === id);
                if (upgrade && !excludeRarity.includes(upgrade.rarity)) {
                    idsToDelete.add(id);
                }
            });
        }
    });

    // Convert the Set of indices to an array for deletion
    let idsArray = Array.from(idsToDelete);

    // Debug output to track which IDs are marked for deletion
    //#D({msg: "Final IDs to Delete", data: idsArray});

    // Perform the cull if there are items to delete
    if (idsArray.length > 0) {
        let cullResult = #ls.sys.cull({i: idsArray, confirm: true});
        return {success: cullResult.ok};
    } else {
        return {note: "No items matched for deletion."};
    }
}
