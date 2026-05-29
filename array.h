#pragma once

#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>

/*
 * Arraylist
 * ---------
 * Header-only dynamic arrays, slices, and spans for C11/C17.
 *
 * Usage pattern:
 *   1. Include this header.
 *   2. Call generate_array_type(T) once before using Array(T), Slice(T), or Span(T).
 *   3. Create arrays with array_make(T, capacity).
 *   4. Prefer checked mutating APIs such as array_reserve and array_try_push.
 *   5. Release owning arrays with array_free.
 *
 * Ownership model:
 *   Array(T) is an owning pointer allocated by array_make and freed by
 *   array_free. Slice(T) is a non-owning range over an Array(T). Span(T) is
 *   an explicit temporary borrowed pointer view into current storage.
 *
 * Portability:
 *   The core API is strict C11/C17. Convenience macros that infer element
 *   types are enabled only when GNU/Clang typeof is available.
 */

/* Public size type used for array counts and capacities. */
typedef size_t array_size_t;

/* GNU/Clang typeof is convenient, but not part of strict ISO C. */
#if (defined(__GNUC__) || defined(__clang__)) && !defined(__STRICT_ANSI__)
#define ARRAY_HAS_TYPEOF 1
#else
#define ARRAY_HAS_TYPEOF 0
#endif

/* Token-pasting names used by generated concrete array/slice/span types. */
#define Slice(T) Slice_##T
#define Span(T) Span_##T
#define ArrayStruct(T) ArrayStruct_##T
#define Array(T) Array_##T

/*
 * Declare a range slice type for T.
 *
 * A Slice(T) stores offsets into an Array(T), not element pointers. It remains
 * meaningful across reallocations of the backing array, as long as the current
 * array still has enough elements for the range.
 */
#define decl_slice(T)                                                                              \
    typedef struct                                                                                 \
    {                                                                                              \
        array_size_t start;                                                                        \
        array_size_t count;                                                                        \
    } Slice(T)

/*
 * Declare a temporary raw pointer span type for T.
 *
 * A Span(T) is a borrowed pointer view. It must not be passed to array_free,
 * and it becomes invalid when its backing storage is freed or reallocated.
 */
#define decl_span(T)                                                                               \
    typedef struct                                                                                 \
    {                                                                                              \
        array_size_t count;                                                                        \
        T *elements;                                                                               \
    } Span(T)

/*
 * Declare Array(T), ArrayStruct(T), Slice(T), and Span(T).
 *
 * The generated Array(T) is a pointer to a flexible-array-member struct:
 * count and capacity live before the inline elements buffer. Generate the
 * type before first use in a translation unit or public header.
 */
#define generate_array_type(T)                                                                     \
    typedef struct                                                                                 \
    {                                                                                              \
        array_size_t count;                                                                        \
        array_size_t capacity;                                                                     \
        T elements[];                                                                              \
    } ArrayStruct(T);                                                                              \
    typedef ArrayStruct(T) *Array(T);                                                              \
    decl_slice(T);                                                                                 \
    decl_span(T)

/* Internal prefix shared by every generated ArrayStruct(T). */
typedef struct
{
    array_size_t count;
    array_size_t capacity;
} Array_Header;

/* Internal layout helpers for generated flexible-array-member structs. */
#define array_header_bytes(arr) ((size_t)((char *)(arr)->elements - (char *)(arr)))
#define array_elem_size(arr) (sizeof((arr)->elements[0]))

/* Return true when a * b would overflow array_size_t; otherwise write *out. */
static inline bool array_size_mul_overflow(array_size_t a, array_size_t b, array_size_t *out)
{
    if (a != 0 && b > (array_size_t)-1 / a)
    {
        return true;
    }

    *out = a * b;
    return false;
}

/* Return true when a + b would overflow array_size_t; otherwise write *out. */
static inline bool array_size_add_overflow(array_size_t a, array_size_t b, array_size_t *out)
{
    if (a > (array_size_t)-1 - b)
    {
        return true;
    }

    *out = a + b;
    return false;
}

/* Locate the first element byte from an allocation block and header size. */
static inline char *array_elements_ptr(void *block, size_t header_bytes)
{
    return (char *)block + header_bytes;
}

/*
 * Compute allocation size for a capacity.
 *
 * Returns false on size overflow. This keeps allocation and reallocation
 * paths from silently wrapping byte counts.
 */
static inline bool array_bytes_for_capacity(size_t header_bytes, size_t elem_size, array_size_t capacity,
                                            size_t *out_bytes)
{
    array_size_t elem_bytes = 0;
    array_size_t total = 0;

    if (array_size_mul_overflow(capacity, (array_size_t)elem_size, &elem_bytes))
    {
        return false;
    }

    if (array_size_add_overflow((array_size_t)header_bytes, elem_bytes, &total))
    {
        return false;
    }

    *out_bytes = (size_t)total;
    return true;
}

