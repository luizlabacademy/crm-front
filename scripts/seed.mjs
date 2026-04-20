#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * seed.mjs
 *
 * Ensures every core entity has at least MIN_ROWS records in the live API.
 * Uses only real endpoints from https://api-crm.luizlab.com/v3/api-docs.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Env:
 *   API_BASE_URL  (default https://api-crm.luizlab.com)
 *   SEED_EMAIL    (default admin@saas.com)
 *   SEED_PASSWORD (default 123456)
 *   MIN_ROWS      (default 15)
 */

const API_BASE = process.env.API_BASE_URL ?? "https://api-crm.luizlab.com";
const EMAIL = process.env.SEED_EMAIL ?? "admin@saas.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "123456";
const MIN_ROWS = Number(process.env.MIN_ROWS ?? 15);

let token = null;

async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(API_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function login() {
  const data = await request("/api/v1/auth/token", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  token = data?.token ?? data?.accessToken ?? data?.access_token;
  if (!token) throw new Error("No token in auth response");
  console.log("✓ authenticated as", EMAIL);
}

async function count(path, params = {}) {
  const data = await request(path, { params: { page: 0, size: 1, ...params } });
  return data?.totalElements ?? (Array.isArray(data?.content) ? data.content.length : 0);
}

async function pickTenantId() {
  const res = await request("/api/v1/tenants", { params: { page: 0, size: 1 } });
  const tenant = res?.content?.[0];
  if (!tenant) throw new Error("No tenants available — create one manually first");
  return tenant.id;
}

const FIRST = ["Ana","Bruno","Carla","Diego","Eva","Felipe","Gabi","Hugo","Isa","Joao","Karen","Lucas","Marta","Nina","Otavio"];
const LAST = ["Silva","Souza","Pereira","Costa","Lima","Gomes","Alves","Rocha","Castro","Martins","Araujo","Moraes","Cardoso","Teixeira","Barbosa"];

function pickName(i) {
  return `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
}
function cpfFor(i) {
  return `${String(100 + i).padStart(3, "0")}.${String(i * 7 % 1000).padStart(3, "0")}.${String(i * 11 % 1000).padStart(3, "0")}-${String(i * 13 % 100).padStart(2, "0")}`;
}
function cnpjFor(i) {
  return `${String(10 + i).padStart(2, "0")}.${String(i * 17 % 1000).padStart(3, "0")}.${String(i * 23 % 1000).padStart(3, "0")}/0001-${String(i * 29 % 100).padStart(2, "0")}`;
}

async function ensureTenants(min) {
  const total = await count("/api/v1/tenants");
  const missing = Math.max(0, min - total);
  if (missing === 0) return console.log("✓ tenants ok (", total, ")");
  console.log(`→ creating ${missing} tenants`);
  for (let i = 0; i < missing; i++) {
    const seed = total + i + 1;
    const body = {
      name: `Tenant Seed ${seed}`,
      category: seed % 2 === 0 ? "Matriz" : "Filial",
      active: true,
      legal: {
        corporateName: `Empresa Seed ${seed} LTDA`,
        tradeName: `Empresa Seed ${seed}`,
        cnpj: cnpjFor(seed),
      },
    };
    try {
      await request("/api/v1/tenants", { method: "POST", body });
    } catch (e) {
      console.warn("  ✗ tenant", seed, e.status ?? e.message);
    }
  }
}

async function ensureCustomers(min, tenantId) {
  const total = await count("/api/v1/customers");
  const missing = Math.max(0, min - total);
  if (missing === 0) return console.log("✓ customers ok (", total, ")");
  console.log(`→ creating ${missing} customers`);
  for (let i = 0; i < missing; i++) {
    const seed = total + i + 1;
    const body = {
      tenantId,
      fullName: pickName(seed),
      email: `cliente.seed.${seed}@example.com`,
      phone: `(11) 9${String(10000000 + seed).slice(-8)}`,
      document: cpfFor(seed),
      active: true,
      physical: {
        fullName: pickName(seed),
        cpf: cpfFor(seed),
      },
    };
    try {
      await request("/api/v1/customers", { method: "POST", body });
    } catch (e) {
      console.warn("  ✗ customer", seed, e.status ?? e.message);
    }
  }
}

async function ensureWorkers(min, tenantId) {
  const total = await count("/api/v1/workers");
  const missing = Math.max(0, min - total);
  if (missing === 0) return console.log("✓ workers ok (", total, ")");
  console.log(`→ creating ${missing} workers`);
  for (let i = 0; i < missing; i++) {
    const seed = total + i + 1;
    const body = {
      tenantId,
      active: true,
      physical: {
        fullName: `Colaborador ${pickName(seed)}`,
        cpf: cpfFor(seed + 500),
      },
    };
    try {
      await request("/api/v1/workers", { method: "POST", body });
    } catch (e) {
      console.warn("  ✗ worker", seed, e.status ?? e.message);
    }
  }
}

async function ensureUsers(min, tenantId) {
  const total = await count("/api/v1/users");
  const missing = Math.max(0, min - total);
  if (missing === 0) return console.log("✓ users ok (", total, ")");
  console.log(`→ creating ${missing} users`);
  for (let i = 0; i < missing; i++) {
    const seed = total + i + 1;
    const body = {
      tenantId,
      email: `user.seed.${seed}@example.com`,
      passwordHash: "Senha123!",
      active: true,
      physical: {
        fullName: pickName(seed),
        cpf: cpfFor(seed + 1000),
      },
    };
    try {
      await request("/api/v1/users", { method: "POST", body });
    } catch (e) {
      console.warn("  ✗ user", seed, e.status ?? e.message);
    }
  }
}

async function ensureItems(min, tenantId, type) {
  const total = await count("/api/v1/items", { type });
  const missing = Math.max(0, min - total);
  if (missing === 0) return console.log(`✓ items (${type}) ok (${total})`);
  console.log(`→ creating ${missing} items (${type})`);
  for (let i = 0; i < missing; i++) {
    const seed = total + i + 1;
    const base = {
      tenantId,
      type,
      name: type === "PRODUCT" ? `Produto Seed ${seed}` : `Servico Seed ${seed}`,
      sku: `SKU-${type.slice(0, 3)}-${String(seed).padStart(4, "0")}`,
      active: true,
    };
    if (type === "PRODUCT") {
      base.productDatasheet = {
        description: `Produto de teste ${seed}`,
        unitPriceCents: 1000 + seed * 100,
        currencyCode: "BRL",
        weightKg: 0.5 + (seed % 5) * 0.25,
      };
    } else {
      base.serviceDatasheet = {
        description: `Servico de teste ${seed}`,
        unitPriceCents: 5000 + seed * 500,
        currencyCode: "BRL",
        durationMinutes: 30 + (seed % 6) * 15,
        requiresStaff: seed % 2 === 0,
      };
    }
    try {
      await request("/api/v1/items", { method: "POST", body: base });
    } catch (e) {
      console.warn(`  ✗ item ${type}/${seed}`, e.status ?? e.message);
    }
  }
}

async function main() {
  console.log(`Seeding against ${API_BASE} (min ${MIN_ROWS} rows)\n`);
  await login();
  await ensureTenants(MIN_ROWS);
  const tenantId = await pickTenantId();
  console.log("using tenantId =", tenantId, "\n");
  await ensureCustomers(MIN_ROWS, tenantId);
  await ensureWorkers(MIN_ROWS, tenantId);
  await ensureUsers(MIN_ROWS, tenantId);
  await ensureItems(MIN_ROWS, tenantId, "PRODUCT");
  await ensureItems(MIN_ROWS, tenantId, "SERVICE");
  console.log("\n✓ done");
}

main().catch((err) => {
  console.error("seed failed:", err.status ?? "", err.message, err.data ?? "");
  process.exit(1);
});
