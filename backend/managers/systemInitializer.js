const { UserLevel, Badge } = require("../models/associations");
const xpManager = require("./xpManager");
const badgeManager = require("./badgeManager");

/**
 * Initialize system with default levels and badges
 */
const initializeSystemData = async () => {
	try {
		console.log("🔄 Initializing system data...");

		// Initialize user levels
		const levelsCount = await UserLevel.count();
		if (levelsCount === 0) {
			console.log("📊 Creating default user levels...");
			const levels = await xpManager.initializeDefaultLevels();
			console.log(`✓ Created ${levels.length} user levels`);
		} else {
			console.log(`✓ User levels already exist (${levelsCount} levels)`);
		}

		// Initialize badges
		const badgesCount = await Badge.count();
		if (badgesCount === 0) {
			console.log("🎖️  Creating default badges...");
			const badges = await badgeManager.createDefaultBadges();
			console.log(`✓ Created ${badges.length} badges`);
		} else {
			console.log(`✓ Badges already exist (${badgesCount} badges)`);
		}

		console.log("✓ System data initialization complete!");
		return true;
	} catch (error) {
		console.error("✗ Error initializing system data:", error.message);
		return false;
	}
};

module.exports = {
	initializeSystemData,
};