/*
 * Growth policy used by array_reserve_impl.
 *
 * Capacity doubles until it reaches min_capacity. When doubling would overflow,
 * it falls back to min_capacity so the later byte-size computation can perform
 * the final overflow check in one place.
 */
static inline array_size_t array_grow_capacity(array_size_t current, array_size_t min_capacity)
{
    array_size_t new_capacity = current == 0 ? 1 : current;

    while (new_capacity < min_capacity)
    {
        if (new_capacity > (array_size_t)-1 / 2)
        {
            return min_capacity;
        }

        new_capacity *= 2;
    }

    return new_capacity;
}

/*
 * Allocate a new array block with count == 0 and the requested capacity.
 *
 * Returns NULL on allocation failure or byte-size overflow.
 */
static inline void *array_make_impl(size_t elem_size, size_t header_bytes, array_size_t capacity)
{
    size_t total_bytes = 0;
    void *block = NULL;
    Array_Header *header = NULL;

    if (!array_bytes_for_capacity(header_bytes, elem_size, capacity, &total_bytes))
    {
        return NULL;
    }

    block = malloc(total_bytes);
    if (!block)
    {
        return NULL;
    }

    header = (Array_Header *)block;
    header->count = 0;
    header->capacity = capacity;
    return block;
}

/*
 * Ensure *block has at least min_capacity elements.
 *
 * On success, *block may change because realloc can move the allocation.
 * On failure, the original allocation remains valid and *block is unchanged.
 */
static inline bool array_reserve_impl(void **block, size_t elem_size, size_t header_bytes,
                                      array_size_t min_capacity)
{
    Array_Header *header = NULL;
    array_size_t new_capacity = 0;
    size_t total_bytes = 0;
    void *new_block = NULL;

    if (!block || !*block)
    {
        return false;
    }

    header = (Array_Header *)*block;
    if (header->capacity >= min_capacity)
    {
        return true;
    }

    new_capacity = array_grow_capacity(header->capacity, min_capacity);
    if (!array_bytes_for_capacity(header_bytes, elem_size, new_capacity, &total_bytes))
    {
        return false;
    }

    new_block = realloc(*block, total_bytes);
    if (!new_block)
    {
        return false;
    }

    *block = new_block;
    ((Array_Header *)*block)->capacity = new_capacity;
    return true;
}

/* Return true when start/count name a valid half-open range in header. */
static inline bool array_slice_bounds_valid(const Array_Header *header, array_size_t start, array_size_t count)
{
    array_size_t high = 0;

    if (!header)
    {
        return false;
    }

    if (array_size_add_overflow(start, count, &high))
    {
        return false;
    }

    return high <= header->count;
}

/*
 * Build a checked range slice over [low, high).
 *
 * The output range is written only on success.
 */
static inline bool array_try_slice_impl(void *block, array_size_t low, array_size_t high, array_size_t *out_start,
                                        array_size_t *out_count)
{
    Array_Header *header = NULL;

    if (!block || !out_start || !out_count)
    {
        return false;
    }

    header = (Array_Header *)block;
    if (low > high || high > header->count)
    {
        return false;
    }

    *out_start = low;
    *out_count = high - low;
    return true;
}

/*
 * Materialize a temporary raw span from a valid range.
 *
 * The span's pointer is borrowed from block and is invalidated by free/realloc.
 */
static inline bool array_try_span_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t start,
                                       array_size_t count, array_size_t *out_count, void **out_elements)
{
    Array_Header *header = NULL;
    char *base = NULL;

    if (!block || !out_count || !out_elements)
    {
        return false;
    }

    header = (Array_Header *)block;
    if (!array_slice_bounds_valid(header, start, count))
    {
        return false;
    }

    base = array_elements_ptr(block, header_bytes);
    *out_count = count;
    *out_elements = base + (start * elem_size);
    return true;
}

/* Checked element access with an untyped output slot for macro NULL support. */
static inline bool array_try_at_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t idx,
                                     void **out_ptr)
{
    Array_Header *header = NULL;
    char *base = NULL;

    if (!block || !out_ptr)
    {
        return false;
    }

    header = (Array_Header *)block;
    if (idx >= header->count)
    {
        return false;
    }

    base = array_elements_ptr(block, header_bytes);
    *out_ptr = base + (idx * elem_size);
    return true;
}

/* Write a Slice(T)-layout struct without requiring the macro to dereference it. */
static inline bool array_try_slice_into_impl(void *block, array_size_t low, array_size_t high,
                                             size_t start_offset, size_t count_offset, void *out_slice)
{
    array_size_t start = 0;
    array_size_t count = 0;

    if (!out_slice || !array_try_slice_impl(block, low, high, &start, &count))
    {
        return false;
    }

    memcpy((char *)out_slice + start_offset, &start, sizeof(start));
    memcpy((char *)out_slice + count_offset, &count, sizeof(count));
    return true;
}

