import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
const prisma = new PrismaClient();

async function main() {
  const passwordHash = (() => {
    const salt = randomBytes(16).toString("hex");
    const derived = scryptSync("BrightPath!23!", salt, 64);
    return `${salt}:${derived.toString("hex")}`;
  })();

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {
      name: "Parent Pat",
      role: "parent",
      passwordHash,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      verificationTokenExpiresAt: null,
    },
    create: {
      email: "parent@example.com",
      name: "Parent Pat",
      role: "parent",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const practitionerUser = await prisma.user.upsert({
    where: { email: "practitioner@example.com" },
    update: {
      name: "Dr Practice",
      role: "practitioner",
      passwordHash,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      verificationTokenExpiresAt: null,
    },
    create: {
      email: "practitioner@example.com",
      name: "Dr Practice",
      role: "practitioner",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin Ada",
      role: "admin",
      passwordHash,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      verificationTokenExpiresAt: null,
    },
    create: {
      email: "admin@example.com",
      name: "Admin Ada",
      role: "admin",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const practitioner = await prisma.practitioner.upsert({
    where: { userId: practitionerUser.id },
    update: {},
    create: {
      userId: practitionerUser.id,
      verificationStatus: "verified",
      specialties: ["adhd"],
    },
  });

  let child = await prisma.childProfile.findFirst({ where: { userId: parentUser.id } });
  if (!child) {
    child = await prisma.childProfile.create({
      data: {
        userId: parentUser.id,
        name: "Alex Example",
        preferredName: "Lex",
        dob: new Date("2013-03-15"),
        consentStatus: "pending",
      },
    });
  }

  await prisma.patientLink.upsert({
    where: { id: child.id },
    update: {},
    create: {
      id: child.id,
      childId: child.id,
      practitionerId: practitioner.id,
      orgId: "demo-clinic",
    },
  });

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
  console.log("Seeded: demo users, practitioner link, and content topic");
}

main().finally(() => prisma.$disconnect());
