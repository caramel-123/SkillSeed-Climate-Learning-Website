-- ============================================================================
-- Seed Quests and Badges for Hands-on Tab
-- ============================================================================

-- Clear existing data (for development)
DELETE FROM user_badges;
DELETE FROM badges;
DELETE FROM quest_progress;
DELETE FROM quests;

-- ============================================================================
-- BEGINNER QUESTS (6 quests)
-- ============================================================================

INSERT INTO quests (title, description, tier, category, badge_name, badge_icon, points_reward, estimated_days, steps) VALUES
(
  'Start a Compost Jar',
  'Turn kitchen scraps into rich compost using just a jar and some patience. A great first step toward zero waste living.',
  'beginner', 'Waste Reduction', 'Soil Starter', '🌱', 150, 7,
  '[
    {"step": 1, "title": "Gather your materials", "instruction": "Find a clean jar or container with a lid (at least 1 liter). Collect brown materials: dried leaves, shredded paper, cardboard. Collect green materials: vegetable peels, fruit scraps, coffee grounds."},
    {"step": 2, "title": "Layer your compost", "instruction": "Add a 2cm layer of soil at the bottom. Add a layer of brown materials, then a layer of green materials. Ratio should be 2:1 brown to green. Lightly sprinkle water to moisten."},
    {"step": 3, "title": "Seal and store", "instruction": "Poke 5-10 small holes in the lid for airflow. Place in a warm spot away from direct sunlight. Label it with today''s date."},
    {"step": 4, "title": "Monitor and mix", "instruction": "Every 2 days, open the jar and mix the contents with a stick. Add a small handful of brown material if it smells bad. Add water if it looks too dry."},
    {"step": 5, "title": "Document your results", "instruction": "After 7 days, take a photo of your compost jar. Write a short reflection: What did you add? What did you notice? Does it smell earthy? That means it''s working!"}
  ]'
),
(
  'Grow Herbs from Seeds',
  'Grow your own food from seed to harvest. Start with easy herbs and learn the basics of urban gardening.',
  'beginner', 'Urban Greening', 'Seed Keeper', '🌿', 150, 14,
  '[
    {"step": 1, "title": "Choose your herbs", "instruction": "Pick 2-3 easy herbs: basil, kangkong, pechay, or spring onions. These grow well in Philippine climate. You can buy seeds at your local hardware or garden store."},
    {"step": 2, "title": "Prepare your containers", "instruction": "Use recycled containers — plastic bottles cut in half, old cups, or tin cans. Poke drainage holes at the bottom. Fill with potting mix or a mix of soil and composted material."},
    {"step": 3, "title": "Plant your seeds", "instruction": "Press 2-3 seeds into the soil about 1cm deep. Cover lightly. Water gently — the soil should be moist but not waterlogged. Place in a spot with 4-6 hours of sunlight."},
    {"step": 4, "title": "Water and watch", "instruction": "Water every morning. Keep the soil moist. Seedlings should appear within 5-10 days. Thin out weaker seedlings, keeping the strongest one per container."},
    {"step": 5, "title": "Harvest and document", "instruction": "Once your herb has at least 6 leaves, it''s ready to harvest! Snip leaves from the top. Take a photo of your grown herb. Reflect: How did this change how you think about food?"}
  ]'
),
(
  'Track and Reduce Home Electricity Use',
  'Understand your household energy habits and take simple steps to reduce your consumption.',
  'beginner', 'Energy Efficiency', 'Watt Watcher', '⚡', 150, 7,
  '[
    {"step": 1, "title": "Audit your appliances", "instruction": "List every appliance in your home. Note which ones are used daily and for how long. Focus on the big ones: electric fan, ref, TV, washing machine, lights."},
    {"step": 2, "title": "Check your electric bill", "instruction": "Find your most recent Meralco or utility bill. Note your kWh consumption. Calculate your daily average: total kWh divided by 30."},
    {"step": 3, "title": "Identify your top 3 energy users", "instruction": "The refrigerator runs 24/7 and uses the most. Air conditioning and electric water heaters are next. Write down your top 3 and estimate daily hours of use."},
    {"step": 4, "title": "Apply 3 reduction habits", "instruction": "Choose 3 habits: unplug appliances when not in use, switch to LED bulbs, set ref temperature to 3-4°C, use natural light in the morning, air dry clothes instead of using a dryer."},
    {"step": 5, "title": "Track for 7 days and reflect", "instruction": "After 7 days, compare habits. Take a photo of your habit tracker or notes. Write: What did you change? Do you notice a difference? What would your estimated monthly savings be?"}
  ]'
),
(
  'Make Natural Cleaning Products at Home',
  'Replace toxic household cleaners with safe, effective natural alternatives using ingredients you already have.',
  'beginner', 'Zero Waste', 'Clean Chemist', '🧴', 150, 3,
  '[
    {"step": 1, "title": "Gather ingredients", "instruction": "You need: white vinegar, baking soda, liquid dish soap (small amount), lemon or calamansi, water, and an empty spray bottle. All available at the palengke or grocery."},
    {"step": 2, "title": "Make an all-purpose cleaner", "instruction": "Mix 1 cup white vinegar + 1 cup water + 10 drops of calamansi juice in the spray bottle. This cleans countertops, sinks, and bathroom tiles. Label the bottle."},
    {"step": 3, "title": "Make a scrubbing paste", "instruction": "Mix ½ cup baking soda + enough dish soap to make a paste (about 2 tablespoons). Add lemon zest for scent. Use this for tough stains on pots, pans, and grout."},
    {"step": 4, "title": "Test your cleaners", "instruction": "Clean one surface in your kitchen and one in your bathroom using only your homemade products. Note how they perform compared to store-bought."},
    {"step": 5, "title": "Document and reflect", "instruction": "Take a photo of your finished products. Write: How much did it cost vs store-bought? What toxins did you avoid? Would you switch permanently?"}
  ]'
),
(
  'Build a DIY Bird Feeder',
  'Create a habitat for local birds using recycled materials and learn about your local ecosystem.',
  'beginner', 'Biodiversity', 'Habitat Builder', '🐦', 150, 2,
  '[
    {"step": 1, "title": "Gather materials", "instruction": "Use a large plastic bottle (1.5L or 2L), two wooden chopsticks or bamboo sticks, string or wire, scissors or cutter, and bird seed or leftover rice/bread crumbs."},
    {"step": 2, "title": "Cut the feeding holes", "instruction": "Cut two small oval holes on opposite sides of the bottle, about 5cm from the bottom. Make them just large enough for birds to access the seed."},
    {"step": 3, "title": "Insert the perches", "instruction": "Push a chopstick through the bottle just below each hole — this is where birds will land. Push a second chopstick through perpendicular to the first for stability."},
    {"step": 4, "title": "Fill and hang", "instruction": "Fill the bottom of the bottle with bird seed, rice, or breadcrumbs. Tie a strong string around the bottle neck. Hang in a tree or outside your window, away from cats."},
    {"step": 5, "title": "Observe and document", "instruction": "Wait 1-2 days. Take a photo of your feeder — ideally with a bird visiting! Reflect: What birds visited? Look up their names. How does this connect to local biodiversity?"}
  ]'
),
(
  'Create a Solar Light by Hand',
  'Build a working solar-powered light using simple materials and understand how solar energy works.',
  'beginner', 'Renewable Energy', 'Light Maker', '☀️', 200, 3,
  '[
    {"step": 1, "title": "Understand the circuit", "instruction": "A basic solar light needs: a small solar panel (from old garden lights or bought cheaply at Divisoria), a rechargeable AA battery, a simple LED, and connecting wires. Draw the circuit: solar panel → battery → LED."},
    {"step": 2, "title": "Gather your materials", "instruction": "Buy or salvage: 1 small 5V solar panel, 1 rechargeable AA battery + holder, 1 white LED, 2 short wires with alligator clips or soldered ends, 1 diode (prevents battery discharge at night)."},
    {"step": 3, "title": "Assemble the circuit", "instruction": "Connect: Solar panel positive → diode → battery positive. Battery negative → LED negative. LED positive → solar panel negative. Test in sunlight — the LED should charge the battery. At night, it should glow."},
    {"step": 4, "title": "House your light", "instruction": "Place the circuit in a recycled container — a jar, bottle, or tin can. Position the solar panel facing upward. Seal with hot glue or tape. Make sure the LED faces outward."},
    {"step": 5, "title": "Test and document", "instruction": "Charge in sunlight for 4-6 hours. At night, take a photo of your light glowing. Write: How bright is it? Where could this be useful? How much CO₂ does this save vs a battery-powered torch?"}
  ]'
);

