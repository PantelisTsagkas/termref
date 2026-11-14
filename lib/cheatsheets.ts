import type { CheatSheet } from "@/lib/cheat-sheet";
import { TECHNOLOGIES } from "@/lib/technologies";
import airflow from "@/data/cheatsheets/airflow.json";
import aws from "@/data/cheatsheets/aws.json";
import bash from "@/data/cheatsheets/bash.json";
import dbt from "@/data/cheatsheets/dbt.json";
import docker from "@/data/cheatsheets/docker.json";
import git from "@/data/cheatsheets/git.json";
import kubernetes from "@/data/cheatsheets/kubernetes.json";
import linux from "@/data/cheatsheets/linux.json";
import nextjs from "@/data/cheatsheets/nextjs.json";
import npm from "@/data/cheatsheets/npm.json";
import python from "@/data/cheatsheets/python.json";
import rust from "@/data/cheatsheets/rust.json";
import snowflake from "@/data/cheatsheets/snowflake.json";
import spark from "@/data/cheatsheets/spark.json";
import terraform from "@/data/cheatsheets/terraform.json";
import uv from "@/data/cheatsheets/uv.json";
import vim from "@/data/cheatsheets/vim.json";

const CHEAT_SHEETS: Record<string, CheatSheet> = {
  git,
  docker,
  kubernetes,
  npm,
  uv,
  python,
  bash,
  linux,
  aws,
  terraform,
  vim,
  rust,
  dbt,
  airflow,
  snowflake,
  spark,
  nextjs,
};

for (const tech of TECHNOLOGIES) {
  if (!CHEAT_SHEETS[tech.id]) {
    throw new Error(`Missing cheat sheet for technology: ${tech.id}`);
  }
}
for (const id of Object.keys(CHEAT_SHEETS)) {
  if (!TECHNOLOGIES.some((t) => t.id === id)) {
    throw new Error(`Cheat sheet has no technology entry: ${id}`);
  }
}

export function getCheatSheet(techId: string): CheatSheet | null {
  return CHEAT_SHEETS[techId] ?? null;
}
