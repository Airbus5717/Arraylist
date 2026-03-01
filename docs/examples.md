# Examples

## 1) Safe append loop

```c
Array(int) arr = array_make(int, 0);
if (!arr) return 1;

for (int i = 0; i < 10; ++i)
{
    if (!array_try_push(arr, i))
    {
        array_free(arr);
        return 1;
    }
}
```

Why this matters: each append can fail due to growth/allocation, so checked control flow prevents silent data loss.

## 2) Checked index access

```c
int *value = NULL;
if (array_try_at(arr, 3, &value))
{
    printf("value=%d\n", *value);
}
```

Why this matters: bounds validation is explicit, and `out_ptr` is only written on success.

## 3) Reserve before batch append

```c
if (!array_reserve(arr, 64))
{
    array_free(arr);
    return 1;
}
```

Why this matters: reserve once before many pushes to reduce repeated growth costs.

## 4) Checked slice window

```c
Slice(int) window;
if (array_try_slice_t(int, arr, 2, 6, &window))
{
    for (array_size_t i = 0; i < window.count; ++i)
    {
        printf("%d\n", window.elements[i]);
    }
}
```

Why this matters: slicing is `O(1)` and non-copying, but still needs bounds validation.

## 5) Nullable helpers

```c
Array(int) maybe_arr = NULL;
array_size_t len = array_length_or0(maybe_arr);
bool is_empty = array_is_empty_or_true(maybe_arr);
```

Why this matters: nullable helpers avoid null checks in read-only paths.

## 6) Strict C iteration (portable)

```c
array_for_each_t(int, arr, it)
{
    printf("%d\n", *it);
}
```

Why this matters: this is the strict C11/C17 iteration path with explicit element type.

## 7) GNU convenience iteration

```c
#if ARRAY_HAS_TYPEOF
array_for_each(arr, it)
{
    printf("%d\n", *it);
}
#endif
```

Why this matters: same runtime behavior as typed iteration, but shorter syntax when `typeof` is available.

## 8) Cleanup pattern

```c
array_free(arr);
arr = NULL;
```

Why this matters: freeing ownership plus nulling local pointers helps prevent accidental reuse.