-- ============================================================================
-- ADVANCED QUESTS (6 quests)
-- ============================================================================

INSERT INTO quests (title, description, tier, category, certificate_name, badge_icon, points_reward, estimated_days, steps) VALUES
(
  'Build a Backyard Compost System',
  'Design and build a full composting system capable of processing household and garden waste at scale.',
  'advanced', 'Waste Reduction', 'Composting Practitioner', '🏆', 500, 30,
  '[
    {"step": 1, "title": "Site selection and design", "instruction": "Choose a shaded spot at least 1m from your house. Design a 3-bin system: one for fresh waste, one for active composting, one for finished compost. Sketch your layout and dimensions."},
    {"step": 2, "title": "Build your bins", "instruction": "Use bamboo, wood pallets, or CHB blocks. Each bin should be at least 1m x 1m x 1m. Leave gaps for airflow. Build all three bins before adding materials."},
    {"step": 3, "title": "Establish your waste streams", "instruction": "Set up collection for: kitchen scraps (green), garden waste (brown), wood ash (activator). Train household members on what goes in. Post a guide near your bins."},
    {"step": 4, "title": "Run for 30 days", "instruction": "Add materials daily. Turn the active bin every 5 days. Monitor temperature — active compost heats up to 50-60°C. Document weekly with photos."},
    {"step": 5, "title": "Test your compost quality", "instruction": "After 30 days, test your finished compost: it should smell earthy, be dark brown, and crumble in your hand. Use it on a plant and document the result."},
    {"step": 6, "title": "Submit full documentation", "instruction": "Upload photos of each bin, your waste log, and a final reflection: How much waste did you divert? What challenges did you face? How could this scale to your barangay?"}
  ]'
),
(
  'Plan and Set Up a Small Container Farm',
  'Create a working urban farm with 5 or more crops using container gardening techniques.',
  'advanced', 'Urban Farming', 'Urban Farmer', '🏆', 500, 45,
  '[
    {"step": 1, "title": "Farm design", "instruction": "Plan your container farm layout. You need 5+ different crops. Mix root vegetables (kamote, labanos), leafy greens (pechay, kangkong), and herbs (basil, tanglad). Draw a layout showing container sizes and placement."},
    {"step": 2, "title": "Prepare containers and soil", "instruction": "Source containers: grow bags, large buckets, styrofoam boxes. Prepare soil mix: 1/3 garden soil, 1/3 compost, 1/3 coco coir. Ensure all containers have drainage holes."},
    {"step": 3, "title": "Plant and label", "instruction": "Plant each crop according to spacing requirements. Label every container with crop name, planting date, and expected harvest date. Record in a farm journal."},
    {"step": 4, "title": "Maintain for 30 days", "instruction": "Water daily, fertilize weekly with compost tea or organic fertilizer. Monitor for pests — use neem oil spray for organic pest control. Document growth weekly with photos."},
    {"step": 5, "title": "First harvest", "instruction": "Harvest your first ready crop. Weigh your produce. Calculate cost of production vs market price. Take photos of each harvested crop."},
    {"step": 6, "title": "Submit farm report", "instruction": "Submit: layout photo, weekly growth photos, harvest log with weights, and reflection on food security impact. What did you learn? How could this feed your community?"}
  ]'
),
(
  'Host a Repair or Upcycling Workshop',
  'Organise and run a community workshop teaching repair skills or upcycling techniques.',
  'advanced', 'Circular Economy', 'Circular Economy Facilitator', '🏆', 500, 21,
  '[
    {"step": 1, "title": "Plan your workshop", "instruction": "Choose a focus: clothing repair, electronics repair, furniture upcycling, or bottle/container crafts. Set a date, time, and venue. Target minimum 5 participants. Create a simple programme."},
    {"step": 2, "title": "Prepare materials", "instruction": "Source tools and materials. For sewing: needles, thread, fabric scraps. For electronics: basic tools, spare parts. For upcycling: paint, containers, creative materials. Prepare a handout participants can take home."},
    {"step": 3, "title": "Promote and confirm participants", "instruction": "Share on social media or community group chats. Confirm at least 5 participants. Prepare an attendance sheet. Brief any co-facilitators."},
    {"step": 4, "title": "Run the workshop", "instruction": "Start with a 10-minute intro on why repair matters (waste, cost, skills). Run hands-on activities. Each participant should complete at least one repair or upcycled item."},
    {"step": 5, "title": "Document everything", "instruction": "Take photos during the workshop: participants working, finished items, group photo. Collect the signed attendance sheet."},
    {"step": 6, "title": "Submit workshop report", "instruction": "Upload: photos, attendance sheet photo, and reflection. How many items were repaired or upcycled? What was the estimated waste diverted? Would participants attend again?"}
  ]'
),
(
  'Organise a Barangay-Level Clean-Up',
  'Plan and execute a community clean-up with proper waste segregation and documentation.',
  'advanced', 'Community Action', 'Community Mobiliser', '🏆', 500, 14,
  '[
    {"step": 1, "title": "Coordinate with your barangay", "instruction": "Visit your barangay hall. Inform the Barangay Captain or Environment Committee of your plan. Get a letter of support or endorsement if possible. Set a date with at least 2 weeks lead time."},
    {"step": 2, "title": "Recruit volunteers", "instruction": "Target minimum 10 volunteers. Reach out via community group chats, church, school, or neighbours. Assign roles: team leads, waste segregators, documenters."},
    {"step": 3, "title": "Prepare materials", "instruction": "Procure: garbage bags (colour-coded for segregation), gloves, tongs, face masks. Prepare a site map marking target areas. Brief volunteers on proper segregation: biodegradable, recyclable, residual."},
    {"step": 4, "title": "Execute the clean-up", "instruction": "Start with a briefing on safety and segregation. Clean in teams. Weigh or estimate the waste collected per category. Bring waste to designated drop-off points."},
    {"step": 5, "title": "Document the impact", "instruction": "Take before and after photos of the clean-up site. Photo the collected and segregated waste. Get a group photo with volunteers."},
    {"step": 6, "title": "Submit community report", "instruction": "Upload all photos, estimated waste volume by category, volunteer count, and reflection. What was the biggest challenge? What would you do differently next time?"}
  ]'
),
(
  'Design and Install a Basic Solar-Powered Device',
  'Build a functional solar-powered device that solves a real problem in your home or community.',
  'advanced', 'Renewable Energy', 'Renewable Energy Maker', '🏆', 600, 30,
  '[
    {"step": 1, "title": "Identify a problem to solve", "instruction": "Choose a real need: outdoor lighting for a pathway, a solar phone charger, a solar-powered water pump for a garden, or a solar ventilation fan. Write a problem statement and proposed solution."},
    {"step": 2, "title": "Design your system", "instruction": "Draw a circuit diagram. Calculate power needs: watts needed x hours of use = watt-hours per day. Size your solar panel and battery accordingly. List all components with estimated costs."},
    {"step": 3, "title": "Source components", "instruction": "Buy or salvage components. Check Quiapo, Deped surplus stores, or online. Verify solar panel voltage matches battery requirements. Test each component before assembly."},
    {"step": 4, "title": "Build and install", "instruction": "Assemble the circuit following your diagram. Mount the solar panel at optimal angle (facing south, tilted at your latitude angle). Weatherproof all connections with tape or sealant."},
    {"step": 5, "title": "Test and measure", "instruction": "Run for 3 days. Measure: hours of operation per day, any issues with overcharging or underperformance. Adjust panel angle or battery size if needed."},
    {"step": 6, "title": "Submit technical documentation", "instruction": "Upload: circuit diagram, component list with costs, installation photos, and performance log. What problem did it solve? What would you improve? Could this be replicated cheaply?"}
  ]'
),
(
  'Create a Barangay Waste Segregation Programme',
  'Design and launch a waste segregation awareness and implementation programme for your community.',
  'advanced', 'Zero Waste', 'Zero Waste Advocate', '🏆', 600, 30,
  '[
    {"step": 1, "title": "Research and assess", "instruction": "Survey 10 households in your barangay about current waste habits. Document: types of waste generated, current disposal methods, awareness of RA 9003 (Ecological Solid Waste Management Act). Create a simple report."},
    {"step": 2, "title": "Design the programme", "instruction": "Create a waste segregation guide in Filipino or your local dialect. Design colour coding: green (biodegradable), yellow (recyclable), red (residual/hazardous). Plan collection schedules and drop-off points."},
    {"step": 3, "title": "Coordinate with barangay", "instruction": "Present your programme to the barangay. Get endorsement. Identify a Barangay Eco-Champion (a resident who will champion the programme after you). Coordinate with your local MRF (Materials Recovery Facility) if available."},
    {"step": 4, "title": "Launch the programme", "instruction": "Distribute your guides to at least 10 households. Run a 30-minute orientation. Set up at least one collection point with labelled bins. Document the launch event with photos."},
    {"step": 5, "title": "Run for 2 weeks", "instruction": "Monitor participation. Do follow-up visits to households. Document compliance rates. Collect feedback. Make adjustments to the programme based on what you learn."},
    {"step": 6, "title": "Submit programme report", "instruction": "Upload: survey results, programme guide, launch photos, participation data, and final reflection. How many households participated? What barriers did you encounter? How can this be sustained?"}
  ]'
);

