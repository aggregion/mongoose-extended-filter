SOURCES = *.js

TESTS = tests/*.spec.js

all: lint test

lint:
	@echo "Running code quality tests..."
	@NODE_ENV=test ./node_modules/.bin/eslint $(SOURCES)

test:
	@echo "Running tests..."
	@NODE_ENV=test ./node_modules/.bin/mocha $(TESTS) --recursive

.PHONY: test