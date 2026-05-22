import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  category: string;
  credentialId?: string;
  description: string;
  url?: string;
};

const certifications: Certification[] = [
  {
    id: "databricks-generative-ai-fundamentals",
    name: "Academy Accreditation - Generative AI Fundamentals",
    issuer: "Databricks",
    date: "2026",
    category: "IA Generativa",
    credentialId: "180087871",
    description:
      "Fundamentos para construir soluções com IA generativa e aproveitar modelos de linguagem em produtos e automações."
  },
  {
    id: "agile-design-sprint",
    name: "Design Sprint - Agile",
    issuer: "Senac Sao Paulo",
    date: "2023",
    category: "Metodo",
    description:
      "Principios de Design Sprint e metodologias ageis aplicadas a descoberta e validacao de solucoes."
  },
  {
    id: "aws-cloud-practitioner-foundational",
    name: "Implantacao de Servicos em Nuvem - AWS Cloud Practitioner Foundational",
    issuer: "Amazon Web Services",
    date: "2023",
    category: "Cloud",
    description:
      "Base em cloud computing e conceitos essenciais da AWS para apoiar aplicacoes escalaveis e seguras."
  }
];

const CERTIFICATIONS_KEY = "portfolio:certifications";

const hasRedisCredentials =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisCredentials ? Redis.fromEnv() : null;

function getAllowedOrigin(request: VercelRequest) {
  const configuredOrigin = process.env.FRONTEND_ORIGIN;

  if (!configuredOrigin || configuredOrigin === "*") {
    return "*";
  }

  const requestOrigin = request.headers.origin;

  if (requestOrigin && requestOrigin === configuredOrigin) {
    return requestOrigin;
  }

  return configuredOrigin;
}

function setCorsHeaders(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Access-Control-Allow-Origin", getAllowedOrigin(request));
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Vary", "Origin");
}

function parseBody(request: VercelRequest): Record<string, unknown> {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return request.body as Record<string, unknown>;
}

function isValidCertificationPayload(body: Record<string, unknown>) {
  const required = ["name", "issuer", "date", "category", "description"];
  return required.every((field) => typeof body[field] === "string" && String(body[field]).trim());
}

async function readCertifications() {
  if (!redis) {
    return certifications;
  }

  const current = await redis.get<Certification[]>(CERTIFICATIONS_KEY);

  if (!Array.isArray(current) || current.length === 0) {
    await redis.set(CERTIFICATIONS_KEY, certifications);
    return certifications;
  }

  return current;
}

async function saveCertifications(next: Certification[]) {
  if (!redis) {
    certifications.splice(0, certifications.length, ...next);
    return;
  }

  await redis.set(CERTIFICATIONS_KEY, next);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    return response.status(204).send("");
  }

  if (request.method === "GET") {
    const currentCertifications = await readCertifications();
    return response.status(200).json({ certifications: currentCertifications });
  }

  if (request.method === "POST") {
    const body = parseBody(request);

    if (!isValidCertificationPayload(body)) {
      return response.status(400).json({ error: "Dados invalidos para certificacao." });
    }

    const certification: Certification = {
      id: crypto.randomUUID(),
      name: String(body.name).trim(),
      issuer: String(body.issuer).trim(),
      date: String(body.date).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      credentialId: body.credentialId ? String(body.credentialId).trim() : undefined,
      url: body.url ? String(body.url).trim() : undefined
    };

    const currentCertifications = await readCertifications();
    await saveCertifications([certification, ...currentCertifications]);

    return response.status(201).json({ certification });
  }

  if (request.method === "DELETE") {
    const body = parseBody(request);
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return response.status(400).json({ error: "ID invalido." });
    }

    const currentCertifications = await readCertifications();
    const index = currentCertifications.findIndex((item) => item.id === id);

    if (index < 0) {
      return response.status(404).json({ error: "Certificacao nao encontrada." });
    }

    const next = currentCertifications.filter((item) => item.id !== id);
    await saveCertifications(next);

    return response.status(200).json({ deleted: true });
  }

  return response.status(405).json({ error: "Metodo nao permitido." });
}