-- ============================================================================
-- SEED BADGES (Link to quests after inserting)
-- ============================================================================

-- Beginner badges
INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Soil Starter', '🌱', 'Completed the Start a Compost Jar quest', 'beginner', id
FROM quests WHERE title = 'Start a Compost Jar';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Seed Keeper', '🌿', 'Completed the Grow Herbs from Seeds quest', 'beginner', id
FROM quests WHERE title = 'Grow Herbs from Seeds';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Watt Watcher', '⚡', 'Completed the Track and Reduce Home Electricity Use quest', 'beginner', id
FROM quests WHERE title = 'Track and Reduce Home Electricity Use';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Clean Chemist', '🧴', 'Completed the Make Natural Cleaning Products at Home quest', 'beginner', id
FROM quests WHERE title = 'Make Natural Cleaning Products at Home';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Habitat Builder', '🐦', 'Completed the Build a DIY Bird Feeder quest', 'beginner', id
FROM quests WHERE title = 'Build a DIY Bird Feeder';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Light Maker', '☀️', 'Completed the Create a Solar Light by Hand quest', 'beginner', id
FROM quests WHERE title = 'Create a Solar Light by Hand';

-- Advanced badges (certificates)
INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Composting Practitioner', '🏆', 'Certified: Built a full backyard compost system', 'advanced', id
FROM quests WHERE title = 'Build a Backyard Compost System';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Urban Farmer', '🏆', 'Certified: Set up a 5+ crop container farm', 'advanced', id
FROM quests WHERE title = 'Plan and Set Up a Small Container Farm';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Circular Economy Facilitator', '🏆', 'Certified: Hosted a repair or upcycling workshop', 'advanced', id
FROM quests WHERE title = 'Host a Repair or Upcycling Workshop';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Community Mobiliser', '🏆', 'Certified: Organised a barangay-level clean-up', 'advanced', id
FROM quests WHERE title = 'Organise a Barangay-Level Clean-Up';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Renewable Energy Maker', '🏆', 'Certified: Designed and installed a solar-powered device', 'advanced', id
FROM quests WHERE title = 'Design and Install a Basic Solar-Powered Device';

INSERT INTO badges (name, icon, description, tier, quest_id)
SELECT 'Zero Waste Advocate', '🏆', 'Certified: Created a barangay waste segregation programme', 'advanced', id
FROM quests WHERE title = 'Create a Barangay Waste Segregation Programme';
