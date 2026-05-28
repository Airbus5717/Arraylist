#pragma once

#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef size_t array_size_t;

#if (defined(__GNUC__) || defined(__clang__)) && !defined(__STRICT_ANSI__)
#define ARRAY_HAS_TYPEOF 1
#else
#define ARRAY_HAS_TYPEOF 0
#endif

#define Slice(T) Slice_##T
#define ArrayStruct(T) ArrayStruct_##T
#define Array(T) Array_##T

#define decl_slice(T)                                                                              \
    typedef struct                                                                                 \
    {                                                                                              \
        array_size_t count;                                                                        \
        T *elements;                                                                               \
    } Slice(T)

#define generate_array_type(T)                                                                     \
    typedef struct                                                                                 \
    {                                                                                              \
        array_size_t count;                                                                        \
        array_size_t capacity;                                                                     \
        T elements[];                                                                              \
    } ArrayStruct(T);                                                                              \
    typedef ArrayStruct(T) *Array(T);                                                              \
    decl_slice(T)

typedef struct
{
    array_size_t count;
    array_size_t capacity;
} Array_Header;

#define array_header_bytes(arr) ((size_t)((char *)(arr)->elements - (char *)(arr)))
#define array_elem_size(arr) (sizeof((arr)->elements[0]))

static inline bool array_size_mul_overflow(array_size_t a, array_size_t b, array_size_t *out)
{
    if (a != 0 && b > (array_size_t)-1 / a)
    {
        return true;
    }

    *out = a * b;
    return false;
}

static inline bool array_size_add_overflow(array_size_t a, array_size_t b, array_size_t *out)
{
    if (a > (array_size_t)-1 - b)
    {
        return true;
    }

    *out = a + b;
    return false;
}

static inline char *array_elements_ptr(void *block, size_t header_bytes)
{
    return (char *)block + header_bytes;
}

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

static inline bool array_try_push_impl(void **block, size_t elem_size, size_t header_bytes, const void *value,
                                       size_t value_size)
{
    Array_Header *header = NULL;
    char *elements = NULL;

    if (!block || !*block || !value || value_size == 0 || value_size != elem_size)
    {
        return false;
    }

    header = (Array_Header *)*block;
    if (header->count == (array_size_t)-1)
    {
        return false;
    }

    if (!array_reserve_impl(block, elem_size, header_bytes, header->count + 1))
    {
        return false;
    }

    header = (Array_Header *)*block;
    elements = array_elements_ptr(*block, header_bytes);
    memcpy(elements + (header->count * elem_size), value, value_size);
    header->count += 1;
    return true;
}

static inline bool array_try_slice_impl(void *block, size_t elem_size, size_t header_bytes, array_size_t low,
                                        array_size_t high, array_size_t *out_count, void **out_elements)
{
    Array_Header *header = NULL;
    char *base = NULL;

    if (!block || !out_count || !out_elements)
    {
        return false;
    }

    header = (Array_Header *)block;
    if (low > high || high > header->count)
    {
        return false;
    }

    base = array_elements_ptr(block, header_bytes);
    *out_count = high - low;
    *out_elements = base + (low * elem_size);
    return true;
}

#define array_try_at(arr, idx, out_ptr)                                                            \
    (((arr) == NULL || (idx) >= (arr)->count) ? false                                              \
                                              : ((*(out_ptr) = &(arr)->elements[(idx)]), true))

#define array_make(T, size)                                                                          \
    ((Array(T))array_make_impl(sizeof(T), offsetof(ArrayStruct(T), elements), (size)))

#define array_free(arr) free(arr)

#define array_reserve(arr, min_capacity)                                                           \
    array_reserve_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr),             \
                       (min_capacity))

