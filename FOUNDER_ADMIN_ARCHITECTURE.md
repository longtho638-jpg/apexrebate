# 🏛️ Founder Admin Architecture (November 2025)

> **Full SEED + User Management System với Kimi K2 Automation**
> Thiết kế cho nhà sáng lập quản lý toàn bộ vận hành, user data, tool marketplace, payouts, policies

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOUNDER ADMIN DASHBOARD                      │
│                          (/admin)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Users Ops  │  │  Seed Mgmt   │          │
│  │  (Analytics) │  │  (CRUD + KYC)│  │  (Tools + IA)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Payouts     │  │   Policies   │  │   DLQ + 2E   │          │
│  │  (Clawback)  │  │  (OPA Gate)  │  │  (Audit)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  SLO + Logs  │  │   Security   │  │  Automation  │          │
│  │  (Metrics)   │  │  (Secrets)   │  │  (Kimi K2)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│              API Layer (RESTful + GraphQL)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Auth │ User CRUD │ Seed Ops │ Policy Gate │ Audit Trail│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│              Database Layer (Neon PostgreSQL)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User │ Tool │ Policy │ Audit │ DLQ │ Secrets │ SLO │ Logs     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Directory Structure

```
src/
├── app/admin/
│   ├── layout.tsx                    # Admin wrapper + auth guard
│   ├── page.tsx                      # Dashboard overview
│   ├── dashboard/
│   │   ├── page.tsx                  # Stats cards + charts
│   │   └── analytics-client.tsx      # Real-time metrics
│   ├── users/
│   │   ├── page.tsx                  # User list + search
│   │   ├── [id]/
│   │   │   └── page.tsx              # User detail view
│   │   └── new/
│   │       └── page.tsx              # Create user form
│   ├── seeds/
│   │   ├── page.tsx                  # Tool marketplace admin
│   │   ├── [id]/
│   │   │   └── page.tsx              # Edit tool details
│   │   └── batch-upload/
│   │       └── page.tsx              # Bulk upload tools
│   ├── payouts/
│   │   ├── page.tsx                  # Payout history
│   │   ├── [id]/
│   │   │   └── page.tsx              # Transaction detail
│   │   └── clawback/
│   │       └── page.tsx              # Clawback management
│   ├── policies/
│   │   ├── page.tsx                  # Policy bundles list
│   │   ├── [id]/
│   │   │   └── page.tsx              # Edit policy
│   │   └── opa-studio/
│   │       └── page.tsx              # OPA policy editor
│   ├── dlq/
│   │   ├── page.tsx                  # Dead letter queue
│   │   └── [id]/
│   │       └── page.tsx              # DLQ item detail
│   ├── security/
│   │   ├── page.tsx                  # Secrets + JWKS
│   │   └── audit-logs/
│   │       └── page.tsx              # Audit trail viewer
│   ├── automation/
│   │   ├── page.tsx                  # Kimi K2 automation
│   │   ├── workflows/
│   │   │   └── page.tsx              # Automation workflows
│   │   └── triggers/
│   │       └── page.tsx              # Automation triggers
│   └── settings/
│       ├── page.tsx                  # Admin settings
│       ├── users-roles/
│       │   └── page.tsx              # Role management
│       └── notifications/
│           └── page.tsx              # Alert settings
│
├── app/api/admin/
│   ├── auth/
│   │   ├── check/route.ts            # Check founder access
│   │   └── 2eyes/route.ts            # 2-eyes verification
│   ├── users/
│   │   ├── list/route.ts             # GET all users
│   │   ├── [id]/route.ts             # GET/PUT/DELETE user
│   │   ├── batch/route.ts            # Bulk operations
│   │   └── kyc/route.ts              # KYC verification
│   ├── seeds/
│   │   ├── list/route.ts             # GET all tools
│   │   ├── [id]/route.ts             # GET/PUT/DELETE tool
│   │   ├── batch-upload/route.ts     # CSV import
│   │   └── approve/route.ts          # Tool approval
│   ├── payouts/
│   │   ├── list/route.ts             # GET payouts
│   │   ├── [id]/route.ts             # GET payout detail
│   │   ├── process/route.ts          # Trigger payout
│   │   └── clawback/route.ts         # Clawback request
│   ├── policies/
│   │   ├── list/route.ts             # GET policies
│   │   ├── [id]/route.ts             # GET/PUT policy
│   │   ├── bundle/route.ts           # Bundle management
│   │   └── compile/route.ts          # OPA compilation
│   ├── dlq/
│   │   ├── list/route.ts             # GET DLQ items
│   │   ├── [id]/route.ts             # GET/DELETE DLQ item
│   │   └── replay/route.ts           # Replay webhook
│   ├── security/
│   │   ├── jwks/route.ts             # Manage JWKS keys
│   │   ├── secrets/route.ts          # Manage secrets
│   │   └── audit-logs/route.ts       # Fetch audit logs
│   ├── automation/
│   │   ├── workflows/route.ts        # Kimi K2 workflows
│   │   ├── triggers/route.ts         # Automation triggers
│   │   └── execute/route.ts          # Run automation
│   └── sync/
│       ├── users/route.ts            # Sync user data
│       ├── seeds/route.ts            # Sync tool data
│       └── metrics/route.ts          # Sync metrics
│
├── components/admin/
│   ├── dashboard/
│   │   ├── stat-card.tsx             # Stats card component
│   │   ├── chart-revenue.tsx         # Revenue chart
│   │   ├── chart-users.tsx           # User growth chart
│   │   ├── chart-tools.tsx           # Tool distribution
│   │   └── real-time-feed.tsx        # Real-time activity
│   ├── users/
│   │   ├── user-table.tsx            # Users list table
│   │   ├── user-form.tsx             # Create/edit form
│   │   ├── user-detail-panel.tsx     # Side panel detail
│   │   ├── kyc-status-badge.tsx      # KYC status display
│   │   └── user-actions.tsx          # Bulk actions
│   ├── seeds/
│   │   ├── seed-table.tsx            # Tools list table
│   │   ├── seed-form.tsx             # Create/edit form
│   │   ├── seed-detail-panel.tsx     # Side panel detail
│   │   ├── batch-upload-wizard.tsx   # CSV import UI
│   │   └── seed-approval-modal.tsx   # Approval workflow
│   ├── payouts/
│   │   ├── payout-table.tsx          # Payouts list
│   │   ├── payout-detail-panel.tsx   # Detail view
│   │   ├── clawback-form.tsx         # Clawback request
│   │   └── payout-timeline.tsx       # Timeline view
│   ├── policies/
│   │   ├── policy-table.tsx          # Policies list
│   │   ├── policy-editor.tsx         # OPA editor
│   │   ├── opa-studio.tsx            # OPA visual editor
│   │   └── policy-history.tsx        # Version control
│   ├── shared/
│   │   ├── admin-layout.tsx          # Main layout wrapper
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   ├── topbar.tsx                # Top navigation
│   │   ├── modal-confirm.tsx         # Confirmation modal
│   │   ├── loading-spinner.tsx       # Loading state
│   │   ├── error-boundary.tsx        # Error handling
│   │   ├── two-eyes-modal.tsx        # 2-eyes auth
│   │   └── toast-notifications.tsx   # Toast UI
│   └── automation/
│       ├── workflow-editor.tsx       # Workflow builder
│       ├── trigger-selector.tsx      # Trigger picker
│       └── automation-status.tsx     # Status monitor
│
└── lib/admin/
    ├── auth.ts                       # Admin auth helpers
    ├── db.ts                         # Database queries
    ├── api-client.ts                 # API client wrapper
    ├── validators.ts                 # Form validation
    ├── parsers.ts                    # CSV/JSON parsers
    ├── kimi-k2.ts                    # Kimi K2 integration
    ├── automation.ts                 # Automation engine
    └── hooks.ts                      # Custom React hooks
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

```typescript
// types/admin.ts
enum AdminRole {
  FOUNDER = "FOUNDER",           // Full access (you)
  MANAGER = "MANAGER",           // Operations manager
  ANALYST = "ANALYST",           // Read-only dashboards
  MODERATOR = "MODERATOR",       // User moderation only
  AUDITOR = "AUDITOR"            // Audit logs only
}

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  twoeyes: boolean;              // Requires 2-eyes approval?
  lastLogin: Date;
  createdAt: Date;
}

