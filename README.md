
# Array Macros for Dynamic Arrays

A set of macros for managing dynamic arrays in C. These macros simplify operations like creation, resizing, and memory management.

---

## Declaring the Array Type

Before using the macros, you need to declare the array type globally using the `generate_array_type(type)` macro. This should be placed in the global header scope to define the array type structure for the specified type `type`.

```c
generate_array_type(int);
```

This declares a dynamic array type for `int`. You can use any valid C type, such as `float`, `double`, or custom structs.

---

## Macros

### **`array_make(T, size)`**
Creates a dynamic array of type `T` with an initial size.

**Usage:**
```c
Array(int) myArray = array_make(int, 10);
```

### **`array_free(arr)`**
Frees the memory of the array.

**Usage:**
```c
array_free(myArray);
```

### **`array_push(arr, value)`**
Appends a value to the end of the array, resizing if necessary.

**Usage:**
```c
array_push(myArray, 42);
```

### **`array_start(arr)`**
Returns a pointer to the first element of the array.

**Usage:**
```c
int *start = array_start(myArray);
```

### **`array_end(arr)`**
Returns a pointer to the last element of the array.

**Usage:**
```c
int *end = array_end(myArray);
```

### **`array_at(arr, idx)`**
Accesses the element at a specific index.

**Usage:**
```c
int value = array_at(myArray, 2);
```

### **`array_length(arr)`**
Returns the number of elements in the array.

**Usage:**
```c
usize length = array_length(myArray);
```

### **`array_for_each(arr, el)`**
Iterates over each element in the array.

**Usage:**
```c
array_for_each(myArray, el)
{
    printf("%d\n", *el);
}
```

---

## Example

```c
#include <stdio.h>
#include <stdlib.h>

// Assuming macros are included

// Declare the array type globally
generate_array_type(int);

int main()
{
    Array(int) myArray = array_make(int, 5); // Create array

    array_push(myArray, 10); // Add values
    array_push(myArray, 20);
    array_push(myArray, 30);

    array_for_each(myArray, el) // Print values
    {
        printf("%d\n", *el);
    }

    array_free(myArray); // Free memory
    return 0;
}
```

---

## Notes

- Ensure sufficient memory when resizing arrays.
- Handle memory allocation failures with error handling.
- Always free arrays with `array_free` to prevent memory leaks.