#define array_try_push(arr, value)                                                                 \
    _Generic((value),                                                                              \
        char: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr),  \
                                    &(char){(char)(value)}, array_elem_size(arr)),                \
        signed char: array_try_push_impl((void **)&(arr), array_elem_size(arr),                    \
                                         array_header_bytes(arr),                                  \
                                         &(signed char){(signed char)(value)}, array_elem_size(arr)), \
        unsigned char: array_try_push_impl((void **)&(arr), array_elem_size(arr),                  \
                                           array_header_bytes(arr),                                \
                                           &(unsigned char){(unsigned char)(value)},             \
                                           array_elem_size(arr)),                                  \
        short: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr), \
                                    &(short){(short)(value)}, array_elem_size(arr)),              \
        unsigned short: array_try_push_impl((void **)&(arr), array_elem_size(arr),                 \
                                            array_header_bytes(arr),                               \
                                            &(unsigned short){(unsigned short)(value)},            \
                                            array_elem_size(arr)),                                 \
        int: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr),  \
                                   &(int){(int)(value)}, array_elem_size(arr)),                   \
        unsigned int: array_try_push_impl((void **)&(arr), array_elem_size(arr),                   \
                                          array_header_bytes(arr),                                 \
                                          &(unsigned int){(unsigned int)(value)}, array_elem_size(arr)), \
        long: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr),  \
                                    &(long){(long)(value)}, array_elem_size(arr)),                \
        unsigned long: array_try_push_impl((void **)&(arr), array_elem_size(arr),                 \
                                           array_header_bytes(arr),                                \
                                           &(unsigned long){(unsigned long)(value)},              \
                                           array_elem_size(arr)),                                  \
        long long: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr), \
                                        &(long long){(long long)(value)}, array_elem_size(arr)),  \
        unsigned long long: array_try_push_impl((void **)&(arr), array_elem_size(arr),             \
                                                array_header_bytes(arr),                           \
                                                &(unsigned long long){(unsigned long long)(value)}, \
                                                array_elem_size(arr)),                             \
        float: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr), \
                                    &(float){(float)(value)}, array_elem_size(arr)),               \
        double: array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr), \
                                      &(double){(double)(value)}, array_elem_size(arr)))

#define array_try_push_lvalue(arr, value)                                                          \
    array_try_push_impl((void **)&(arr), array_elem_size(arr), array_header_bytes(arr), &(value),  \
                        array_elem_size(arr))

#define array_push(arr, value) ((void)array_try_push(arr, value))

#define array_at(arr, idx) ((arr)->elements[(idx)])

#define array_try_slice_t(T, arr, low, high, out_slice)                                            \
    array_try_slice_impl((arr), sizeof(T), array_header_bytes(arr), (low), (high),                 \
                         &(out_slice)->count, (void **)&(out_slice)->elements)

#define slice_from_array_t(T, arr, low, high)                                                      \
    ((Slice(T))                                                                                    \
    {                                                                                              \
        .count = (array_size_t)((high) - (low)),                                                   \
        .elements = (arr)->elements + (low),                                                       \
    })

#define array_back_ptr(arr)                                                                        \
    ((arr) && (arr)->count > 0 ? &(arr)->elements[(arr)->count - 1] : NULL)

#define array_start(arr) ((arr)->elements)

#define array_end(arr) ((arr)->elements + ((arr)->count - 1))

#define array_end_unchecked(arr) array_end(arr)

#define array_length(arr) ((arr)->count)

#define array_is_empty(arr) ((arr)->count == 0)

#define array_length_or0(arr) ((arr) ? (arr)->count : 0)

#define array_is_empty_or_true(arr) ((arr) ? (arr)->count == 0 : true)

#define array_for_each_t(T, arr, it)                                                             \
    for (T *(it) = (arr)->elements; (it) < (arr)->elements + (arr)->count; ++(it))

#define seq_start(seq) ((seq)->elements)
#define seq_end(seq) ((seq)->elements + (seq)->count)
#define seq_length(seq) ((seq)->count)

#define slice_make(T, start, count) ((Slice(T)){.count = (count), .elements = (start)})

#if ARRAY_HAS_TYPEOF

#define seq_elem_type(seq) typeof(*(seq)->elements)

#define for_each(seq, iter)                                                                        \
    for (seq_elem_type(seq) *(iter) = seq_start(seq); (iter) < seq_end(seq); (iter)++)

#define array_for_each(arr, el) for_each(arr, el)

#define slice_from_array(arr, low, high)                                                           \
    ((Slice(typeof(*(arr)->elements))){                                                           \
        .count = ((array_size_t)((high) - (low))),                                                 \
        .elements = seq_start(arr) + (low),                                                        \
    })

#else

#define array_for_each(arr, el) ARRAY_FOR_EACH_REQUIRES_TYPEOF_OR_USE_array_for_each_t

#endif
