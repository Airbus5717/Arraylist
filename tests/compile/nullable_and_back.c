#include "../../array.h"
#include <assert.h>
#include <stdio.h>

generate_array_type(int);

/* Dedicated coverage for the nullable-safe helpers and array_back_ptr.
 *
 * These functions are the recommended way to access array metadata and the
 * last element when the array pointer may be NULL or the array may be empty.
 *
 * In particular, prefer array_back_ptr over array_end in almost all cases.
 */

int main(void)
{
    /* 1. All nullable helpers on explicit NULL */
    {
        Array(int) arr = NULL;

        assert(array_length_or0(arr) == 0);
        assert(array_is_empty_or_true(arr) == true);
        assert(array_back_ptr(arr) == NULL);
    }

    /* 2. Behavior on a valid but empty array */
    {
        Array(int) arr = array_make(int, 8);
        assert(arr != NULL);

        assert(array_length_or0(arr) == 0);
        assert(array_is_empty_or_true(arr) == true);
        assert(array_back_ptr(arr) == NULL);

        /* length() / is_empty() would be UB on NULL, but are valid here */
        assert(array_length(arr) == 0);
        assert(array_is_empty(arr) == true);

        array_free(arr);
    }

    /* 3. After pushes (non-empty) */
    {
        Array(int) arr = array_make(int, 4);
        assert(arr != NULL);

        assert(array_try_push(arr, 100));
        assert(array_try_push(arr, 200));

        assert(array_length_or0(arr) == 2);
        assert(array_is_empty_or_true(arr) == false);

        int *back = array_back_ptr(arr);
        assert(back != NULL);
        assert(*back == 200);

        /* Also test the direct (non-nullable) versions */
        assert(array_length(arr) == 2);
        assert(array_is_empty(arr) == false);

        array_free(arr);
    }

    /* 4. After growth that may move the block, back_ptr must still be valid */
    {
        Array(int) arr = array_make(int, 1);
        assert(array_try_push(arr, 42));
        assert(array_try_push(arr, 43)); /* will grow */

        int *back_before = array_back_ptr(arr);
        assert(back_before != NULL && *back_before == 43);

        assert(array_reserve(arr, 128)); /* likely realloc + move */

        int *back_after = array_back_ptr(arr);
        assert(back_after != NULL);
        /* realloc is allowed to extend in place; the pointer may or may not change.
         * The critical guarantee is that back_ptr (and the data) remain valid. */
        assert(*back_after == 43);

        array_free(arr);
    }

    /* 5. array_back_ptr on array that becomes empty? (not possible today,
     *    but we can simulate by manual count tampering for the test only)
     */
    {
        Array(int) arr = array_make(int, 4);
        assert(array_try_push(arr, 1));
        assert(array_try_push(arr, 2));

        /* Direct field access is allowed (public) — we use it only to test
         * the boundary of array_back_ptr when count drops to 0.
         * Real code should never do this.
         */
        arr->count = 0;

        assert(array_back_ptr(arr) == NULL);
        assert(array_is_empty(arr) == true);

        array_free(arr);
    }

    printf("nullable_and_back: all checks passed\n");
    return 0;
}
