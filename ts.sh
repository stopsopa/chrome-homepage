# warning:
# for production run with CHECK=false
# 
# NO_COVERAGE=1 /bin/bash ts.sh --test-only
# 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# add --watch flag for dev mode

source "${DIR}/.env.sh"

set -e

export NODE_NO_WARNINGS=1

# add to gitignore /coverage/
# require ts-resolver.js
# require node-suppress-warning.js
# require node.config.js

if [[ "${CHECK}" != "false" ]]; then
  if [ -z "${SILENT}" ]; then
    cat <<EEE

  Type-checking ...

EEE
    NODE_OPTIONS="" "${DIR}/node_modules/.bin/tsc" -p "${DIR}"
  else
    # if SILENT is present, only show output if tsc fails
    TSC_OUT=$(NODE_OPTIONS="" "${DIR}/node_modules/.bin/tsc" -p "${DIR}" 2>&1) || {
      TSC_RET=$?
      printf "%s\n" "${TSC_OUT}"
      exit "${TSC_RET}"
    }
  fi
fi

NODE_CMD=(node --experimental-config-file="${DIR}/node.config.generated.json" --experimental-loader="${DIR}/ts-resolver.js" --import "file://${DIR}/node-suppress-warning.js")

if [[ "${@}" == *"--test"* ]]; then

  # without c8 ... - test will work like nothing happened but coverage directory won't be created
  # yarn add -D c8

  REPORTERS=(--reporter=lcov --reporter=html --reporter=text)

  C8_ARGS=()
  if [ "${KEEP_COVERAGE}" == "true" ]; then
    C8_ARGS=(--clean=false)
  else
    rm -rf "${DIR}/coverage"
  fi

  # Check if specific test files/globs were provided. If not, supply our default patterns.
  HAS_FILES=false
  for FOUND in "${@}"; do
    if [[ "${FOUND}" != "--test" && "${FOUND}" != -* ]]; then
      HAS_FILES=true
      break
    fi
  done

  TARGET_ARGS=("${@}")
  if [ "${HAS_FILES}" = false ]; then
    # Retrieve the patterns configured directly in node.config.js
    PATTERNS=$(NODE_OPTIONS="" GET_PATTERNS=1 node "${DIR}/node.config.js" a)
    for p in $PATTERNS; do
      TARGET_ARGS+=("$p")
    done
  fi

  for FOUND in "${TARGET_ARGS[@]}"; do
    if [[ "${FOUND}" =~ \.(serial|parallel)\.test\. ]]; then
      if [[ ! -f "${FOUND}" && "${FOUND}" != *"*"* && "${FOUND}" != *"?"* ]]; then
        echo "${0} error: (serial|parallel) test file ${FOUND} not found" >&2
        continue
      fi
      if [[ "${FOUND}" =~ \.serial\.test\. ]]; then
        export CONCURRENCY="1"
      elif [[ "${FOUND}" =~ \.parallel\.test\. ]]; then
        export CONCURRENCY="0"
      fi
    fi
  done 

  # Generate node.config.json from node.config.js
  # we are not using node.config.js directly because node --experimental-config-file ONLY supports JSON
  NODE_OPTIONS="" node "${DIR}/node.config.js" c | tee "${DIR}/node.config.generated.json"
else  
  NODE_OPTIONS="" node "${DIR}/node.config.js" c > "${DIR}/node.config.generated.json"
fi

echo ""

if [[ "${@}" == *"--test"* ]]; then

  # only allow node to be attached to debugger, not npx or c8
  # https://github.com/bcoe/c8/issues/136#issuecomment-680456108
  # also reseting NODE_OPTIONS to empty string for wrapper c8 process but forwarding it as is to the main testing process
  if [ -z "${NO_COVERAGE}" ]; then
    NODE_OPTIONS="" npx c8 "${REPORTERS[@]}" "${C8_ARGS[@]}" \
      env NODE_OPTIONS="${NODE_OPTIONS}" \
      "${NODE_CMD[@]}" "${TARGET_ARGS[@]}"
  else
    "${NODE_CMD[@]}" "${TARGET_ARGS[@]}"
  fi
else
  "${NODE_CMD[@]}" "${@}"
fi
