#include <stdio.h>
#include "../../array.h"

generate_array_type(int);

int main(void)
{
    Array(int) values = array_make(int, 8);
    int *first = NULL;

    if (!values)
    {
        return 1;
    }

    if (!array_try_push(values, 10))
    {
        goto fail;
    }
    if (!array_try_push(values, 20))
    {
        goto fail;
    }
    if (!array_try_push(values, 30))
    {
        goto fail;
    }

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
