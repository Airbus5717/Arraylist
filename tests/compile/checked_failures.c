#include "../../array.h"

generate_array_type(int);

int main(void)
{
    Array(int) arr = array_make(int, 0);
    Array(int) missing = NULL;
    Slice(int) slice;
    Span(int) span;
    int *ptr = NULL;
    int value = 0;

    if (!arr)
    {
        return 1;
    }

    if (!array_try_push(arr, 10) || !array_try_push(arr, 20) || !array_try_push(arr, 30) ||
        !array_try_push(arr, 40) || !array_try_push(arr, 50) || !array_try_push(arr, 60))
    {
        array_free(arr);
        return 1;
    }

    if (array_try_at(arr, 0, NULL))
    {
        array_free(arr);
        return 1;
    }

    if (array_try_slice_t(int, arr, 2, 5, NULL))
    {
        array_free(arr);
        return 1;
    }

    if (array_try_slice_t(int, missing, 0, 1, &slice))
    {
        array_free(arr);
        return 1;
    }

    if (array_reserve(missing, 8))
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_slice_t(int, arr, 2, 5, &slice))
    {
        array_free(arr);
        return 1;
    }

    if (slice.start != 2 || slice.count != 3)
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_slice_at_t(int, arr, slice, 0, &ptr) || !ptr || *ptr != 30)
    {
        array_free(arr);
        return 1;
    }

    if (array_try_slice_at_t(int, arr, slice, 0, NULL))
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_get(arr, 4, &value) || value != 50)
    {
        array_free(arr);
        return 1;
    }

    if (array_try_get(arr, 4, NULL))
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_set(arr, 4, 55) || !array_try_get(arr, 4, &value) || value != 55)
    {
        array_free(arr);
        return 1;
    }

    if (!array_reserve(arr, 64))
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_slice_at_t(int, arr, slice, 2, &ptr) || !ptr || *ptr != 55)
    {
        array_free(arr);
        return 1;
    }

    if (!array_try_span_t(int, arr, slice, &span) || span.count != 3 || span.elements[0] != 30 ||
        span.elements[2] != 55)
    {
        array_free(arr);
        return 1;
    }

    if (array_try_span_t(int, arr, slice, NULL))
    {
        array_free(arr);
        return 1;
    }

    array_free(arr);
    return 0;
}