enum AdminPermission {
  // Users
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_KYC = "user:kyc",

  // Seeds
  SEED_READ = "seed:read",
  SEED_CREATE = "seed:create",
  SEED_UPDATE = "seed:update",
  SEED_DELETE = "seed:delete",
  SEED_APPROVE = "seed:approve",

  // Payouts
  PAYOUT_READ = "payout:read",
  PAYOUT_PROCESS = "payout:process",
  PAYOUT_CLAWBACK = "payout:clawback",

  // Policies
  POLICY_READ = "policy:read",
  POLICY_UPDATE = "policy:update",
  POLICY_DEPLOY = "policy:deploy",

  // Security
  SECURITY_READ = "security:read",
  SECURITY_UPDATE = "security:update",

  // Admin
  ADMIN_SETTINGS = "admin:settings",
  ADMIN_AUDIT = "admin:audit"
}
```

### Middleware Implementation

```typescript
// src/app/api/admin/auth/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
    include: { permissions: true }
  });

  if (!adminUser) {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  // Check if 2-eyes required for sensitive operation
  const requiredPermissions = req.headers.get("x-required-permissions")?.split(",") || [];
  const hasMissing = requiredPermissions.some(
    p => !adminUser.permissions.some(perm => perm.name === p)
  );

  if (hasMissing) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return NextResponse.json({
    admin: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions.map(p => p.name),
      twoeyes: adminUser.twoeyes
    }
  });
}
```

---

## 📋 User Management (Full CRUD + KYC)

### Database Schema

```prisma
// prisma/schema.prisma - Extended models

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  phone             String?
  avatar            String?
  
  // Account Status
  status            AccountStatus @default(ACTIVE)  // ACTIVE | SUSPENDED | DELETED
  emailVerified     Boolean   @default(false)
  
  // KYC
  kyc               KYCStatus @default(PENDING)
  kycDocument       String?   // URL to KYC doc
  kycVerifiedAt     DateTime?
  kycVerifiedBy     String?   // Admin user ID
  
  // Personal Info
  dateOfBirth       DateTime?
  country           String?
  city              String?
  address           String?
  
  // Banking
  bankName          String?
  accountNumber     String?
  accountHolder     String?
  routingNumber     String?
  
  // Referral
  referralCode      String    @unique
  referredBy        String?
  referrals         User[]    @relation("Referrals")
  
  // Flags
  isSuspicious      Boolean   @default(false)
  flagReason        String?
  flaggedAt         DateTime?
  flaggedBy         String?
  
  // Metadata
  lastLogin         DateTime?
  lastActivity      DateTime?
  ipAddress         String?
  userAgent         String?
  
  // Relations
  seeds             Tool[]
  payouts           Payout[]
  auditLogs         AuditLog[] @relation("TargetUser")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DELETED
  PENDING_VERIFICATION
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

