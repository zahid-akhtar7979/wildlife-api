const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if users already exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@wildlife.com' }
  });

  let admin;
  if (!existingAdmin) {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@wildlife.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        approved: true,
        enabled: true,
      },
    });
    console.log('✅ Admin user created:', admin.email);
  } else {
    admin = existingAdmin;
    console.log('✅ Admin user already exists:', admin.email);
  }

  const existingResearcher = await prisma.user.findUnique({
    where: { email: 'researcher@wildlife.com' }
  });

  let researcher;
  if (!existingResearcher) {
    // Create researcher user
    const researcherPassword = await bcrypt.hash('researcher123', 10);
    researcher = await prisma.user.create({
      data: {
        email: 'researcher@wildlife.com',
        name: 'Dr. Sarah Williams',
        password: researcherPassword,
        role: 'CONTRIBUTOR',
        approved: true,
        enabled: true,
      },
    });
    console.log('✅ Researcher user created:', researcher.email);
  } else {
    researcher = existingResearcher;
    console.log('✅ Researcher user already exists:', researcher.email);
  }

  // Check if articles already exist
  const existingArticles = await prisma.article.count();
  
  if (existingArticles === 0) {
    // Create sample articles
    const articles = [
      {
        title: 'The Majestic Tigers of Sundarbans',
        content: `<p>The Sundarbans, the largest mangrove forest in the world, is home to the magnificent Royal Bengal Tiger. These incredible creatures have adapted to life in the wetlands, becoming excellent swimmers and fierce hunters.</p>

<p>Recent conservation efforts have shown promising results, with tiger populations slowly recovering from near extinction. The unique ecosystem of the Sundarbans provides the perfect habitat for these endangered cats.</p>

<p>Our research team has been studying tiger behavior patterns for over five years, documenting their hunting techniques, territorial marking, and social interactions. The data collected has been crucial in developing better conservation strategies.</p>

<h3>Conservation Efforts</h3>
<p>The government has established several protected areas and anti-poaching units to safeguard these magnificent creatures. Community involvement has been crucial in these conservation efforts.</p>

<h3>Future Prospects</h3>
<p>With continued protection and habitat restoration, we are optimistic about the future of Bengal tigers in the Sundarbans.</p>`,
        excerpt: 'Exploring the magnificent Royal Bengal Tigers in the Sundarbans mangrove forests and recent conservation efforts.',
        category: 'Big Cats',
        tags: ['Tigers', 'Conservation', 'Sundarbans', 'Endangered Species', 'Big Cats'],
        images: [
          {
            id: 'tiger-sundarbans-1',
            url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
            caption: 'A Royal Bengal Tiger in its natural habitat',
            alt: 'Royal Bengal Tiger'
          },
          {
            id: 'mangrove-forest-1',
            url: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?w=800',
            caption: 'Mangrove forests of Sundarbans',
            alt: 'Sundarbans mangrove forest'
          }
        ],
        videos: [],
        published: true,
        featured: true,
        views: 1247,
        authorId: researcher.id,
        publishDate: new Date('2024-01-15T10:30:00Z')
      },
      {
        title: 'Amazon Rainforest: A Biodiversity Hotspot Under Threat',
        content: `<p>The Amazon rainforest, often called the "lungs of the Earth," is home to an incredible array of wildlife species. From colorful macaws to elusive jaguars, this ecosystem supports millions of species, many of which remain undiscovered.</p>

<p>Climate change and deforestation pose significant threats to this irreplaceable ecosystem. Our recent expedition documented several species that are rapidly losing their habitats due to human activities.</p>

<p>Conservation efforts must be intensified to protect not only the wildlife but also the indigenous communities that have called this forest home for centuries.</p>

<h3>Biodiversity Crisis</h3>
<p>The Amazon is losing approximately 10,000 species per year due to habitat destruction. This rate of extinction is unprecedented in human history.</p>

<h3>Conservation Solutions</h3>
<p>Sustainable development, indigenous land rights, and international cooperation are essential for preserving this vital ecosystem.</p>`,
        excerpt: 'Documenting the incredible biodiversity of the Amazon rainforest and the urgent need for conservation.',
        category: 'Ecosystems',
        tags: ['Amazon', 'Rainforest', 'Biodiversity', 'Conservation', 'Climate Change'],
        images: [
          {
            id: 'amazon-canopy-1',
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
            caption: 'Aerial view of the Amazon rainforest',
            alt: 'Amazon rainforest canopy'
          },
          {
            id: 'amazon-macaw-1',
            url: 'https://images.unsplash.com/photo-1507666405895-b295bf6ee7bb?w=800',
            caption: 'Colorful macaw in the Amazon',
            alt: 'Macaw bird'
          }
        ],
        videos: [],
        published: true,
        featured: false,
        views: 892,
        authorId: researcher.id,
        publishDate: new Date('2024-01-20T14:15:00Z')
      },
      {
        title: 'Arctic Wildlife: Adapting to a Changing Climate',
        content: `<p>The Arctic region is experiencing rapid environmental changes, with temperatures rising twice as fast as the global average. This dramatic shift is forcing Arctic wildlife to adapt quickly or face extinction.</p>

<p>Polar bears, Arctic foxes, and seals are among the species most affected by melting sea ice. Our research team has been tracking these animals using satellite collars and GPS technology to understand their changing migration patterns.</p>

<p>The data we've collected reveals alarming trends that require immediate conservation action. International cooperation is essential to protect these magnificent creatures and their fragile ecosystem.</p>

<h3>Impact on Species</h3>
<p>Many Arctic species are struggling to find food and suitable breeding grounds as their icy habitat disappears.</p>

<h3>Research Findings</h3>
<p>Our five-year study shows significant changes in migration routes and feeding patterns among Arctic mammals.</p>`,
        excerpt: 'Studying how Arctic wildlife is adapting to rapid climate change and melting ice.',
        category: 'Climate Change',
        tags: ['Arctic', 'Climate Change', 'Polar Bears', 'Conservation', 'Wildlife Tracking'],
        images: [
          {
            id: 'polar-bear-ice-1',
            url: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800',
            caption: 'Polar bear on melting ice',
            alt: 'Polar bear on ice'
          }
        ],
        videos: [],
        published: true,
        featured: true,
        views: 1534,
        authorId: researcher.id,
        publishDate: new Date('2024-01-10T09:00:00Z')
      },
      {
        title: 'African Elephants: The Gentle Giants of the Savanna',
        content: `<p>African elephants are among the most intelligent and emotionally complex animals on Earth. These gentle giants play a crucial role in maintaining the ecological balance of African savannas.</p>

<p>However, they face unprecedented threats from poaching, habitat loss, and human-wildlife conflict. Our research focuses on understanding elephant social structures and developing strategies for their protection.</p>

<p>Through our work with local communities, we've seen remarkable success in reducing human-elephant conflict while promoting conservation awareness.</p>

<h3>Social Intelligence</h3>
<p>Elephants demonstrate remarkable social intelligence, with complex family structures and emotional bonds that last a lifetime.</p>

<h3>Conservation Challenges</h3>
<p>Despite legal protection, elephant populations continue to decline due to poaching and habitat fragmentation.</p>`,
        excerpt: 'Learn about the complex social structures of African elephants and the conservation challenges they face in the modern world.',
        category: 'Large Mammals',
        tags: ['Large Mammals', 'Elephants', 'Conservation', 'Africa', 'Social Behavior'],
        images: [
          {
            id: 'elephant-herd-1',
            url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
            caption: 'African elephant herd in savanna',
            alt: 'African elephant herd'
          }
        ],
        videos: [],
        published: false, // Draft article
        featured: false,
        views: 0,
        authorId: researcher.id,
        publishDate: null
      }
    ];

    for (const articleData of articles) {
      const article = await prisma.article.create({
        data: articleData,
      });
      console.log(`✅ Article created: ${article.title}`);
    }
  } else {
    console.log('✅ Articles already exist, skipping creation');
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Default users created:');
  console.log('👤 Admin: admin@wildlife.com / admin123');
  console.log('👤 Researcher: researcher@wildlife.com / researcher123');
  console.log('\n📊 Sample data:');
  console.log('📰 3 published articles');
  console.log('📝 1 draft article');
  console.log('🏷️ Various categories and tags');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 