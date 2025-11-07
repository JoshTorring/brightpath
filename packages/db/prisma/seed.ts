import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed minimal content topic
  await prisma.contentTopic.upsert({
    where: { slug: "getting-started" },
    update: {},
    create: {
      slug: "getting-started",
      title: "Getting Started with BrightPath",
      tags: ["intro","family"],
      summary: "Welcome to your calm, friendly ADHD support space.",
      readingLevel: "child",
      pages: {
        create: [{
          locale: "en-GB",
          childMdx: "## Hello!\nThis is a friendly place to learn.",
          parentMdx: "## Welcome\nOverview and next steps for parents.",
          sourcesJson: JSON.stringify([]),
          version: "1.0.0"
        }]
      }
    }
  });
  console.log("Seeded: content topic");
}

main().finally(() => prisma.$disconnect());
