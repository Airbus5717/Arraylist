/* Test + documentation for the documented contract:
 * "realloc failure inside reserve/try_push does not discard or corrupt
 *  the caller's existing Array, its count, capacity, or element data."
 *
 * The happy path is exercised here at runtime.
 * The failure path can be tested using:
 *   tests/compile/test_with_realloc_failure.sh ./realloc_preserve
 *
 * See realloc_interposer.c for the injection mechanism.
 */

#include "../../array.h"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

generate_array_type(int);

int main(void)
{
    Array(int) a = array_make(int, 2);
    if (!a)
        return 1;

    assert(array_try_push(a, 10));
    assert(array_try_push(a, 20));
    assert(array_try_push(a, 30));

    /* Record state before the growth push */
    array_size_t orig_count = a->count;
    int orig0 = a->elements[0];
    int orig2 = a->elements[2];

    /* Happy-path push (the one that would realloc in a failure-injection scenario) */
    assert(array_try_push(a, 40));

    /* Previous data still present after growth */
    assert(a->count == orig_count + 1);
    assert(a->elements[0] == orig0);
    assert(a->elements[2] == orig2);

    array_free(a);
    fprintf(stderr, "realloc_preserve: happy-path growth + data integrity verified (see top comment for the failure-path contract and interposer sources)\n");
    return 0;
}
