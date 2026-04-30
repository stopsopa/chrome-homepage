
# 
# /bin/bash "${ROOT}/lib/check_project.sh" "${PROJECT_ID}"
# 

PROJECT_ID="${1}"

if [ "${PROJECT_ID}" = "" ]; then

  cat <<EOF

Error: PROJECT_ID is not set.

To fix this, run:
  export PROJECT_ID="your-project-id"

EOF
  exit 1
fi

# Ensure the correct gcloud project is active
CURRENT_PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
if [ "${CURRENT_PROJECT_ID}" != "${PROJECT_ID}" ]; then
  cat <<EOF

Error: Gcloud project mismatch or not set.
Expected: ${PROJECT_ID}
Current:  ${CURRENT_PROJECT_ID:-<NONE>}

To fix this, run:
  gcloud config set project ${PROJECT_ID}

If you are not logged in, run:
  gcloud auth login

EOF
  # echo "Setting gcloud project to ${PROJECT_ID} (current: ${CURRENT_PROJECT_ID:-<NONE>})"
  # gcloud config set project "${PROJECT_ID}" --quiet
  exit 1
fi