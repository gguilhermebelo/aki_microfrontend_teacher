#!/bin/sh
set -e
# Generate runtime env file for frontend from container environment variables
# Add any required VITE_ prefixed variables here.

OUTPUT_FILE="/usr/share/nginx/html/env.js"

cat > "$OUTPUT_FILE" <<EOF
window.__ENV = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}" || "",
  VITE_STUDENT_APP_URL: "${VITE_STUDENT_APP_URL}" || "",
};
EOF

# Optional: print the file for debugging
echo "Generated runtime env:"
cat "$OUTPUT_FILE"

exec nginx -g 'daemon off;'