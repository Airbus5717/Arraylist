#!/usr/bin/env bash
#
# Convenience script to run a test binary under the realloc failure interposer.
#
# Usage:
#   ./test_with_realloc_failure.sh ./my_test_binary [args...]
#
# This builds the interposer (if needed) and runs the test with LD_PRELOAD
# so that the next call to interposer_arm_next_realloc_fail() will cause the
# subsequent realloc to fail.
#
# The test binary is responsible for calling interposer_arm_next_realloc_fail()
# (via dlsym or declaration) at the right moment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

INTERPOSER_SRC="$SCRIPT_DIR/realloc_interposer.c"
INTERPOSER_SO="/tmp/arraylist_realloc_interposer.so"

# Build interposer if missing or out of date
if [[ ! -f "$INTERPOSER_SO" || "$INTERPOSER_SRC" -nt "$INTERPOSER_SO" ]]; then
    echo "[interposer] Building $INTERPOSER_SO ..."
    gcc -shared -fPIC -o "$INTERPOSER_SO" "$INTERPOSER_SRC" -ldl
fi

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <test-binary> [args...]"
    echo "Example: $0 ./realloc_preserve"
    exit 1
fi

TEST_BIN="$1"
shift

echo "[interposer] Running with realloc failure injection:"
echo "  LD_PRELOAD=$INTERPOSER_SO $TEST_BIN $*"
echo

LD_PRELOAD="$INTERPOSER_SO" exec "$TEST_BIN" "$@"
