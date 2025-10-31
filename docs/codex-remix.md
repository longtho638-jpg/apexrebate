# Codex Remix Workflow

This repository includes a helper script for running the OpenAI CLI against the source tree, mirroring the command:

```bash
oai api completions.create -m gpt-4o -p "$(cat .codex_contract.json)" -f ./src -o ./codex-remix
```

## Prerequisites

- Install the [OpenAI CLI](https://github.com/openai/openai-cli) and authenticate it with an API key that has access to the `gpt-4o` model.
- Provide a contract file (defaults to `.codex_contract.json`) containing the prompt payload you want to send to the API.

## Usage

```bash
./scripts/run-codex-remix.sh [contract_file] [output_dir] [source_dir]
```

Arguments are optional:

1. `contract_file` – path to the JSON file that will be piped into the `-p` flag. Defaults to `.codex_contract.json`.
2. `output_dir` – directory where the generated remix will be written. Defaults to `./codex-remix`.
3. `source_dir` – directory passed to the `-f` flag. Defaults to `./src`.

The script performs the following checks before executing the CLI command:

- Ensures the OpenAI CLI is available in the `PATH`.
- Verifies the contract file exists.
- Validates the source directory exists.
- Creates the output directory if it is missing.

## Example

```bash
./scripts/run-codex-remix.sh .codex_contract.json ./codex-remix ./src
```

This example replicates the manual command while adding pre-flight validation.

## Notes

- The script is defensive: it exits early with actionable error messages when prerequisites are missing.
- Be mindful of secrets inside `.codex_contract.json`; avoid committing it to version control.
- You can supply alternative directories if you prefer to experiment with a subset of the codebase.
