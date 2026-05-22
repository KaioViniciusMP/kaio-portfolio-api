import { Redis } from "@upstash/redis";

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  category: string;
  credentialId?: string;
  description: string;
  url?: string;
};

const certificationSeeds: Certification[] = [
  {
    id: "databricks-generative-ai-fundamentals",
    name: "Academy Accreditation - Generative AI Fundamentals",
    issuer: "Databricks",
    date: "2026",
    category: "IA Generativa",
    credentialId: "180087871",
    description:
      "Fundamentos para construir soluções com IA generativa e aproveitar modelos de linguagem em produtos e automações.",
  },
  {
    id: "agile-design-sprint",
    name: "Design Sprint - Agile",
    issuer: "Senac Sao Paulo",
    date: "2023",
    category: "Metodo",
    description:
      "Principios de Design Sprint e metodologias ageis aplicadas a descoberta e validacao de solucoes.",
  },
  {
    id: "aws-cloud-practitioner-foundational",
    name: "Implantacao de Servicos em Nuvem - AWS Cloud Practitioner Foundational",
    issuer: "Amazon Web Services",
    date: "2023",
    category: "Cloud",
    description:
      "Base em cloud computing e conceitos essenciais da AWS para apoiar aplicacoes escalaveis e seguras.",
  },
];

const CERTIFICATIONS_KEY = "portfolio:certifications";

const hasRedisCredentials =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisCredentials ? Redis.fromEnv() : null;

export async function readCertifications() {
  if (!redis) {
    return certificationSeeds;
  }

  const current = await redis.get<Certification[]>(CERTIFICATIONS_KEY);

  if (!Array.isArray(current) || current.length === 0) {
    await redis.set(CERTIFICATIONS_KEY, certificationSeeds);
    return certificationSeeds;
  }

  return current;
}

export async function saveCertifications(next: Certification[]) {
  if (!redis) {
    return next;
  }

  await redis.set(CERTIFICATIONS_KEY, next);

  return next;
}