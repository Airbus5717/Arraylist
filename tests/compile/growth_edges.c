#include "../../array.h"
#include <assert.h>
#include <stdio.h>

generate_array_type(int);

/* Expected capacity after growth from 'current' to cover 'min_needed'.
 * Mirrors array_grow_capacity logic for test assertions (small values only).
 */
static array_size_t expected_capacity_after_grow(array_size_t current, array_size_t min_needed)
{
    if (current >= min_needed)
        return current;
    array_size_t cap = (current == 0 ? 1 : current);
    while (cap < min_needed)
    {
        if (cap > (array_size_t)-1 / 2)
            return min_needed; /* fallback path */
        cap *= 2;
    }
    return cap;
}

int main(void)
{
    /* 1) Zero capacity start + first push growth to 1, then doubling */
    {
        Array(int) a = array_make(int, 0);
        assert(a != NULL);
        assert(a->count == 0);
        assert(a->capacity == 0);

        for (int i = 0; i < 10; ++i)
        {
            array_size_t before_cap = a->capacity;
            if (!array_try_push(a, i))
            {
                array_free(a);
                return 1;
            }
            array_size_t want = expected_capacity_after_grow(before_cap, (array_size_t)(i + 1));
            assert(a->capacity == want);
            assert(a->count == (array_size_t)(i + 1));
            assert(a->elements[i] == i);
        }
        array_free(a);
    }

    /* 2) Non-power-of-2 initial capacity (make(5)) + reserve crossing boundaries.
     * Growth always doubles *from the current capacity* (no power-of-2 snap).
     * grow(5,6) = 10; grow from there stays or doubles as needed.
     */
    {
        Array(int) a = array_make(int, 5);
        assert(a != NULL);
        assert(a->capacity == 5);

        /* Reserve to 6: grow(5,6) → 10 (5*2) */
        assert(array_reserve(a, 6));
        assert(a->capacity == 10);

        /* Reserve to 9: current 10 >= 9 → no-op */
        assert(array_reserve(a, 9));
        assert(a->capacity == 10);

        /* Reserve to 11: 10 <11 → 20 */
        assert(array_reserve(a, 11));
        assert(a->capacity == 20);

        /* Now fill past current cap and observe next doubling */
        for (int i = 0; i < 20; ++i)
        {
            assert(array_try_push(a, 100 + i));
        }
        assert(a->count == 20);
        assert(a->capacity == 20);

        assert(array_try_push(a, 999));
        assert(a->count == 21);
        assert(a->capacity == 40);

        array_free(a);
    }

    /* 3) Slice created early remains valid after multiple growths that move the block */
    {
        Array(int) a = array_make(int, 2);
        assert(a != NULL);

        for (int i = 0; i < 3; ++i)
            assert(array_try_push(a, i)); /* now count=3, cap probably 4 */

        Slice(int) early;
        assert(array_try_slice_t(int, a, 1, 3, &early)); /* [1,3) -> elements 1,2 */
        assert(early.start == 1 && early.count == 2);

        /* Force several growths */
        assert(array_reserve(a, 100));
        assert(a->capacity >= 100);

        assert(array_reserve(a, 300));
        assert(a->capacity >= 300);

        /* Early slice must still be valid against the (moved) array */
        assert(early.start + early.count <= a->count);

        int *p0 = NULL;
        assert(array_try_slice_at_t(int, a, early, 0, &p0));
        assert(p0 != NULL && *p0 == 1);

        int *p1 = NULL;
        assert(array_try_slice_at_t(int, a, early, 1, &p1));
        assert(p1 != NULL && *p1 == 2);

        /* Materialize a fresh span from the old slice after moves */
        Span(int) sp;
        assert(array_try_span_t(int, a, early, &sp));
        assert(sp.count == 2);
        assert(sp.elements[0] == 1 && sp.elements[1] == 2);

        array_free(a);
    }

    /* 4) Explicit reserve to exact value larger than current power-of-2 */
    {
        Array(int) a = array_make(int, 8);
        assert(array_reserve(a, 25));
        /* grow(8,25) -> 8*2=16,16<25,32 >=25 -> 32 */
        assert(a->capacity == 32);

        array_free(a);
    }

    printf("growth_edges: all assertions passed\n");
    return 0;
}
