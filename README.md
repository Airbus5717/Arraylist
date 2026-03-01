# Array Macros for Dynamic Arrays

Lightweight macro helpers for dynamic arrays in C with safer edge-case handling and better strict-C portability.

## Declare an array type

```c
generate_array_type(int);
```

This creates `Array(int)` and `Slice(int)`.

## API safety tiers

Use checked macros by default. Keep unchecked macros only for compatibility or explicitly performance-focused paths where preconditions are guaranteed.

## Checked APIs (recommended)

- `array_make(T, size)`: allocate array with initial capacity (`size` can be `0`).
- `array_free(arr)`: free array memory.
- `array_reserve(arr, min_capacity)`: ensure capacity, returns `bool` and may update `arr` after `realloc`.
- `array_try_push(arr, value)`: append one value, returns `bool`.
- `array_try_at(arr, idx, out_ptr)`: bounds-checked access, returns `bool`.
- `array_try_slice_t(T, arr, low, high, out_slice)`: bounds-checked slice creation, returns `bool`.
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
- `slice_from_array_t(T, arr, low, high)`: unchecked slice creation.

## Portability notes

- Strict C11/C17 path: use `array_for_each_t(T, arr, it)` and typed slice macros.
- GNU/Clang convenience path: if `typeof` is supported, `array_for_each(arr, it)` is available.

## Example (safe usage)

```c
#include <stdio.h>
#include "array.h"

generate_array_type(int);

int main(void)
{
    Array(int) values = array_make(int, 0);
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
- Allocation/growth arithmetic is overflow-checked.
- Reallocation failures do not discard existing array data.
- `array_try_slice_t` rejects invalid ranges (`low > high` or `high > count`).
- `array_try_at` and `array_try_slice_t` return `false` when output pointers are `NULL`.

## Documentation

Canonical Markdown docs live in `docs/`:

- [Overview](./docs/overview.md)
- [Quickstart](./docs/quickstart.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./docs/examples.md)

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
- Expected URL after deploy: `https://airbus5717.github.io/arraylist/`
