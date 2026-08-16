#include "../../array.h"
#include <assert.h>
#include <stdio.h>

generate_array_type(int);

/* Tests for the unchecked / compatibility convenience APIs.
 *
 * WARNING: These APIs have no safety checks and will cause undefined behavior
 * if preconditions are violated. They exist only for performance-critical code
 * where the caller has already proven the requirements.
 *
 * This file demonstrates the *correct* (i.e. safe) usage of the dangerous tools.
 * In real code you should almost always prefer the checked equivalents.
 *
 * Covered here:
 *   - array_push (discarding version)
 *   - array_at
 *   - array_start / array_end / array_end_unchecked
 *   - slice_from_array_t (unchecked)
 *   - span_make_t (unchecked)
 *   - seq_start / seq_end / seq_length
 *   - array_for_each (GNU typeof version, when available)
 */

int main(void)
{
    Array(int) a = array_make(int, 8);
    assert(a != NULL);

    /* Use the discarding push a few times (should succeed here) */
    array_push(a, 10);
    array_push(a, 20);
    array_push(a, 30);
    assert(a->count == 3);

    /* Direct unchecked access */
    assert(array_at(a, 0) == 10);
    assert(array_at(a, 2) == 30);

    /* Start / end pointers (require non-null and for end: non-empty).
     * Note: array_end returns a pointer to the LAST element, not one-past-end.
     * This is a common source of confusion for C programmers. Prefer array_back_ptr
     * in most real code. */
    int *first = array_start(a);
    int *last  = array_end(a);
    assert(first == &a->elements[0]);
    assert(last  == &a->elements[2]);
    assert(*first == 10 && *last == 30);

    /* Explicit unchecked alias */
    int *last2 = array_end_unchecked(a);
    assert(last2 == last);

    /* seq_* helpers on the Array (treated as a sequence) */
    assert(seq_length(a) == 3);
    assert(seq_start(a) == first);
    assert(seq_end(a)   == last + 1);   /* one past last element */

    /* Unchecked slice creation (caller guarantees bounds) */
    Slice(int) sl = slice_from_array_t(int, a, 1, 3);
    assert(sl.start == 1 && sl.count == 2);

    /* Unchecked span creation from the slice range (caller guarantees validity).
     * We use temporaries to avoid any macro argument / designated initializer parsing edge cases. */
    int *slice_base = &a->elements[sl.start];
    array_size_t slice_len = sl.count;

    /* Build Span using direct member assignment (robust across all compiler modes).
     * This still exercises using Span(int) with data not owned by an Array. */
    Span(int) sp;
    sp.count = slice_len;
    sp.elements = slice_base;
    assert(sp.count == 2);
    assert(sp.elements[0] == 20 && sp.elements[1] == 30);

    /* Iteration via the GNU convenience macro (only when typeof is available) */
#if ARRAY_HAS_TYPEOF
    int sum = 0;
    array_for_each(a, el) {
        sum += *el;
    }
    assert(sum == 60);

    /* Also test the generic for_each via seq */
    int sum2 = 0;
    for_each(a, el) {
        sum2 += *el;
    }
    assert(sum2 == 60);
#endif

    /* seq helpers also work directly on a materialized Span */
    assert(seq_length(&sp) == 2);
    assert(seq_start(&sp)[0] == 20);

    array_free(a);

    /* Also test span_make on raw storage (not from an Array) */
    int raw[4] = { 7, 8, 9, 10 };
    int *raw_ptr = raw;
    array_size_t raw_len = 4;

    Span(int) raw_span;
    raw_span.count = raw_len;
    raw_span.elements = raw_ptr;
    assert(seq_length(&raw_span) == 4);
    assert(raw_span.elements[3] == 10);

    printf("unchecked_convenience: all checks passed\n");
    return 0;
}
