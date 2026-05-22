import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  readCertifications,
  saveCertifications,
  type Certification,
} from "@/lib/certifications-store";

function getAllowedOrigin() {
  const configuredOrigin = process.env.FRONTEND_ORIGIN;

  if (!configuredOrigin || configuredOrigin === "*") {
    return "*";
  }

  return configuredOrigin;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(),
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function isValidCertificationPayload(body: Record<string, unknown>) {
  const required = ["name", "issuer", "date", "category", "description"];

  return required.every(
    (field) => typeof body[field] === "string" && String(body[field]).trim().length > 0,
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET() {
  const certifications = await readCertifications();

  return NextResponse.json({ certifications }, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || !isValidCertificationPayload(body)) {
    return NextResponse.json(
      { error: "Dados invalidos para certificacao." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const certification: Certification = {
    id: randomUUID(),
    name: String(body.name).trim(),
    issuer: String(body.issuer).trim(),
    date: String(body.date).trim(),
    category: String(body.category).trim(),
    description: String(body.description).trim(),
    credentialId: body.credentialId ? String(body.credentialId).trim() : undefined,
    url: body.url ? String(body.url).trim() : undefined,
  };

  const current = await readCertifications();
  await saveCertifications([certification, ...current]);

  return NextResponse.json({ certification }, { status: 201, headers: corsHeaders() });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = body && typeof body.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json(
      { error: "ID invalido." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const current = await readCertifications();
  const next = current.filter((item) => item.id !== id);

  if (next.length === current.length) {
    return NextResponse.json(
      { error: "Certificacao nao encontrada." },
      { status: 404, headers: corsHeaders() },
    );
  }

  await saveCertifications(next);

  return NextResponse.json({ deleted: true }, { headers: corsHeaders() });
}