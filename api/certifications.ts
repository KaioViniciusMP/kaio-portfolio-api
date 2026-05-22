import type { VercelRequest, VercelResponse } from "@vercel/node";

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

function setCorsHeaders(response: VercelResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

export default function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).send("");
  }

  if (request.method === "GET") {
    return response.status(200).json({ certifications });
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

    certifications.unshift(certification);

    return response.status(201).json({ certification });
  }

  if (request.method === "DELETE") {
    const body = parseBody(request);
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return response.status(400).json({ error: "ID invalido." });
    }

    const index = certifications.findIndex((item) => item.id === id);

    if (index < 0) {
      return response.status(404).json({ error: "Certificacao nao encontrada." });
    }

    certifications.splice(index, 1);

    return response.status(200).json({ deleted: true });
  }

  return response.status(405).json({ error: "Metodo nao permitido." });
}