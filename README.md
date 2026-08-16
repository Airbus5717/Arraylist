# Array Macros for Dynamic Arrays

Lightweight macro helpers for dynamic arrays in C with safer edge-case handling and better strict-C portability.

## Declare an array type

```c
generate_array_type(int);
```

This creates `Array(int)`, `Slice(int)`, and `Span(int)`.

## API safety tiers

Use checked macros by default. Keep unchecked macros only for compatibility or explicitly performance-focused paths where preconditions are guaranteed.

## Checked APIs (recommended)

- `array_make(T, size)`: allocate array with initial capacity; use `8` as a practical default when size is unknown (`0` is allowed when you want no spare slots).
- `array_free(arr)`: free array memory.
- `array_reserve(arr, min_capacity)`: ensure capacity, returns `bool` and may update `arr` after `realloc`.
- `array_try_push(arr, value)`: append an element, returns `bool`.
- `array_try_push_lvalue(arr, value)`: compatibility alias for `array_try_push`.
- `array_try_at(arr, idx, out_ptr)`: bounds-checked temporary pointer access, returns `bool`.
- `array_try_get(arr, idx, out_value)`: bounds-checked copy access, returns `bool`.
- `array_try_set(arr, idx, value)`: bounds-checked assignment, returns `bool`.
- `array_try_slice_t(T, arr, low, high, out_slice)`: bounds-checked range slice creation, returns `bool`.
- `array_try_slice_at_t(T, arr, slice, idx, out_ptr)`: bounds-checked temporary pointer access through a slice range.
- `array_try_span_t(T, arr, slice, out_span)`: materialize a temporary borrowed pointer span from a current array and slice range.
- `array_back_ptr(arr)`: pointer to last element or `NULL` when empty.
- `array_length(arr)`: element count.
- `array_is_empty(arr)`: true if `count == 0`.
- `array_length_or0(arr)`: safe length for nullable arrays.
- `array_is_empty_or_true(arr)`: safe empty check for nullable arrays.
- `array_start(arr)`: pointer to first element.

## Compatibility APIs (unchecked)

These are kept for compatibility and speed-focused code paths:

- `array_push(arr, value)`: delegates to `array_try_push` and ignores failure.
- `array_at(arr, idx)`: unchecked index access.
- `array_end(arr)`: unchecked last-element pointer (invalid on empty arrays).
- `array_end_unchecked(arr)`: explicit unchecked alias.
- `slice_from_array_t(T, arr, low, high)`: unchecked range slice creation.
- `span_make_t(T, elements, count)`: unchecked borrowed pointer span creation.

## Portability notes

- Strict C11/C17 path (`-std=c11 -pedantic`): `ARRAY_HAS_TYPEOF` is `0`; use `array_for_each_t(T, arr, it)` and typed slice/span macros.
- GNU/Clang convenience path: `ARRAY_HAS_TYPEOF` is `1`; `array_for_each(arr, it)`, `slice_from_array`, and `span_make` are available.

## Compile verification

Doc snippets compile under strict C11:

```sh
tests/compile/run.sh
```

You can also test with other compilers, e.g.:

```sh
CC="zig cc" tests/compile/run.sh
```

## Example (safe usage)

```c
#include <stdio.h>
#include "array.h"

generate_array_type(int);

int main(void)
{
    Array(int) values = array_make(int, 8);
    int *at0 = NULL;

    if (!values) return 1;
    if (!array_try_push(values, 10)) return 1;
    if (!array_try_push(values, 20)) return 1;

    if (array_try_at(values, 0, &at0))
    {
        printf("first=%d\n", *at0);
    }

    array_for_each_t(int, values, it)
    {
        printf("%d\n", *it);
    }

    array_free(values);
    return 0;
}
```

## Edge-case behavior

- Zero-capacity arrays grow correctly on first push.
- `array_make(T, 8)` is the recommended starting point for ordinary small/unknown lists; pass a better estimate when you have one.
- Allocation/growth arithmetic is overflow-checked.
- Reallocation failures do not discard existing array data.
- `array_try_slice_t` rejects invalid ranges (`low > high` or `high > count`).
- Checked APIs return `false` when required output pointers are `NULL`.
- `Slice(T)` stores a range and does not dangle merely because backing storage moved.
- `Span(T)` and element pointers are temporary borrowed views and become invalid after backing storage is freed or reallocated.

## Documentation

Canonical Markdown docs live in `docs/`:

- [Overview](./docs/overview.md)
- [Quickstart](./docs/quickstart.md)
- [API Reference](./docs/api-reference.md) — includes a "Common Pitfalls & Best Practices" section
- [Examples](./docs/examples.md)

The library has received significant usability hardening (see the Pitfalls section and the top of `array.h`). Define `ARRAY_DEBUG` while developing for extra runtime checks.

## Website (Vite + React + Tailwind)

The project website lives in `site/` and renders the Markdown docs above.

Run locally:

```sh
cd site
npm install
npm run dev
```

Production build:

```sh
cd site
npm run build
```

## GitHub Pages deployment

- Workflow file: `.github/workflows/pages.yml`
- Trigger: push to `main` (or manual `workflow_dispatch`)
- Output: `site/dist` uploaded as GitHub Pages artifact
- Expected URL after deploy: `https://code5717.github.io/Arraylist/`
