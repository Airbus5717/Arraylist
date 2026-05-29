# Quickstart

This page gives a safe default starting point and highlights the first internal behaviors you should understand (`count`, `capacity`, and checked failure paths).

## 1) Prerequisites

- C11 (or later) compiler
- `array.h` available in your include path
- One translation unit where you declare generated types

```c
#include "array.h"
generate_array_type(int);
```

## 2) Minimal safe program

```c
#include <stdio.h>
#include "array.h"

generate_array_type(int);

int main(void)
{
    Array(int) values = array_make(int, 8);
    int *first = NULL;

    if (!values) return 1;

    if (!array_try_push(values, 10)) goto fail;
    if (!array_try_push(values, 20)) goto fail;
    if (!array_try_push(values, 30)) goto fail;

    printf("count=%zu capacity=%zu\n", (size_t)values->count, (size_t)values->capacity);

    if (array_try_at(values, 0, &first))
    {
        printf("first=%d\n", *first);
    }

    array_for_each_t(int, values, it)
    {
        printf("%d\n", *it);
    }

    array_free(values);
    return 0;

fail:
    array_free(values);
    return 1;
}
```

What this demonstrates:

- `array_make(int, 8)` creates an empty array with room for the first eight elements.
- `array_try_push` grows capacity on demand after that and returns `false` if growth fails.
- `count` changes with successful pushes; `capacity` changes only when resized.

Use `8` as the recommended starting capacity for ordinary small/unknown lists. Use `0` only when avoiding spare allocation matters more than avoiding the first few growth steps, and use a larger estimate when you already know the likely count.

## 3) Compile commands

Strict C11/C17 path (`ARRAY_HAS_TYPEOF` is `0`; use `array_for_each_t`):

```sh
cc -std=c11 -Wall -Wextra -pedantic demo.c -o demo
```

GNU11 convenience path (`ARRAY_HAS_TYPEOF` is `1`; `array_for_each` available):

```sh
cc -std=gnu11 -Wall -Wextra demo.c -o demo
```

Verify the doc snippets in this repository:

```sh
tests/compile/run.sh
```

## 4) Failure-handling pattern (recommended)

For mutating operations, check every `bool`-returning macro:

```c
if (!array_reserve(values, 128)) goto fail;
if (!array_try_push(values, next_value)) goto fail;
    if (!array_try_slice_t(int, values, low, high, &slice)) goto fail;
```

Why this pattern works:

- Keeps cleanup centralized.
- Prevents silently continuing after allocation or bounds failures.
- Makes checked APIs useful instead of decorative.

## 5) First troubleshooting checks

- Build fails with unknown type names:
  - Ensure `generate_array_type(T)` appears before first use of `Array(T)` / `Slice(T)`.
- Push/access fails unexpectedly:
  - Confirm you are using checked APIs and handling return values.
- Iterator macro missing:
  - Use `array_for_each_t` for strict C mode; `array_for_each` requires `ARRAY_HAS_TYPEOF`.
- Push fails to compile:
  - Confirm the value can be assigned to the array element type.
  - The macro uses normal C assignment, so compiler diagnostics point at incompatible element types.
- Pointer issues after growth:
  - Remember reallocation can move the array block; pointers from `array_try_at` or materialized `Span(T)` values may become invalid.
  - `Slice(T)` stores only `start` and `count`; use `array_try_slice_at_t` or `array_try_span_t` against the current array before access.

Next: [API Reference](./api-reference.md).
