function(context, args) {
    // Items specified for deletion
    let itemsToDelete = ["log_writer_v1", "expose_access_log_v1", "w4rn_message", "w4rn_er", "public_script_v1", "w4rn", "cron_bot_v1", "channel_count_v1"];
    let idsToDelete = new Set(); // Use a Set to store unique IDs

    // Loop through each item name to filter and call sys.upgrades individually
    for (let itemName of itemsToDelete) {
        let upgradesResult = #hs.sys.upgrades({ filter: { name: itemName } });

        // Check if any upgrades were found with the specific name
        if (upgradesResult.length > 0) {
            // Process each found item and gather unique IDs for deletion
            for (let detail of upgradesResult) {
                idsToDelete.add(detail.i); // Add unique IDs to the Set
            }
        }
    }

    // Convert the Set to an array for passing to sys.cull
    let idsArray = Array.from(idsToDelete);

    // Perform the cull if there are items to delete
    if (idsArray.length > 0) {
        let cullResult = #ls.sys.cull({ i: idsArray, confirm: true });
        return { success: cullResult.ok };
    } else {
        return { note: "No items matched for deletion." };
    }
}