model KYCVerification {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Document Info
  documentType      String    // PASSPORT | ID | DRIVER_LICENSE
  documentNumber    String
  documentUrl       String
  documentHash      String    // SHA256 for verification
  
  // Verification Result
  status            String    // PENDING | VERIFIED | REJECTED
  rejectionReason   String?
  verificationScore Float?    // 0-100 confidence
  
  // Verifier Info
  verifiedBy        String?   // Admin user ID
  verifiedAt        DateTime?
  
  // Audit Trail
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### User Management API

```typescript
// src/app/api/admin/users/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const kyc = searchParams.get("kyc");
  
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } }
    ];
  }
  if (status) where.status = status;
  if (kyc) where.kyc = kyc;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        kyc: true,
        referralCode: true,
        lastLogin: true,
        isSuspicious: true,
        _count: { select: { seeds: true, payouts: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count({ where })
  ]);
  
  return NextResponse.json({
    users,
    total,
    pages: Math.ceil(total / limit),
    page
  });
}

// src/app/api/admin/users/[id]/route.ts
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      name: body.name,
      status: body.status,
      kyc: body.kyc,
      isSuspicious: body.isSuspicious,
      flagReason: body.flagReason,
      flaggedAt: body.isSuspicious ? new Date() : null,
      flaggedBy: body.isSuspicious ? body.flaggedBy : null,
      // Audit trail
      updatedAt: new Date()
    },
    include: {
      kyc: true,
      seeds: { select: { id: true, title: true } },
      _count: { select: { payouts: true } }
    }
  });

  // Log to audit trail
  await prisma.auditLog.create({
    data: {
      action: "USER_UPDATE",
      targetUserId: params.id,
      actorId: req.headers.get("x-admin-id"),
      changes: JSON.stringify(body),
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent")
    }
  });

  return NextResponse.json(user);
}
```

---

## 🛠️ SEED (Tool) Management

### Tool Management Interface

```typescript
// src/app/api/admin/seeds/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const status = searchParams.get("status");  // DRAFT | APPROVED | REJECTED
  const category = searchParams.get("category");
  
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  if (status) where.status = status;
  if (category) where.category = category;
  
  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        creator: { select: { email: true, name: true } },
        downloads: true,
        rating: true,
        price: true,
        createdAt: true,
        approvedAt: true,
        rejectionReason: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.tool.count({ where })
  ]);
  
  return NextResponse.json({
    tools,
    total,
    pages: Math.ceil(total / limit),
    page
  });
}

// Batch upload tools
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (req.headers.get("x-action") === "batch-upload") {
    const tools = body.tools; // Array of tool data
    
    const created = await prisma.tool.createMany({
      data: tools.map((t: any) => ({
        title: t.title,
        description: t.description,
        category: t.category,
        creatorId: t.creatorId,
        price: t.price,
        icon: t.icon,
        status: "PENDING_APPROVAL",
        metadata: t.metadata
      }))
    });
    
    return NextResponse.json({
      message: `Created ${created.count} tools`,
      count: created.count
    });
  }
}
```

### Batch Upload (CSV → Tools)

```typescript
// src/components/admin/seeds/batch-upload-wizard.tsx
"use client";

import { useState } from "react";
import Papa from "papaparse";

export function BatchUploadWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (f: File) => {
    Papa.parse(f, {
      header: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5)); // Preview first 5 rows
      },
      error: (error) => console.error(error)
    });
    setFile(f);
  };

  const handleUpload = async () => {
    setLoading(true);
    
    Papa.parse(file!, {
      header: true,
      complete: async (results) => {
        const tools = results.data
          .filter((row: any) => row.title) // Skip empty rows
          .map((row: any) => ({
            title: row.title,
            description: row.description,
            category: row.category,
            creatorId: row.creator_id,
            price: parseFloat(row.price),
            icon: row.icon_url,
            metadata: {
              version: row.version,
              keywords: row.keywords?.split(","),
              requirements: row.requirements
            }
          }));

        const res = await fetch("/api/admin/seeds/list", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-action": "batch-upload"
          },
          body: JSON.stringify({ tools })
        });

        const result = await res.json();
        setLoading(false);
        alert(`Successfully uploaded ${result.count} tools!`);
      }
    });
  };

  return (
    <div className="p-6">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
      />
      
      {preview.length > 0 && (
        <div>
          <h3>Preview ({preview.length} rows)</h3>
          <table className="w-full border">
            <thead>
              <tr>
                {Object.keys(preview[0]).map(k => (
                  <th key={k} className="border p-2">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v: any, j) => (
                    <td key={j} className="border p-2">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Tools"}
      </button>
    </div>
  );
}
```

---

## 💰 Payout & Clawback Management

### Payout Management API

```typescript
// src/app/api/admin/payouts/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const status = searchParams.get("status");  // PENDING | PROCESSING | SUCCESS | FAILED
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  
  const payouts = await prisma.payout.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, name: true } },
      clawbacks: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  
  const summary = {
    total: payouts.length,
    byStatus: {
      PENDING: payouts.filter(p => p.status === "PENDING").length,
      PROCESSING: payouts.filter(p => p.status === "PROCESSING").length,
      SUCCESS: payouts.filter(p => p.status === "SUCCESS").length,
      FAILED: payouts.filter(p => p.status === "FAILED").length
    },
    totalAmount: payouts
      .filter(p => p.status === "SUCCESS")
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  };
  
  return NextResponse.json({ payouts, summary });
}

// src/app/api/admin/payouts/clawback/route.ts
export async function POST(req: NextRequest) {
  const { payoutId, reason, percentage } = await req.json();
  
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId }
  });
  
  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }
  
  // Calculate clawback amount
  const clawbackAmount = (payout.amount || 0) * (percentage / 100);
  
  const clawback = await prisma.clawback.create({
    data: {
      payoutId,
      userId: payout.userId!,
      amount: clawbackAmount,
      reason,
      percentage,
      status: "PENDING",
      requestedBy: req.headers.get("x-admin-id")!
    }
  });
  
  // Log to audit
  await prisma.auditLog.create({
    data: {
      action: "CLAWBACK_REQUEST",
      targetUserId: payout.userId,
      actorId: req.headers.get("x-admin-id")!,
      changes: JSON.stringify({ clawbackAmount, reason }),
      ipAddress: req.headers.get("x-forwarded-for")
    }
  });
  
  return NextResponse.json(clawback);
}
```

---

## 📋 Policy & OPA Management

### Policy Bundle Editor

```typescript
// src/components/admin/policies/opa-studio.tsx
"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export function OPAStudio() {
  const [rego, setRego] = useState(`
package apex.payouts

default allow = false

allow_payout {
  not input.flags.kill_switch_payout
  input.user.kyc == true
  input.txn.value > 0
}
`);
  
  const [testing, setTesting] = useState(false);
  const [testInput, setTestInput] = useState(`{
  "user": { "kyc": true },
  "flags": { "kill_switch_payout": false },
  "txn": { "value": 100 }
}`);
  
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    
    const res = await fetch("/api/admin/policies/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rego,
        input: JSON.parse(testInput)
      })
    });
    
    const result = await res.json();
    setTestResult(result);
    setTesting(false);
  };

  const handleDeploy = async () => {
    const res = await fetch("/api/admin/policies/compile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rego })
    });
    
    const result = await res.json();
    alert(result.compiled ? "Policy compiled successfully!" : "Compilation failed");
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      <div>
        <h3 className="font-bold mb-2">Policy Editor</h3>
        <Editor
          height="400px"
          defaultLanguage="rego"
          value={rego}
          onChange={(v) => setRego(v || "")}
          theme="vs-dark"
        />
        <button
          onClick={handleDeploy}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          Deploy Policy
        </button>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">Test Input & Result</h3>
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          className="w-full h-32 border p-2 font-mono text-sm"
        />
        
        <button
          onClick={handleTest}
          disabled={testing}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {testing ? "Testing..." : "Test Policy"}
        </button>
        
        {testResult && (
          <pre className="mt-4 p-2 bg-gray-100 text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
```

---

## 🤖 Kimi K2 Automation Integration

### Automation Engine

```typescript
// src/lib/admin/kimi-k2.ts
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
}

export type AutomationTrigger =
  | { type: "user_signup"; filter?: { minAge: number } }
  | { type: "tool_uploaded" }
  | { type: "payout_failed" }
  | { type: "kyc_verified" }
  | { type: "scheduled"; cron: string };

export type AutomationAction =
  | { type: "send_email"; template: string; to: string }
  | { type: "send_slack"; channel: string; message: string }
  | { type: "update_user"; userId: string; data: any }
  | { type: "trigger_payout"; userId: string }
  | { type: "approve_tool"; toolId: string }
  | { type: "request_kyc"; userId: string };

/**
 * Kimi K2 Smart Automation Handler
 * Analyzes patterns and suggests actions
 */
export async function analyzeAndAutomate(
  context: string,
  actions: AutomationAction[]
): Promise<{ suggestions: string[]; executedActions: any[] }> {
  
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `You are an AI automation expert for ApexRebate. 
    Analyze the given context and suggest automation actions.
    Be concise and action-oriented.`,
    messages: [
      {
        role: "user",
        content: `Context: ${context}\n\nPossible actions: ${JSON.stringify(actions)}\n\nWhat should we automate?`
      }
    ]
  });

  const suggestions = message.content
    .filter(block => block.type === "text")
    .map(block => (block as any).text)
    .join("\n")
    .split("\n")
    .filter(line => line.trim());

  // Execute suggested actions
  const executedActions = await Promise.all(
    actions.map(action => executeAction(action))
  );

  return { suggestions, executedActions };
}

/**
 * Execute individual automation action
 */
async function executeAction(action: AutomationAction): Promise<any> {
  switch (action.type) {
    case "send_email":
      return sendEmail(action.to, action.template);
    
    case "send_slack":
      return sendSlack(action.channel, action.message);
    
    case "update_user":
      return updateUser(action.userId, action.data);
    
    case "trigger_payout":
      return triggerPayout(action.userId);
    
    case "approve_tool":
      return approveTool(action.toolId);
    
    case "request_kyc":
      return requestKYC(action.userId);
    
    default:
      return null;
  }
}

async function sendEmail(to: string, template: string) {
  // Integration with email service
  console.log(`📧 Sending email to ${to} with template: ${template}`);
  return { status: "sent" };
}

async function sendSlack(channel: string, message: string) {
  // Integration with Slack API
  console.log(`💬 Sending to Slack #${channel}: ${message}`);
  return { status: "sent" };
}

