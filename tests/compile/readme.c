#include <stdio.h>
#include "../../array.h"

generate_array_type(int);

int main(void)
{
    Array(int) values = array_make(int, 0);
    int *at0 = NULL;

    if (!values)
    {
        return 1;
    }
    if (!array_try_push(values, 10))
    {
        return 1;
    }
    if (!array_try_push(values, 20))
    {
        return 1;
    }

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
