# Makefile for generating and packaging the TypeScript SDK

API_SPEC_REPO := git@github.com:aviaryhq/cloudglue-api-spec.git
API_SPEC_DIR  := spec
API_SPEC_FILE := $(API_SPEC_DIR)/spec/openapi.json

## submodule-init: Initialize the API spec Git submodule
submodule-init:
	@echo "Initializing API spec submodule..."
	git submodule add $(API_SPEC_REPO) $(API_SPEC_DIR) || echo "Submodule already exists"
	git submodule update --init --recursive
	@echo "API spec submodule initialized successfully."

## submodule-update: Update the API spec Git submodule to latest version
submodule-update:
	@echo "Updating API spec submodule..."
	git submodule update --remote --merge $(API_SPEC_DIR)
	@echo "API spec submodule updated successfully."