async function updateUser(userId: string, data: any) {
  const prisma = require("@/lib/prisma").default;
  return await prisma.user.update({
    where: { id: userId },
    data
  });
}

async function triggerPayout(userId: string) {
  // Call payout processing
  console.log(`💰 Triggering payout for user: ${userId}`);
  return { status: "queued" };
}

async function approveTool(toolId: string) {
  const prisma = require("@/lib/prisma").default;
  return await prisma.tool.update({
    where: { id: toolId },
    data: { status: "APPROVED", approvedAt: new Date() }
  });
}

async function requestKYC(userId: string) {
  console.log(`🆔 Requesting KYC for user: ${userId}`);
  return { status: "requested" };
}

/**
 * Workflow execution with Kimi K2
 */
export async function executeWorkflow(
  workflow: AutomationWorkflow,
  triggerData: any
): Promise<any> {
  
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    system: `You are an automation executor. Execute the following workflow step by step.
    Return JSON with executed actions and results.`,
    messages: [
      {
        role: "user",
        content: `Workflow: ${workflow.name}\nTrigger Data: ${JSON.stringify(triggerData)}\nActions: ${JSON.stringify(workflow.actions)}\n\nExecute this workflow.`
      }
    ]
  });

  // Parse Kimi K2 response and execute
  const responseText = message.content
    .filter(block => block.type === "text")
    .map(block => (block as any).text)
    .join("\n");

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const executionPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  // Execute each action
  const results = await Promise.all(
    (executionPlan.actions || []).map((action: any) =>
      executeAction(action)
    )
  );

  return {
    workflow: workflow.name,
    triggered_by: triggerData,
    executed_actions: results,
    kimi_analysis: responseText
  };
}
```

### Automation Workflow API

```typescript
// src/app/api/admin/automation/workflows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/admin/kimi-k2";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const workflows = await prisma.automationWorkflow.findMany({
    include: {
      triggers: true,
      actions: true
    }
  });
  
  return NextResponse.json(workflows);
}

