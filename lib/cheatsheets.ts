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
import terraform from "@/data/cheatsheets/terraform.json";
import vim from "@/data/cheatsheets/vim.json";

const CHEAT_SHEETS: Record<string, CheatSheet> = {
  git,
  docker,
  kubernetes,
  npm,
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
  nextjs,
};

for (const tech of TECHNOLOGIES) {
  if (!CHEAT_SHEETS[tech.id]) {
    throw new Error(`Missing cheat sheet for technology: ${tech.id}`);
  }
}

export function getCheatSheet(techId: string): CheatSheet | null {
  return CHEAT_SHEETS[techId] ?? null;
}
