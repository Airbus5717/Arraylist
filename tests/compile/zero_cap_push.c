#include "../../array.h"

generate_array_type(int);

int main(void)
{
    Array(int) arr = array_make(int, 0);
    if (!arr)
    {
        return 1;
    }

    if (!array_try_push(arr, 42))
    {
        array_free(arr);
        return 1;
    }

    if (arr->count != 1 || arr->capacity < 1 || arr->elements[0] != 42)
    {
        array_free(arr);
        return 1;
    }

    array_free(arr);
    return 0;
}
