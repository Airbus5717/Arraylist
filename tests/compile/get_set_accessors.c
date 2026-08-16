#include "../../array.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    int x;
    int y;
} Point;

generate_array_type(int);
generate_array_type(Point);

/* Focused test for the checked value and pointer accessors:
 * array_try_get, array_try_set, array_try_at (and their slice variants
 * are already covered elsewhere). Also exercises them with structs.
 */

int main(void)
{
    /* 1. Basic int get / set / at */
    {
        Array(int) a = array_make(int, 8);
        assert(a != NULL);

        for (int i = 0; i < 5; ++i) {
            assert(array_try_push(a, i * 10));
        }

        /* try_get */
        int v;
        assert(array_try_get(a, 0, &v) && v == 0);
        assert(array_try_get(a, 4, &v) && v == 40);
        assert(!array_try_get(a, 5, &v));     /* out of range */
        assert(!array_try_get(a, 999, &v));

        Array(int) missing = NULL;
        assert(!array_try_get(missing, 0, &v));   /* NULL array via variable (literal NULL can cause dead-branch type errors in some macros) */
        assert(!array_try_get(a, 0, NULL));       /* NULL out pointer */

        /* try_set */
        assert(array_try_set(a, 2, 999));
        assert(array_try_get(a, 2, &v) && v == 999);
        assert(!array_try_set(a, 5, 123));    /* out of range */
        assert(!array_try_set(missing, 0, 1));

        /* try_at (pointer access) */
        int *p = NULL;
        assert(array_try_at(a, 1, &p) && p != NULL && *p == 10);
        assert(array_try_at(a, 4, &p) && *p == 40);
        *p = 444; /* mutate through the returned pointer */
        assert(array_try_get(a, 4, &v) && v == 444);

        assert(!array_try_at(a, 5, &p));
        assert(!array_try_at(missing, 0, &p));
        assert(!array_try_at(a, 0, NULL));    /* NULL out pointer */

        array_free(a);
    }

    /* 2. Struct element accessors */
    {
        Array(Point) pts = array_make(Point, 4);
        assert(pts != NULL);

        Point p1 = { .x = 1, .y = 2 };
        Point p2 = { .x = 3, .y = 4 };
        assert(array_try_push(pts, p1));
        assert(array_try_push(pts, p2));

        /* try_get with struct */
        Point got;
        assert(array_try_get(pts, 1, &got));
        assert(got.x == 3 && got.y == 4);

        /* try_set with struct */
        Point replacement = { .x = 99, .y = 100 };
        assert(array_try_set(pts, 0, replacement));
        assert(array_try_get(pts, 0, &got));
        assert(got.x == 99 && got.y == 100);

        /* try_at with struct */
        Point *pp = NULL;
        assert(array_try_at(pts, 1, &pp));
        assert(pp != NULL && pp->x == 3);
        pp->y = 555;
        assert(array_try_get(pts, 1, &got) && got.y == 555);

        array_free(pts);
    }

    /* 3. Accessors remain valid after growth (data copied, pointers from try_at are invalidated) */
    {
        Array(int) a = array_make(int, 2);
        assert(array_try_push(a, 7));
        assert(array_try_push(a, 8));

        int *p_before = NULL;
        assert(array_try_at(a, 1, &p_before));
        assert(*p_before == 8);

        /* Force growth */
        assert(array_reserve(a, 64));

        /* Old pointer from before growth is now invalid (we must not dereference it).
         * We can only check that new access still works. */
        int v;
        assert(array_try_get(a, 1, &v) && v == 8);

        int *p_after = NULL;
        assert(array_try_at(a, 0, &p_after));
        assert(*p_after == 7);

        array_free(a);
    }

    printf("get_set_accessors: all checks passed\n");
    return 0;
}
