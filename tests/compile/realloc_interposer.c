/* LD_PRELOAD interposer for testing realloc failure paths in array.h.
 *
 * Preferred way to use:
 *   tests/compile/test_with_realloc_failure.sh ./your_test
 *
 * The test binary should call interposer_arm_next_realloc_fail() (resolved
 * via dlsym) right before the operation that should see a failing realloc.
 */

#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdatomic.h>
#include <stdio.h>
#include <stdlib.h>

static atomic_int armed = 0; /* 0 = not armed, 1 = will fail the next realloc */

typedef void *(*realloc_fn)(void *, size_t);
static realloc_fn real_realloc = NULL;

static void resolve_real(void)
{
    if (!real_realloc)
    {
        real_realloc = (realloc_fn)dlsym(RTLD_NEXT, "realloc");
        if (!real_realloc)
        {
            fprintf(stderr, "interposer: dlsym(realloc) failed\n");
            abort();
        }
    }
}

/* Exported for the test to call via dlsym or declaration */
void interposer_arm_next_realloc_fail(void)
{
    atomic_store(&armed, 1);
}

void *realloc(void *ptr, size_t size)
{
    resolve_real();

    if (atomic_load(&armed))
    {
        atomic_store(&armed, 0);
        return NULL; /* inject the failure exactly once */
    }

    return real_realloc(ptr, size);
}
