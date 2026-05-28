# API Reference

This reference is organized by operation group and focuses on behavior contracts: purpose, preconditions, failure behavior, and complexity.

## Type generation

### `generate_array_type(T)`

- Purpose: declare typed `Array(T)` and `Slice(T)` forms.
- Preconditions: run before first use of those generated types.
- Failure behavior: none (macro expansion).
- Complexity: compile-time only.

## Allocation and lifetime

### `array_make(T, size)`

- Purpose: allocate a new `Array(T)` with initial `capacity == size` and `count == 0`.
- Preconditions: valid type `T`; `size` convertible to `array_size_t`.
- Failure behavior: returns `NULL` on overflow or allocation failure.
- Complexity: `O(1)` allocation step (allocator-dependent).

### `array_free(arr)`

- Purpose: release array memory.
- Preconditions: pass the same owning pointer returned by `array_make`/growth path.
- Failure behavior: none; `free(NULL)` is valid.
- Complexity: `O(1)` call (allocator-dependent release work).

## Growth and insertion

### `array_reserve(arr, min_capacity) -> bool`

- Purpose: ensure `arr->capacity >= min_capacity`.
- Preconditions:
  - `arr` must be non-`NULL`.
  - `arr` must be a modifiable lvalue (may be updated after `realloc`).
- Failure behavior: returns `false` on null input, overflow, or allocation failure.
- Complexity:
  - `O(1)` if existing capacity is enough.
  - `O(n)` when reallocation moves/copies existing elements.

### `array_try_push(arr, value) -> bool`

- Purpose: append one element at the logical end.
- Preconditions: `arr` non-`NULL`; `value` must be a scalar type covered by the macro's `_Generic` dispatch (integers and floating-point).
- Failure behavior: returns `false` if `arr` is null, count overflows, or growth fails.
- Complexity: amortized `O(1)`, worst-case `O(n)` on resize.
- Notes: copies the value into the array. Literal and rvalue scalars (for example `10`, loop index) are supported.

### `array_try_push_lvalue(arr, value) -> bool`

- Purpose: append one element when `T` is a struct or other non-scalar type, or when pushing through an lvalue is clearer.
- Preconditions: `arr` non-`NULL`; `value` must be an lvalue of the array's element type.
- Failure behavior: same as `array_try_push`.
- Complexity: same as `array_try_push`.

### `array_push(arr, value)` (compatibility)

- Purpose: append without surfacing failure in call sites.
- Preconditions: same as `array_try_push`; caller accepts silent failure.
- Failure behavior: internally ignores failed push.
- Complexity: same as `array_try_push`.

## Access and slicing

### `array_try_at(arr, idx, out_ptr) -> bool`

- Purpose: checked element access by index; writes a pointer to the element inside the array (not a copy).
- Preconditions:
  - `arr` non-`NULL`
  - `idx < arr->count`
  - `out_ptr` non-`NULL` (address of a `T*` variable)
- Failure behavior: returns `false` when any precondition fails; does not write `*out_ptr` on failure.
- Complexity: `O(1)`.
- Notes: the returned pointer is invalidated if the array is reallocated or freed.

### `array_at(arr, idx)` (unchecked)

- Purpose: direct index access.
- Preconditions: `arr` non-`NULL` and `idx` in range.
- Failure behavior: undefined behavior if preconditions are violated.
- Complexity: `O(1)`.

### `array_try_slice_t(T, arr, low, high, out_slice) -> bool`

- Purpose: build checked non-owning slice for half-open range `[low, high)`.
- Preconditions:
  - `arr` non-`NULL`
  - `low <= high <= arr->count`
  - `out_slice` non-`NULL`
- Failure behavior: returns `false` on invalid bounds or null pointers.
- Complexity: `O(1)` (no element copy).

### `slice_from_array_t(T, arr, low, high)` (unchecked)

- Purpose: build non-owning slice without validation.
- Preconditions: `arr` non-`NULL` and bounds valid.
- Failure behavior: undefined behavior if preconditions are violated.
- Complexity: `O(1)`.

### `array_back_ptr(arr)`

- Purpose: safe pointer to last element.
- Preconditions: none.
- Failure behavior: returns `NULL` when `arr` is `NULL` or empty.
- Complexity: `O(1)`.

### `array_start(arr)`

- Purpose: pointer to first element slot.
- Preconditions: `arr` non-`NULL`.
- Failure behavior: undefined behavior if `arr` is `NULL`.
- Complexity: `O(1)`.

### `array_end(arr)` / `array_end_unchecked(arr)` (unchecked)

- Purpose: pointer to last element.
- Preconditions: `arr` non-`NULL` and non-empty.
- Failure behavior: undefined behavior if preconditions are violated.
- Complexity: `O(1)`.

## Iteration

### `array_for_each_t(T, arr, it)`

- Purpose: strict C typed pointer iteration from start to end.
- Preconditions: `arr` non-`NULL`.
- Failure behavior: undefined behavior if `arr` is `NULL`.
- Complexity: `O(n)` over `count`.

### `array_for_each(arr, it)` (GNU/Clang convenience)

- Purpose: inferred-type iteration where `typeof` is available.
- Preconditions: `ARRAY_HAS_TYPEOF` is `1` (GNU/Clang, not strict ISO C) and `arr` non-`NULL`.
- Failure behavior: macro is unavailable when `ARRAY_HAS_TYPEOF` is `0`; otherwise same preconditions as typed iteration.
- Complexity: `O(n)`.

### `slice_from_array(arr, low, high)` (GNU/Clang convenience)

- Purpose: unchecked slice creation with inferred element type.
- Preconditions: `ARRAY_HAS_TYPEOF` is `1`; bounds valid.
- Failure behavior: unavailable in strict mode; undefined behavior if bounds are invalid.
- Complexity: `O(1)`.

## Metadata and nullable helpers

### `array_length(arr)` / `array_is_empty(arr)`

- Purpose: read logical size and emptiness.
- Preconditions: `arr` non-`NULL`.
- Failure behavior: undefined behavior if `arr` is `NULL`.
- Complexity: `O(1)`.

### `array_length_or0(arr)` / `array_is_empty_or_true(arr)`

- Purpose: nullable-safe metadata helpers.
- Preconditions: none.
- Failure behavior: none (`NULL` maps to `0` / `true`).
- Complexity: `O(1)`.

## Checked vs unchecked guidance

- Default for new code: checked APIs (`array_try_*`, `array_reserve`, nullable helpers).
- Use unchecked compatibility APIs only when preconditions are guaranteed locally and reviewed.

## Internal guarantees used by public macros

- Zero-capacity arrays grow correctly on first push.
- Size arithmetic is overflow-checked before allocation.
- Failed growth leaves existing array data intact.
- Checked slice creation validates half-open bounds and output pointer.