export async function POST(req: NextRequest) {
  const { name, trigger, actions, enabled } = await req.json();
  
  const workflow = await prisma.automationWorkflow.create({
    data: {
      name,
      enabled,
      trigger: JSON.stringify(trigger),
      actions: {
        createMany: {
          data: actions.map((a: any) => ({ action: JSON.stringify(a) }))
        }
      }
    }
  });
  
  return NextResponse.json(workflow);
}

// src/app/api/admin/automation/execute/route.ts
export async function POST(req: NextRequest) {
  const { workflowId, triggerData } = await req.json();
  
  const workflow = await prisma.automationWorkflow.findUnique({
    where: { id: workflowId },
    include: { triggers: true, actions: true }
  });
  
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }
  
  const result = await executeWorkflow(
    {
      id: workflow.id,
      name: workflow.name,
      enabled: workflow.enabled,
      trigger: JSON.parse(workflow.trigger),
      actions: workflow.actions.map(a => JSON.parse(a.action))
    },
    triggerData
  );
  
  // Log execution
  await prisma.automationExecution.create({
    data: {
      workflowId,
      input: JSON.stringify(triggerData),
      output: JSON.stringify(result),
      success: true
    }
  });
  
  return NextResponse.json(result);
}
```

---

## 📊 Analytics & Monitoring

### Dashboard Analytics

```typescript
// src/app/admin/dashboard/analytics-client.tsx
"use client";

