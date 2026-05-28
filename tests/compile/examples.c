#include <stdio.h>
#include "../../array.h"

generate_array_type(int);

int main(void)
{
    Array(int) arr = array_make(int, 0);
    if (!arr)
    {
        return 1;
    }

    for (int i = 0; i < 10; ++i)
    {
        if (!array_try_push(arr, i))
        {
            array_free(arr);
            return 1;
        }
    }

    int *value = NULL;
    if (array_try_at(arr, 3, &value))
    {
        printf("value=%d\n", *value);
    }

    if (!array_reserve(arr, 64))
    {
        array_free(arr);
        return 1;
    }

    Slice(int) window;
    if (array_try_slice_t(int, arr, 2, 6, &window))
    {
        for (array_size_t i = 0; i < window.count; ++i)
        {
            printf("%d\n", window.elements[i]);
        }
    }

    Array(int) maybe_arr = NULL;
    array_size_t len = array_length_or0(maybe_arr);
    bool is_empty = array_is_empty_or_true(maybe_arr);
    (void)len;
    (void)is_empty;

    array_for_each_t(int, arr, it)
    {
        printf("%d\n", *it);
    }

#if ARRAY_HAS_TYPEOF
    array_for_each(arr, it)
    {
        printf("%d\n", *it);
    }
#endif

    array_free(arr);
    arr = NULL;
    return 0;
}
