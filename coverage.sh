
# PREFIXES="PROJECT1" /bin/bash coverage.sh

set -e

TEST_FILE="${1}";

export NODE_OPTIONS=""

node node_modules/.bin/tsc

# no more ts checking for coverage
export CHECK=false

if [ -f "${TEST_FILE}" ]; then
    # That might not be needed because when running single file it runs individual tests sequentially anyway
    # ... actually it is needed because I require CONCURRENCY in tests and rightly so
    export CONCURRENCY=0;    
    if [[ "${TEST_FILE}" == *.serial.test.* ]]; then
        export CONCURRENCY=1;
    fi
    /bin/bash ts.sh --test "${TEST_FILE}"
else 
    EXCLUDE="\( -path './.git' -o -path './node_modules' -o -path './coverage' \) -prune -o \( -type f"

    PARALLEL_TESTS=()
    while IFS=  read -r -d $'\0'; do
        PARALLEL_TESTS+=("${REPLY}")
    done < <(eval "find . ${EXCLUDE} -name '*.parallel.test.*' \) -print0")

    SERIAL_TESTS=()
    while IFS=  read -r -d $'\0'; do
        SERIAL_TESTS+=("${REPLY}")
    done < <(eval "find . ${EXCLUDE} -name '*.serial.test.*' \) -print0")

    export KEEP_COVERAGE=false
    EXIT_CODE=0
    set +e

    if [ ${#PARALLEL_TESTS[@]} -gt 0 ]; then
        export CONCURRENCY=0
        /bin/bash ts.sh --test "${PARALLEL_TESTS[@]}"
        RET=${?}
        if [ ${RET} -ne 0 ]; then EXIT_CODE=${RET}; fi
        export KEEP_COVERAGE=true
    fi

    if [ ${#SERIAL_TESTS[@]} -gt 0 ]; then
        export CONCURRENCY=1
        /bin/bash ts.sh --test "${SERIAL_TESTS[@]}"
        RET=${?}
        if [ ${RET} -ne 0 ]; then EXIT_CODE=${RET}; fi
        export KEEP_COVERAGE=true
    fi

    cat <<EEE

xx coverage

EEE

    set -e
    exit ${EXIT_CODE}
fi





