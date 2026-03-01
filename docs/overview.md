# Arraylist Overview

Arraylist is a header-only dynamic array implementation for C. It uses macros to generate typed arrays and typed slices while keeping memory layout explicit.

## What Arraylist is

- `Array(T)` is an owning dynamic array pointer.
- `Slice(T)` is a non-owning view over contiguous elements.
- Checked APIs (`array_try_*`) return `bool` and make failure handling explicit.
- Unchecked compatibility APIs exist for call sites that already enforce preconditions.

## Core types and ownership

Declare types once:

```c
generate_array_type(int);
```

This generates:

- `Array(int)` as a pointer to an allocated struct block.
- `Slice(int)` as:
  - `count`: number of elements in the view
  - `elements`: pointer into an existing array (or any compatible contiguous region)

Ownership rules:

- `Array(T)` owns memory and must be released with `array_free`.
- `Slice(T)` never owns memory and must not be freed.
- A `Slice(T)` becomes invalid if the source array is freed or reallocated.

## Memory layout

`Array(T)` points to a struct that stores metadata followed by a flexible array member:

```c
typedef struct {
    array_size_t count;
    array_size_t capacity;
    T elements[];
} *Array(T);
```

Conceptually:

```text
+----------------+----------------+------------------------------+
| count          | capacity       | elements[0 .. capacity - 1] |
+----------------+----------------+------------------------------+
```

`count` is the number of initialized items. `capacity` is the number of allocated slots.

## Growth behavior

Growth is handled by `array_reserve` / `array_reserve_impl`:

- No-op when `capacity >= min_capacity`.
- Starts at capacity `1` when growing from `0`.
- Uses geometric growth (doubling) until the required minimum is reached.
- Falls back to exact `min_capacity` near numeric limits.
- Performs overflow checks before allocation.
- Preserves existing data if `realloc` fails.

Important consequence: `array_reserve` may move memory, so the array variable itself can be reassigned internally and must be a modifiable lvalue.

## Safety model: checked vs unchecked

Checked APIs (recommended):

- Return status (`bool`) for operations that can fail.
- Validate bounds and null-related preconditions where applicable.
- Make failure paths visible in call sites.

Unchecked compatibility APIs:

- Assume preconditions are already true.
- Are concise, but undefined behavior is possible if used incorrectly (for example, out-of-bounds access or last-element access on empty arrays).

## Complexity at a glance

| Operation | Complexity | Notes |
| --- | --- | --- |
| `array_try_push` | Amortized `O(1)` | Can be `O(n)` on resize due to reallocation/copy |
| `array_reserve` | `O(1)` or `O(n)` | `O(1)` if enough capacity, else reallocation work |
| `array_try_at` | `O(1)` | Bounds check + pointer write |
| `array_try_slice_t` | `O(1)` | Creates non-owning view, no element copy |
| `array_back_ptr` / length helpers | `O(1)` | Constant-time metadata access |

## When to use it

Good fit:

- Header-only projects that want typed dynamic arrays without runtime dependencies.
- Codebases that want explicit memory ownership with optional checked safety contracts.

Less ideal:

- Workloads requiring custom allocators, stable pointers across growth, or concurrent mutation without external synchronization.

Continue with [Quickstart](./quickstart.md).