/* Checked range-relative element access with an untyped output slot. */
static inline bool array_try_slice_at_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t start,
                                           array_size_t count, array_size_t idx, void **out_ptr)
{
    char *base = NULL;

    if (!block || !out_ptr || idx >= count ||
        !array_slice_bounds_valid((const Array_Header *)block, start, count))
    {
        return false;
    }

    base = array_elements_ptr(block, header_bytes);
    *out_ptr = base + ((start + idx) * elem_size);
    return true;
}

/* Write a Span(T)-layout struct without requiring the macro to dereference it. */
static inline bool array_try_span_into_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t start,
                                            array_size_t count, size_t count_offset, size_t elements_offset,
                                            void *out_span)
{
    void *elements = NULL;

    if (!out_span || !array_try_span_impl(block, elem_size, header_bytes, start, count, &count, &elements))
    {
        return false;
    }

    memcpy((char *)out_span + count_offset, &count, sizeof(count));
    memcpy((char *)out_span + elements_offset, &elements, sizeof(elements));
    return true;
}

/* Copy an element value into an untyped output slot. */
static inline bool array_try_get_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t idx,
                                      void *out_value)
{
    Array_Header *header = NULL;
    char *base = NULL;

    if (!block || !out_value)
    {
        return false;
    }

    header = (Array_Header *)block;
    if (idx >= header->count)
    {
        return false;
    }

    base = array_elements_ptr(block, header_bytes);
    memcpy(out_value, base + (idx * elem_size), elem_size);
    return true;
}

/*
 * Checked element access.
 *
 * Preconditions:
 *   arr is either NULL or a valid Array(T).
 *   out_ptr is non-NULL when arr is non-NULL and idx is in range.
 *
 * On success, *out_ptr receives a pointer to the element stored inside arr.
 * That pointer is invalidated if arr is reallocated or freed.
 */
#define array_try_at(arr, idx, out_ptr)                                                            \
    (((arr) == NULL)                                                                               \
         ? false                                                                                   \
         : array_try_at_impl((arr), array_elem_size(arr), array_header_bytes(arr), (idx),          \
                             (void **)(out_ptr)))

/*
 * Allocate an Array(T) with count == 0 and capacity == size.
 *
 * Returns NULL on allocation failure or byte-size overflow.
 */
#define array_make(T, size)                                                                          \
    ((Array(T))array_make_impl(sizeof(T), offsetof(ArrayStruct(T), elements), (size)))

/* Free an owning Array(T). Passing NULL is valid, like free(NULL). */
#define array_free(arr) free(arr)

/*
 * Ensure arr has at least min_capacity slots.
 *
 * Preconditions:
 *   arr must be a modifiable Array(T) lvalue and must not be NULL.
 *
 * Returns false on allocation failure or size overflow. On failure, arr still
 * points at the original allocation.
 */
#define array_reserve(arr, min_capacity)                                                           \
    ((arr) == NULL ? false                                                                         \
                   : array_reserve_impl((void **)&(arr), array_elem_size(arr),                     \
                                        array_header_bytes(arr), (min_capacity)))

/*
 * Append value to arr with checked growth.
 *
 * Preconditions:
 *   arr must be a modifiable Array(T) lvalue. It may be NULL.
 *   value must be assignable to the array element type.
 *
 * Returns false if arr is NULL, count would overflow, or growth fails. The
 * element assignment happens only after capacity has been reserved, so normal
 * C assignment diagnostics report incompatible value types.
 */
#define array_try_push(arr, value)                                                                \
    (((arr) != NULL && (arr)->count != (array_size_t)-1 &&                                        \
      array_reserve((arr), (arr)->count + 1))                                                     \
         ? (((arr)->elements[(arr)->count] = (value)), ((arr)->count += 1), true)                 \
         : false)

/* Compatibility alias for array_try_push. */
#define array_try_push_lvalue(arr, value) array_try_push((arr), (value))

/* Compatibility push that intentionally discards allocation failure. */
#define array_push(arr, value) ((void)array_try_push(arr, value))

/* Unchecked element access. Requires arr != NULL and idx < arr->count. */
#define array_at(arr, idx) ((arr)->elements[(idx)])

/*
 * Checked typed range slice over [low, high).
 *
 * Preconditions:
 *   out_slice must be non-NULL. arr may be NULL, in which case false is
 *   returned.
 *
 * Returns false when bounds are invalid or the implementation rejects inputs.
 * Slice(T) stores offsets, so it does not become dangling merely because arr is
 * reallocated. Use array_try_span_t for a temporary pointer view.
 */
