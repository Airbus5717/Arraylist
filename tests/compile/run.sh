#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/tests/compile"

CC="${CC:-gcc}"
CFLAGS=(-std=c11 -Wall -Wextra -pedantic -I"$ROOT")

# Support CC with spaces e.g. CC="zig cc"
read -ra CC_ARR <<< "$CC"

for src in *.c; do
    # Support files (interposers, helpers) are not standalone tests
    case "$src" in
        *_interposer.c) continue ;;
    esac
    out="${src%.c}"
    echo "${CC_ARR[*]} ${CFLAGS[*]} $src"
    "${CC_ARR[@]}" "${CFLAGS[@]}" "$src" -o "$out"
    "./$out" >/dev/null
    rm -f "$out"
done

if command -v clang >/dev/null 2>&1; then
    for src in quickstart.c examples.c; do
        out="${src%.c}-clang"
        echo "clang -std=gnu11 -Wall -Wextra -I\"$ROOT\" $src"
        clang -std=gnu11 -Wall -Wextra -I"$ROOT" "$src" -o "$out"
        "./$out" >/dev/null
        rm -f "$out"
    done
fi

if command -v zig >/dev/null 2>&1; then
    for src in quickstart.c examples.c; do
        out="${src%.c}-zig"
        echo "zig cc -std=gnu11 -Wall -Wextra -I\"$ROOT\" $src"
        zig cc -std=gnu11 -Wall -Wextra -I"$ROOT" "$src" -o "$out"
        "./$out" >/dev/null
        rm -f "$out"
    done
fi

echo "All compile tests passed."
