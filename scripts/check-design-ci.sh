#!/usr/bin/env bash
set -e

echo "Running Autoprime Design System Guardrails..."

# 1. No raw colour literals in feature code
echo "Checking for raw hex color literals in UI code..."
grep -rnE '#[0-9a-fA-F]{3,8}\b' apps/ packages/ui/ --include='*.tsx' --include='*.css' \
  | grep -v 'packages/design-system' \
  | grep -vE '#(0E1116|FAFAFA|FFFFFF|9B1E32)' && echo "❌ Raw hex found" && exit 1 || echo "✅ No raw hex found"

# 2. No shadows outside the tokens
echo "Checking for box-shadow violations..."
grep -rn 'box-shadow' apps/ packages/ui/ --include='*.css' \
  | grep -v 'var(--shadow-' | grep -v 'var(--focus-ring)' | grep -v 'none' && echo "❌ Illegal box-shadow found" && exit 1 || echo "✅ No illegal shadows found"

# 3. No font-size literals in css
echo "Checking for font-size literals in css..."
grep -rnE 'font-size:\s*[0-9]' apps/ packages/ui/ --include='*.css' \
  | grep -v 'packages/design-system' && echo "❌ Raw font-size found" && exit 1 || echo "✅ No raw font-size found"

echo "✅ All Design CI checks passed successfully."