#define array_try_slice_t(T, arr, low, high, out_slice)                                            \
    (((arr) == NULL)                                                                               \
         ? false                                                                                   \
         : array_try_slice_into_impl((arr), (low), (high), offsetof(Slice(T), start),              \
                                     offsetof(Slice(T), count), (void *)(out_slice)))

/* Unchecked typed range slice over [low, high). Requires valid bounds. */
#define slice_from_array_t(T, arr, low, high)                                                      \
    ((Slice(T))                                                                                    \
    {                                                                                              \
        .start = (array_size_t)(low),                                                              \
        .count = (array_size_t)((high) - (low)),                                                   \
    })

/* Checked element access through a range slice. */
#define array_try_slice_at_t(T, arr, slice, idx, out_ptr)                                          \
    ((void)sizeof(T),                                                                              \
     ((arr) == NULL                                                                                \
          ? false                                                                                  \
          : array_try_slice_at_impl((arr), array_elem_size(arr), array_header_bytes(arr),          \
                                    (slice).start, (slice).count, (idx), (void **)(out_ptr))))

/* Materialize a temporary raw span from an array and range slice. */
#define array_try_span_t(T, arr, slice, out_span)                                                   \
    (((arr) == NULL)                                                                               \
         ? false                                                                                   \
         : array_try_span_into_impl((arr), sizeof(T), array_header_bytes(arr), (slice).start,      \
                                    (slice).count, offsetof(Span(T), count),                       \
                                    offsetof(Span(T), elements), (void *)(out_span)))

/* Copy-based checked accessors. */
#define array_try_get(arr, idx, out_value)                                                         \
    (((arr) == NULL)                                                                               \
         ? false                                                                                   \
         : array_try_get_impl((arr), array_elem_size(arr), array_header_bytes(arr), (idx),         \
                              (void *)(out_value)))

#define array_try_set(arr, idx, value)                                                             \
    (((arr) == NULL || (idx) >= (arr)->count) ? false                                              \
                                              : (((arr)->elements[(idx)] = (value)), true))

/* Return a pointer to the last element, or NULL when arr is NULL or empty. */
#define array_back_ptr(arr)                                                                        \
    ((arr) && (arr)->count > 0 ? &(arr)->elements[(arr)->count - 1] : NULL)

/* Pointer to the first element. Requires arr != NULL. */
#define array_start(arr) ((arr)->elements)

/* Pointer to the last element. Requires arr != NULL and arr->count > 0. */
#define array_end(arr) ((arr)->elements + ((arr)->count - 1))

/* Explicit name for callers that want the unchecked contract visible. */
#define array_end_unchecked(arr) array_end(arr)

/* Count/capacity helpers. The unchecked variants require arr != NULL. */
#define array_length(arr) ((arr)->count)

#define array_is_empty(arr) ((arr)->count == 0)

/* Nullable-safe metadata helpers. */
#define array_length_or0(arr) ((arr) ? (arr)->count : 0)

#define array_is_empty_or_true(arr) ((arr) ? (arr)->count == 0 : true)

/* Strict-C iteration. Requires arr != NULL. */
#define array_for_each_t(T, arr, it)                                                             \
    for (T *(it) = (arr)->elements; (it) < (arr)->elements + (arr)->count; ++(it))

/* Generic sequence helpers shared by arrays and spans. Require seq != NULL. */
#define seq_start(seq) ((seq)->elements)
#define seq_end(seq) ((seq)->elements + (seq)->count)
#define seq_length(seq) ((seq)->count)

/* Build a temporary non-owning span from an existing element pointer and count. */
#define span_make_t(T, start, count) ((Span(T)){.count = (count), .elements = (start)})

#if ARRAY_HAS_TYPEOF

/* GNU/Clang convenience helpers that infer the sequence element type. */
#define seq_elem_type(seq) typeof(*(seq)->elements)

#define for_each(seq, iter)                                                                        \
    for (seq_elem_type(seq) *(iter) = seq_start(seq); (iter) < seq_end(seq); (iter)++)

#define array_for_each(arr, el) for_each(arr, el)

/* Unchecked inferred-type range slice over [low, high). Requires valid bounds. */
#define slice_from_array(arr, low, high)                                                           \
    ((Slice(typeof(*(arr)->elements))){                                                           \
        .start = ((array_size_t)(low)),                                                            \
        .count = ((array_size_t)((high) - (low))),                                                 \
    })

#define span_make(start, count) ((Span(typeof(*(start)))){.count = (count), .elements = (start)})

#else

/* In strict ISO C mode, use array_for_each_t(T, arr, it) instead. */
#define array_for_each(arr, el) ARRAY_FOR_EACH_REQUIRES_TYPEOF_OR_USE_array_for_each_t

#endif
