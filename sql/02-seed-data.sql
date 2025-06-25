-- Wildlife Conservation Database Seed Data
-- Sample data for development and testing
-- Based on the original seed.js file

-- Insert users (if they don't already exist)

-- Admin user (password: admin123)
INSERT INTO "users" ("email", "name", "password", "role", "approved", "enabled", "created_at", "updated_at")
SELECT 'admin@wildlife.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'admin@wildlife.com');

-- Researcher user (password: researcher123)
INSERT INTO "users" ("email", "name", "password", "role", "approved", "enabled", "created_at", "updated_at")
SELECT 'researcher@wildlife.com', 'Dr. Sarah Williams', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTRIBUTOR', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'researcher@wildlife.com');

-- Get the researcher user ID for article authoring
DO $$
DECLARE
    researcher_id INTEGER;
BEGIN
    SELECT id INTO researcher_id FROM "users" WHERE email = 'researcher@wildlife.com';
    
    -- Only insert articles if none exist
    IF NOT EXISTS (SELECT 1 FROM "articles") THEN
        
        -- Article 1: The Majestic Tigers of Sundarbans
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'The Majestic Tigers of Sundarbans',
            '<p>The Sundarbans, the largest mangrove forest in the world, is home to the magnificent Royal Bengal Tiger. These incredible creatures have adapted to life in the wetlands, becoming excellent swimmers and fierce hunters.</p>

<p>Recent conservation efforts have shown promising results, with tiger populations slowly recovering from near extinction. The unique ecosystem of the Sundarbans provides the perfect habitat for these endangered cats.</p>

<p>Our research team has been studying tiger behavior patterns for over five years, documenting their hunting techniques, territorial marking, and social interactions. The data collected has been crucial in developing better conservation strategies.</p>

<h3>Conservation Efforts</h3>
<p>The government has established several protected areas and anti-poaching units to safeguard these magnificent creatures. Community involvement has been crucial in these conservation efforts.</p>

<h3>Future Prospects</h3>
<p>With continued protection and habitat restoration, we are optimistic about the future of Bengal tigers in the Sundarbans.</p>',
            'Exploring the magnificent Royal Bengal Tigers in the Sundarbans mangrove forests and recent conservation efforts.',
            'Big Cats',
            ARRAY['Tigers', 'Conservation', 'Sundarbans', 'Endangered Species', 'Big Cats'],
            ARRAY[
                '{"id": "tiger-sundarbans-1", "url": "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800", "caption": "A Royal Bengal Tiger in its natural habitat", "alt": "Royal Bengal Tiger"}'::jsonb,
                '{"id": "mangrove-forest-1", "url": "https://images.unsplash.com/photo-1544985361-b420d7a77043?w=800", "caption": "Mangrove forests of Sundarbans", "alt": "Sundarbans mangrove forest"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            true,
            true,
            1247,
            researcher_id,
            '2024-01-15 10:30:00'::timestamp,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        -- Article 2: Amazon Rainforest
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Amazon Rainforest: A Biodiversity Hotspot Under Threat',
            '<p>The Amazon rainforest, often called the "lungs of the Earth," is home to an incredible array of wildlife species. From colorful macaws to elusive jaguars, this ecosystem supports millions of species, many of which remain undiscovered.</p>

<p>Climate change and deforestation pose significant threats to this irreplaceable ecosystem. Our recent expedition documented several species that are rapidly losing their habitats due to human activities.</p>

<p>Conservation efforts must be intensified to protect not only the wildlife but also the indigenous communities that have called this forest home for centuries.</p>

<h3>Biodiversity Crisis</h3>
<p>The Amazon is losing approximately 10,000 species per year due to habitat destruction. This rate of extinction is unprecedented in human history.</p>

<h3>Conservation Solutions</h3>
<p>Sustainable development, indigenous land rights, and international cooperation are essential for preserving this vital ecosystem.</p>',
            'Documenting the incredible biodiversity of the Amazon rainforest and the urgent need for conservation.',
            'Ecosystems',
            ARRAY['Amazon', 'Rainforest', 'Biodiversity', 'Conservation', 'Climate Change'],
            ARRAY[
                '{"id": "amazon-canopy-1", "url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "caption": "Aerial view of the Amazon rainforest", "alt": "Amazon rainforest canopy"}'::jsonb,
                '{"id": "amazon-macaw-1", "url": "https://images.unsplash.com/photo-1507666405895-b295bf6ee7bb?w=800", "caption": "Colorful macaw in the Amazon", "alt": "Macaw bird"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            true,
            false,
            892,
            researcher_id,
            '2024-01-20 14:15:00'::timestamp,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        -- Article 3: Arctic Wildlife
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Arctic Wildlife: Adapting to a Changing Climate',
            '<p>The Arctic region is experiencing rapid environmental changes, with temperatures rising twice as fast as the global average. This dramatic shift is forcing Arctic wildlife to adapt quickly or face extinction.</p>

<p>Polar bears, Arctic foxes, and seals are among the species most affected by melting sea ice. Our research team has been tracking these animals using satellite collars and GPS technology to understand their changing migration patterns.</p>

<p>The data we''ve collected reveals alarming trends that require immediate conservation action. International cooperation is essential to protect these magnificent creatures and their fragile ecosystem.</p>

<h3>Impact on Species</h3>
<p>Many Arctic species are struggling to find food and suitable breeding grounds as their icy habitat disappears.</p>

<h3>Research Findings</h3>
<p>Our five-year study shows significant changes in migration routes and feeding patterns among Arctic mammals.</p>',
            'Studying how Arctic wildlife is adapting to rapid climate change and melting ice.',
            'Climate Change',
            ARRAY['Arctic', 'Climate Change', 'Polar Bears', 'Conservation', 'Wildlife Tracking'],
            ARRAY[
                '{"id": "polar-bear-ice-1", "url": "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800", "caption": "Polar bear on melting ice", "alt": "Polar bear on ice"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            true,
            true,
            1534,
            researcher_id,
            '2024-01-10 09:00:00'::timestamp,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        -- Article 4: African Elephants (Draft)
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'African Elephants: The Gentle Giants of the Savanna',
            '<p>African elephants are among the most intelligent and emotionally complex animals on Earth. These gentle giants play a crucial role in maintaining the ecological balance of African savannas.</p>

<p>However, they face unprecedented threats from poaching, habitat loss, and human-wildlife conflict. Our research focuses on understanding elephant social structures and developing strategies for their protection.</p>

<p>Through our work with local communities, we''ve seen remarkable success in reducing human-elephant conflict while promoting conservation awareness.</p>

<h3>Social Intelligence</h3>
<p>Elephants demonstrate remarkable social intelligence, with complex family structures and emotional bonds that last a lifetime.</p>

<h3>Conservation Challenges</h3>
<p>Despite legal protection, elephant populations continue to decline due to poaching and habitat fragmentation.</p>',
            'Learn about the complex social structures of African elephants and the conservation challenges they face in the modern world.',
            'Large Mammals',
            ARRAY['Large Mammals', 'Elephants', 'Conservation', 'Africa', 'Social Behavior'],
            ARRAY[
                '{"id": "elephant-herd-1", "url": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800", "caption": "African elephant herd in savanna", "alt": "African elephant herd"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            false,  -- Draft article
            false,
            0,
            researcher_id,
            NULL,  -- No publish date for draft
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        -- Additional sample articles for more variety
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Marine Conservation: Protecting Our Oceans',
            '<p>Our oceans are facing unprecedented challenges from pollution, overfishing, and climate change. Marine conservation efforts are crucial for protecting the diverse ecosystems that support millions of species.</p>

<p>From coral reefs to deep-sea environments, each marine habitat plays a vital role in maintaining ocean health. Recent studies show that marine protected areas can significantly help in species recovery.</p>

<h3>Coral Reef Protection</h3>
<p>Coral reefs are among the most biodiverse ecosystems on Earth, yet they are severely threatened by rising ocean temperatures and acidification.</p>

<h3>Sustainable Fishing</h3>
<p>Implementing sustainable fishing practices is essential for maintaining fish populations and marine ecosystem balance.</p>',
            'Exploring marine conservation efforts and the importance of protecting our ocean ecosystems.',
            'Marine Life',
            ARRAY['Marine Conservation', 'Oceans', 'Coral Reefs', 'Sustainable Fishing', 'Climate Change'],
            ARRAY[
                '{"id": "coral-reef-1", "url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", "caption": "Vibrant coral reef ecosystem", "alt": "Coral reef"}'::jsonb,
                '{"id": "sea-turtle-1", "url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "caption": "Sea turtle swimming near coral", "alt": "Sea turtle"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            true,
            false,
            673,
            researcher_id,
            '2024-01-25 11:45:00'::timestamp,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", "videos", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Bird Migration Patterns: Understanding Seasonal Journeys',
            '<p>Bird migration is one of nature''s most remarkable phenomena. Every year, billions of birds embark on incredible journeys across continents, following ancient routes passed down through generations.</p>

<p>Climate change is significantly affecting traditional migration patterns, forcing many species to adapt their routes and timing. Our research team has been tracking various bird species to understand these changes.</p>

<h3>Technology in Bird Tracking</h3>
<p>Modern GPS technology and satellite tracking have revolutionized our understanding of bird migration patterns.</p>

<h3>Conservation Implications</h3>
<p>Understanding migration routes is crucial for creating protected corridors and ensuring the survival of migratory species.</p>',
            'Tracking bird migration patterns and how climate change is affecting these ancient journeys.',
            'Birds',
            ARRAY['Birds', 'Migration', 'Climate Change', 'GPS Tracking', 'Conservation'],
            ARRAY[
                '{"id": "migrating-birds-1", "url": "https://images.unsplash.com/photo-1516109644317-b82e02060972?w=800", "caption": "Flock of migrating birds", "alt": "Migrating birds"}'::jsonb
            ],
            ARRAY[]::jsonb[],
            true,
            false,
            456,
            researcher_id,
            '2024-01-30 08:20:00'::timestamp,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Sample articles inserted successfully!';
    ELSE
        RAISE NOTICE 'Articles already exist, skipping insertion.';
    END IF;
END $$;

-- Create some additional sample categories and tags for variety
INSERT INTO "articles" ("title", "content", "excerpt", "category", "tags", "published", "author_id", "publish_date", "created_at", "updated_at")
SELECT 
    'Primates in Peril: Protecting Our Closest Relatives',
    '<p>Primates around the world face numerous threats from habitat destruction, hunting, and disease. These intelligent creatures share over 98% of their DNA with humans, making their conservation particularly important.</p>',
    'Understanding the challenges facing primate populations and conservation efforts to protect them.',
    'Primates',
    ARRAY['Primates', 'Endangered Species', 'Habitat Loss', 'Conservation', 'Biodiversity'],
    true,
    (SELECT id FROM "users" WHERE email = 'researcher@wildlife.com'),
    '2024-02-01 13:30:00'::timestamp,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "articles" WHERE title = 'Primates in Peril: Protecting Our Closest Relatives');

-- Verify data insertion
DO $$
DECLARE
    user_count INTEGER;
    article_count INTEGER;
    published_count INTEGER;
    draft_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "users";
    SELECT COUNT(*) INTO article_count FROM "articles";
    SELECT COUNT(*) INTO published_count FROM "articles" WHERE published = true;
    SELECT COUNT(*) INTO draft_count FROM "articles" WHERE published = false;
    
    RAISE NOTICE '=== Seed Data Summary ===';
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Total articles: %', article_count;
    RAISE NOTICE 'Published articles: %', published_count;
    RAISE NOTICE 'Draft articles: %', draft_count;
    RAISE NOTICE '========================';
    RAISE NOTICE 'Default login credentials:';
    RAISE NOTICE 'Admin: admin@wildlife.com / admin123';
    RAISE NOTICE 'Researcher: researcher@wildlife.com / researcher123';
END $$; 