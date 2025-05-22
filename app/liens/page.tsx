"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// Données organisées par catégories
const utilsLinks = {
  Installation: [
    {
      name: "Next.js",
      url: "https://nextjs.org",
      order: 1,
    },
    {
      name: "Prisma",
      url: "https://www.prisma.io",
      order: 2,
    },
    {
      name: "Better Auth",
      url: "https://betterstack.com",
      order: 3,
    },
  ],
  "UI Library": [
    {
      name: "ShadCN UI",
      url: "https://ui.shadcn.dev",
      order: 1,
    },
    {
      name: "syntax-highlighter",
      url: "",
      order: 1,
    },
  ],
  IA: [
    {
      name: "IA Tool 1",
      url: "https://example.com/ia1",
      order: 1,
    },
    {
      name: "IA Tool 2",
      url: "https://example.com/ia2",
      order: 2,
    },
  ],
};

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-8 sm:p-20 space-y-16 font-[family-name:var(--font-geist-sans)]">
      <header className="text-3xl font-bold text-center sm:text-left">
        📚 Ressources & Outils du projet
      </header>

      <main className="space-y-16">
        {Object.entries(utilsLinks).map(([category, links]) => (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-semibold text-blue-300">{category}</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {links
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Card
                    key={item.name}
                    className="bg-slate-800 border-slate-700 text-white shadow-md hover:shadow-xl transition"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {item.name}
                        <Badge
                          variant="outline"
                          className="uppercase text-xs text-blue-300 border-blue-400"
                        >
                          {category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-end">
                      <Button
                        asChild
                        variant="secondary"
                        className="text-blue-200 hover:text-white"
                      >
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visiter
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </main>
      <SyntaxHighlighter language="tsx" style={materialDark}>
        {`
        
        // This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init
generator client {
  provider        = "prisma-client-js"
  output          = "../lib/generated/prisma/client"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  USER
  READER
  AUTHOR
  DEV
  ADMIN
}

enum Status {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  BLOCKED
  CANCELLED
}

enum ActionType {
  CREATE
  UPDATE
  DELETE
}

enum RelationType {
  IMPORT
  REFERENCE
  OTHER
}

// Models
model User {
  id            String   @id @default(uuid())
  name          String?
  email         String?  @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          Role     @default(USER)
  lang          String?  @default("en")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]
  verifications Verification[]
  projects      Project[]      @relation("ProjectUser")
  comments      Comment[]      @relation("CommentAuthor")

  @@index([email])
  @@map("user")
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                    String    @id @default(uuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("account")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  @@map("verification")
}

model Project {
  id          String    @id @default(uuid())
  name        String
  description String?
  image       String?
  status      Status    @default(TODO)
  priority    Int       @default(1)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  creatorId   String?

  users    User[]    @relation("ProjectUser")
  comments Comment[]

  @@index([name])
  @@index([status])
  @@map("project")
}

model Comment {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author   User   @relation("CommentAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  authorId String

  parentCommentId String?
  parentComment   Comment?  @relation("CommentHierarchy", fields: [parentCommentId], references: [id])
  childComments   Comment[] @relation("CommentHierarchy")

  projectId String?

  featureId String?

  userStoryId String?

  taskId  String?
  Project Project[]

  @@map("comment")
}

        
        `}
      </SyntaxHighlighter>
    </div>
  );
}

export default Page;
