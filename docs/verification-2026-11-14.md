# Sheet verification log: 14 Nov 2026

Every sheet was checked against the current release of its tool. Each row's flags were matched automatically against the real `--help` output of that release (run in containers or read from the official reference). Every description was then read against the help text or docs, and deprecations were checked in release notes. Rows a flag check can't cover (shell syntax, SQL, Python APIs, third-party tools) were checked against their own official docs, as noted per sheet. The source URLs on each sheet were all requested and return 200.

## git: Git 2.56.1
Method: `git <cmd> -h` in alpine:edge (git 2.56.1) + full manual pages from git-scm.com/docs (latest). Flag checker: 45/45 rows, 1 false positive (`code --wait` is VS Code's flag).
Changed: `git config --global k v` and `git config --list` are listed under DEPRECATED MODES in the 2.56 manual, so moved to `git config set --global` / `git config list` (4 rows + list). `git pull` desc: it integrates (merge or rebase per config), not always merges. Two desc clarifications (switch -c, commit --amend).

## docker: Docker 29.9.2 client and engine, Compose 5.7.1
Method: `docker <cmd> --help` from the local 29.9.2 client (latest is 29.9.3, same release line) for every subcommand, multi-word ones included (a first pass had a shell word-splitting bug and was redone). Compose rows checked with `docker compose <cmd> --help` from Compose 5.7.1 (docker:cli image), plus the v5.7.0 release notes. Every description was read against its command's help header. Flag checker: all flags present.
Changed: systemctl rows need sudo and are Linux-only; `compose down` also removes networks.

## kubernetes: kubectl 1.37.2
Method: `kubectl <cmd> --help` + `kubectl options` from the official registry.k8s.io/kubectl:v1.37.2 image. Flag checker: 44/44 rows, all flags present.
Changed: `kubectl get endpoints` -> `kubectl get endpointslices` (kubernetes.io: Endpoints deprecated since v1.33). `top` rows note the Metrics Server requirement (stated in `kubectl top --help`).

## npm: npm 12.2.2
Method: `npm <cmd> --help` for npm 12.2.2 in a node:24 container, plus docs.npmjs.com/cli/v12 for `-D`/`--save-dev` and `cache clean --force` (still required), plus the v12.0.0 breaking-change notes. Flag checker: all real flags present (`--flag` is a placeholder).
Changed: `npm shrinkwrap` was removed in npm 12 ("Unknown command" in 12.2.2), replaced with `npm install-scripts approve <pkg>`, because dependency lifecycle scripts are now blocked by default. `npm rebuild` desc updated to match the new approve-then-rebuild flow. `npm install` reads package.json (not only the lockfile). `npx` desc clarified.

## python: Python 3.15.2, uv 0.13.8, pytest 9.2.0, ruff 0.17.5, mypy 2.4.1
Method: python:3.15 container, `python3 --help-all` + `-m <module> --help` for every module row, `--help` for uv/pytest/ruff/mypy installed at latest. Non-CLI rows (venv activation, PYTHONPATH, breakpoint()) checked against docs.python.org/3.15. Flag checker: all flags present.
Changed: `pytest -x --lf` described `--ff` behaviour; `--lf` runs only last failures. `python -m json` is the CLI since 3.14 (json.tool kept for compatibility). Windows activation now matches the venv docs (activate.bat / Activate.ps1).

## uv: uv 0.13.8 (was checked against 0.11-era docs)
Method: `uv <cmd> --help` for uv 0.13.8 (pip-installed in python:3.15), install methods against docs.astral.sh installation page, and every "Breaking changes" heading of the 0.12.0 and 0.13.0 releases read for impact. Flag checker: all flags present.
Changed: `uv init` creates a packaged src-layout project with a uv_build build system since 0.12 (desc updated here and in the python sheet). Example Python version bumped to 3.15, the default since uv 0.13.

## bash: Bash 5.3.9 on Ubuntu 26.04.1 LTS
Method: ubuntu:26.04 container (bash 5.3.9, uutils coreutils 0.10, procps-ng 4.0.4). `help <builtin>` for builtins, `<cmd> --help` for utilities (man pages did not install in the minimal image, so the help output is the source), `bind -p` for Ctrl+R (reverse-search-history), and the GNU Bash 5.3 manual for substitution, pipes, redirection, background jobs, brace expansion, if and function syntax. Flag checker: all flags present (`[ -f ]` is under `help test`).
Changed: descriptions only (`tee` shows output as well as saving it, `free` is Linux-only, `locate` reads an index).

## linux: Ubuntu 26.04.1 LTS, Fedora 45
Method: same ubuntu:26.04 container with every tool installed (`--help`/`-h` output, `ip addr help`, `curl --help all` for `-I`), plus fedora:latest (Fedora 45, dnf5 5.4.6, yum -> dnf5 symlink). Flag checker: all flags present.
Changed: `dmesg` needs sudo (Ubuntu keeps CONFIG_SECURITY_DMESG_RESTRICT=1; override commented out in /usr/lib/sysctl.d/55-kernel-hardening.conf). `passwd <user>` and `snap install` need sudo. Flatpak install names the remote (flathub) as in flatpak.org/setup. yum is now an alias of dnf.

## aws: AWS CLI 2.40.3
Method: AWS CLI v2 command reference pages (awscli.amazonaws.com, "AWS CLI 2.40.3 Command Reference") for all 29 subcommands used, plus the global options page and the CLI environment-variables guide for AWS_PROFILE. The AWS CLI was not run. Flag checker: all flags and positionals present.
Changed: nothing. Watch is major-only because aws-cli ships a new minor almost weekly; the 6-month staleness check covers drift within v2.

## terraform: Terraform 1.17.2
Method: `terraform <cmd> -help` from the official hashicorp/terraform:1.17.2 image for all 25 subcommands, plus the v1.16.0 and v1.17.0 release notes scanned for removals and deprecations. Flag checker: all flags present (`dot -Tpng` is Graphviz).
Changed: nothing.

## vim: Vim 9.2, patches 1-1342 (latest tag 9.2.1345)
Method: alpine:edge with vim + vim-doc (Vim 9.2, included patches 1-1342). Every key/command looked up in the runtime help `tags` file and read against its `index.txt`, `editing.txt` or `motion.txt` entry (`:q!` under `:q[uit]!`, `ci"` under `iquote`).
Changed: `:q` quits the window, not the buffer (editing.txt: "Quit the current window. Quit Vim if this is the last"). Visual-range substitute works on the selected lines.

## rust: Rust 1.100.0, cargo 1.100.0, rustup 1.29.3
Method: official rust:1.100 image with rustfmt and clippy added. `cargo <cmd> --help` for 22 subcommands, `rustup`/`rustc --help`, and libtest's own `cargo test -- --help` in a scratch project. Third-party and nightly rows against their own docs: Cargo unstable book (build-std), bacon, cargo-llvm-cov, cargo-expand and cross READMEs, std::backtrace docs.
Changed: libtest `--nocapture` -> `--no-capture` (deprecated in Rust 1.88.0 per RELEASES.md; still accepted). `-Z build-std` usage in the Cargo docs includes `--target`. `RUST_BACKTRACE=1` prints a short backtrace, not a full one. `cross` needs Docker or Podman. bacon install uses `--locked` as in its README.
No watch: Rust ships a minor every six weeks and has no majors, so the 6-month staleness check is the trigger.

## dbt: dbt Core 1.12.7
Method: `dbt <cmd> --help` for dbt-core 1.12.7 (pip, python:3.13-slim; `dbt --version` reports up to date) for all 19 subcommands, plus docs.getdbt.com node-selection methods. Flag checker: all flags present.
Changed: `dbt retry` has no `--select` in 1.12.7, so that row was invalid; replaced with the slim-CI `build --select state:modified+ --defer --state` pattern. `state:` selectors require `--state` (docs: "must be specified via the --state flag or DBT_ENGINE_STATE"), so it was added to the run and clone rows. Descriptions updated from the help text for build (seeds too, DAG order), test (data + unit tests, no "schema tests"), show and --empty.

## airflow: Airflow 3.4.0 (was checked against 3.1.6)
Method: apache-airflow[celery,fab]==3.4.0 installed with the official constraints-3.4.0 file in python:3.13-slim. `airflow <cmd> --help` for all 37 subcommands; RELEASE_NOTES.rst from 3.1.6 to 3.4.0 scanned for CLI removals and renames (only `info --file-io` and `connections list --conn-id`, neither used).
Changed: the backfill flag is `--reprocess-behavior`, not `--reprocessing-behavior`, so that row would have failed. `failed` selects missing *and* errored runs.

## snowflake: Snowflake CLI 3.33.0 + SQL reference (SQL rows were never checked before)
Method: `snow <cmd> --help` for snowflake-cli 3.33.0 (pip, python:3.13-slim). Each of the 41 SQL rows mapped to its docs.snowflake.com reference page and checked for the syntax it uses (36 pages); usage notes read for QUERY_HISTORY, CLUSTERING_INFORMATION and GRANT.
Changed: PUT syntax is `file://<absolute_path_to_file>`. `SYSTEM$CLUSTERING_INFORMATION('t')` errors when the table has no clustering key ("this argument is required"). `GRANT ... ON ALL TABLES` covers existing tables only (FUTURE grants are separate).
Watch is major-only: snowflake-cli ships a new minor almost every month, and the SQL rows have no version.

## spark: Spark 4.3.0 (launcher rows were checked before, against an older release)
Method: official spark:4.3.0-python3 image. `spark-submit`/`pyspark`/`spark-sql --help` for the launcher rows, plus PySpark 4.3.0 introspection for every API row (39 methods/functions exist; `show(n, truncate)`, `explain(mode=)` incl. "formatted", `join(on, how)`, `writer.csv(header=)` signatures confirmed). Config keys checked in the 4.3.0 configuration and SQL performance tuning docs (AQE on by default since 3.2.0).
Changed: spark-avro was pinned to 4.0.0; the package must match the Spark version, so it is now 4.3.0 (exists on Maven Central).

## nextjs: Next.js 16.4.6 (latest), Vercel CLI 65.16.0
Method: every row searched in the docs bundled with next@16.4.6 (node_modules/next/dist/docs); the `next lint` removal and middleware -> proxy rename are confirmed there. Vercel rows checked with `vercel <cmd> --help` from vercel@65.16.0 in a node:24 container; vercel.ts confirmed on vercel.com/docs.
Changed: `vercel logs <deployment>` no longer works. The positional is now a data source (runtime | requests), the deployment is a `--deployment` filter, and output is recent records rather than a stream.
No watch on the Vercel CLI: it ships majors too often to be a useful signal.
