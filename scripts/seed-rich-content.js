const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding rich content...");

    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.error("No users found. Please create a user first.");
        return;
    }

    const adminUser = users.find(u => u.role === "ADMIN" || u.role === "SUPERADMIN") || users[0];

    console.log(`Using user ${adminUser.name} (${adminUser.id}) for authoring...`);

    // Clean up old sample data if needed, or just append
    // await prisma.announcement.deleteMany();
    // await prisma.page.deleteMany();

    const sampleImages = [
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
    ];

    // Seed 10 Announcements
    for (let i = 1; i <= 10; i++) {
        const image = sampleImages[i % sampleImages.length];
        await prisma.announcement.create({
            data: {
                title: `Company Update Q${(i % 4) + 1} - Notice #${i}`,
                content: `
                    <p>Hello team, we have some exciting updates for everyone regarding our upcoming initiatives. Please review the details carefully.</p>
                    <p>Here are the key points to focus on this quarter:</p>
                    <ul>
                        <li><strong>Growth & Expansion:</strong> We are launching new markets.</li>
                        <li><strong>Team Building:</strong> Join us for the upcoming retreat. <a href="https://example.com" target="_blank" rel="noopener noreferrer">Register here</a>.</li>
                        <li><strong>New Policies:</strong> Make sure to read the updated Wiki pages.</li>
                    </ul>
                    <img src="${image}" alt="Sample office image" style="border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem; width: 100%; max-width: 600px; height: auto;" />
                    <p>If you have any questions, please reach out to HR or your direct manager. Let's make this quarter our best one yet!</p>
                `,
                authorId: adminUser.id
            }
        });
    }

    console.log("Created 10 Announcements!");

    // Seed 10 Wiki Pages
    for (let i = 1; i <= 10; i++) {
        const image = sampleImages[(i + 3) % sampleImages.length];
        const slug = `wiki-sample-page-${i}-${Date.now()}`;
        await prisma.page.create({
            data: {
                title: `Engineering Standard Operating Procedure #${i}`,
                slug: slug,
                icon: i % 2 === 0 ? "BookOpen" : "FileText",
                content: `
                    <h2>Overview</h2>
                    <p>This document serves as the standard operating procedure for our engineering and product teams. It outlines the best practices, code review guidelines, and deployment strategies.</p>
                    
                    <h3>1. Development Workflow</h3>
                    <p>All developers must adhere to the standard git flow:</p>
                    <ul>
                        <li>Branch off from <code>main</code> to create a feature branch.</li>
                        <li>Open a Pull Request and request at least 2 reviews.</li>
                        <li>Ensure all CI/CD pipelines pass before merging.</li>
                    </ul>

                    <h3>2. Architecture Diagram</h3>
                    <img src="${image}" alt="Architecture Diagram" style="border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem; width: 100%; max-width: 600px; height: auto;" />

                    <h3>3. Important Resources</h3>
                    <p>For more detailed technical documentation, please refer to the following links:</p>
                    <ul>
                        <li><a href="https://github.com" target="_blank">Internal GitHub Organization</a></li>
                        <li><a href="https://aws.amazon.com" target="_blank">AWS Infrastructure Console</a></li>
                        <li><a href="https://datadoghq.com" target="_blank">Monitoring & Observability</a></li>
                    </ul>

                    <p>Please remember to update this document as our processes evolve.</p>
                `,
                authorId: adminUser.id
            }
        });
    }

    console.log("Created 10 Wiki Pages!");
    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
