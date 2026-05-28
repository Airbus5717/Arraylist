#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/tests/compile"

CC="${CC:-gcc}"
CFLAGS=(-std=c11 -Wall -Wextra -pedantic -I"$ROOT")

for src in *.c; do
    out="${src%.c}"
    echo "cc ${CFLAGS[*]} $src"
    "$CC" "${CFLAGS[@]}" "$src" -o "$out"
    "./$out" >/dev/null
    rm -f "$out"
done

if command -v clang >/dev/null 2>&1; then
    for src in quickstart.c examples.c; do
        out="${src%.c}-clang"
        echo "clang -std=gnu11 -Wall -Wextra -pedantic -I\"$ROOT\" $src"
        clang -std=gnu11 -Wall -Wextra -pedantic -I"$ROOT" "$src" -o "$out"
        "./$out" >/dev/null
        rm -f "$out"
    done
fi

echo "All compile tests passed."