import { useEffect, useState } from "react";
import { LineChart, BarChart, PieChart } from "recharts";

export function AnalyticsClient() {
  const [metrics, setMetrics] = useState({
    users: { total: 0, active: 0, newThisMonth: 0, kyc_verified: 0 },
    tools: { total: 0, approved: 0, pending: 0, downloads: 0 },
    payouts: { total: 0, processed: 0, failed: 0, amount: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch("/api/admin/sync/metrics");
      const data = await res.json();
      setMetrics(data);
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {/* Stat Cards */}
      <StatCard
        title="Total Users"
        value={metrics.users.total}
        subtext={`${metrics.users.kyc_verified} KYC verified`}
        color="blue"
      />
      <StatCard
        title="Total Tools"
        value={metrics.tools.total}
        subtext={`${metrics.tools.downloads} downloads`}
        color="purple"
      />
      <StatCard
        title="Payouts Processed"
        value={`$${metrics.payouts.amount.toLocaleString()}`}
        subtext={`${metrics.payouts.processed} transactions`}
        color="green"
      />
      <StatCard
        title="Monthly Revenue"
        value={`$${metrics.revenue.thisMonth.toLocaleString()}`}
        subtext={`+${((metrics.revenue.thisMonth / metrics.revenue.lastMonth - 1) * 100).toFixed(1)}%`}
        color="orange"
      />
    </div>
  );
}

function StatCard({ title, value, subtext, color }: any) {
  return (
    <div className={`p-4 bg-${color}-50 border-l-4 border-${color}-500 rounded`}>
      <h3 className="font-semibold text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  );
}
```

### Metrics Sync API

```typescript
// src/app/api/admin/sync/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const [users, tools, payouts] = await Promise.all([
    prisma.user.findMany({
      where: {},
      select: {
        id: true,
        kyc: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.tool.findMany({
      select: {
        id: true,
        status: true,
        downloads: true
      }
    }),
    prisma.payout.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true
      }
    })
  ]);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return NextResponse.json({
    users: {
      total: users.length,
      active: users.filter(u => u.status === "ACTIVE").length,
      newThisMonth: users.filter(u => u.createdAt >= thisMonth).length,
      kyc_verified: users.filter(u => u.kyc === "APPROVED").length
    },
    tools: {
      total: tools.length,
      approved: tools.filter(t => t.status === "APPROVED").length,
      pending: tools.filter(t => t.status === "PENDING_APPROVAL").length,
      downloads: tools.reduce((sum, t) => sum + (t.downloads || 0), 0)
    },
    payouts: {
      total: payouts.length,
      processed: payouts.filter(p => p.status === "SUCCESS").length,
      failed: payouts.filter(p => p.status === "FAILED").length,
      amount: payouts
        .filter(p => p.status === "SUCCESS")
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    },
    revenue: {
      thisMonth: payouts
        .filter(p => p.status === "SUCCESS" && p.createdAt >= thisMonth)
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      lastMonth: payouts
        .filter(p => p.status === "SUCCESS" && p.createdAt >= lastMonth && p.createdAt < thisMonth)
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }
  });
}
```

---

## 📋 Checklist: Deploy Founder Admin

```bash
# 1. Database migrations
npm run db:push

