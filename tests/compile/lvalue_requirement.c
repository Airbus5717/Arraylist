#include "../../array.h"
#include <assert.h>
#include <stdio.h>

/* Educational demonstration of the lvalue requirement for array_reserve
 * and array_try_push.
 *
 * These macros are written to update the caller's Array(T) variable when
 * realloc moves the allocation. This only works when you pass the variable
 * directly (as an lvalue), not through a pointer.
 *
 * This file is intentionally *not* a correctness test — it documents a
 * common mistake and the correct pattern.
 */

generate_array_type(int);

int main(void)
{
    Array(int) arr = array_make(int, 4);
    assert(arr != NULL);

    /* Correct usage - direct lvalue */
    if (!array_try_push(arr, 1)) {
        array_free(arr);
        return 1;
    }

    /* If we had done this through a pointer, the caller's 'arr' would not
     * be updated on realloc. The macro would only update the local pointer
     * copy inside the function.
     *
     * Always pass Array(T) variables directly to reserve/push.
     */

    printf("lvalue_requirement: demonstrated correct direct usage\n");
    array_free(arr);
    return 0;
}
