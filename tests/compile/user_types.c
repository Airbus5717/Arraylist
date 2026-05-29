#include "../../array.h"

typedef enum
{
    MODE_READ,
    MODE_WRITE,
} Mode;

typedef unsigned long ItemId;

generate_array_type(Mode);
generate_array_type(ItemId);

int main(void)
{
    Array(Mode) modes = array_make(Mode, 0);
    Array(ItemId) ids = array_make(ItemId, 0);
    ItemId id = 42UL;

    if (!modes || !ids)
    {
        array_free(modes);
        array_free(ids);
        return 1;
    }

    if (!array_try_push(modes, MODE_READ) || !array_try_push(ids, id) || !array_try_push(ids, 77UL))
    {
        array_free(modes);
        array_free(ids);
        return 1;
    }

    if (modes->count != 1 || modes->elements[0] != MODE_READ || ids->count != 2 || ids->elements[1] != 77UL)
    {
        array_free(modes);
        array_free(ids);
        return 1;
    }

    array_free(modes);
    array_free(ids);
    return 0;
}