# 2. Create admin user
node scripts/create-admin.js --email your@email.com --role FOUNDER

# 3. Build & test
npm run build
npm run test

# 4. Deploy to production
vercel --prod

# 5. Verify routes accessible
curl https://apexrebate.com/admin/dashboard

# 6. Setup 2-eyes verification
gh secret set TWO_EYES_TOKEN --body "$(openssl rand -hex 32)"

# 7. Configure Kimi K2 automation
gh secret set ANTHROPIC_API_KEY --body "YOUR_KEY"

# 8. Enable monitoring
npm run slo:mock
curl http://localhost:3000/api/admin/slo/summary
```

---

## 🚀 Next Steps (Roadmap)

**Phase 1 (Complete):**
- ✅ Founder admin dashboard
- ✅ User CRUD + KYC
- ✅ Tool management + batch upload
- ✅ Payout & clawback

**Phase 2 (In Progress):**
- [ ] Real-time metrics sync
- [ ] OPA policy editor
- [ ] Kimi K2 automation workflows
- [ ] Advanced audit logging

**Phase 3 (Planned):**
- [ ] Multi-admin role management
- [ ] Custom reports & exports
- [ ] Email notifications
- [ ] Slack integration

---

**Quyền quản trị toàn bộ APEXrebate – Sẵn sàng cho nhà sáng lập! 🚀**
