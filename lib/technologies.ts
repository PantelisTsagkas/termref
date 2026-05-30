export type Technology = {
  id: string;
  label: string;
  icon: string;
  category: string;
};

export const TECHNOLOGIES: Technology[] = [
  { id: "git", label: "Git", icon: "⎇", category: "VCS" },
  { id: "docker", label: "Docker", icon: "🐳", category: "DevOps" },
  { id: "kubernetes", label: "Kubernetes", icon: "☸", category: "DevOps" },
  { id: "npm", label: "npm", icon: "⬡", category: "Package Manager" },
  { id: "python", label: "Python", icon: "🐍", category: "Language" },
  { id: "bash", label: "Bash", icon: "$", category: "Shell" },
  { id: "linux", label: "Linux", icon: "🐧", category: "OS" },
  { id: "aws", label: "AWS CLI", icon: "☁", category: "Cloud" },
  { id: "terraform", label: "Terraform", icon: "⬡", category: "IaC" },
  { id: "vim", label: "Vim", icon: "✎", category: "Editor" },
  { id: "rust", label: "Cargo / Rust", icon: "⚙", category: "Language" },
  { id: "dbt", label: "dbt", icon: "◈", category: "Data" },
  { id: "airflow", label: "Airflow", icon: "〜", category: "Data" },
  { id: "snowflake", label: "SnowSQL", icon: "❄", category: "Data" },
  { id: "nextjs", label: "Next.js", icon: "△", category: "Framework" },
];

export const CATEGORIES = [
  "All",
  ...new Set(TECHNOLOGIES.map((t) => t.category)),
];

const VALID_LABELS = new Set(TECHNOLOGIES.map((t) => t.label));

export function isValidTechLabel(label: unknown): label is string {
  return typeof label === "string" && VALID_LABELS.has(label);
}
