# Basic Arraylist data structure 

add your own error handling and memory allocators


it is Generic


# README: Array Macros for Dynamic Arrays

## Overview

This set of macros provides utilities to manage dynamic arrays in C. These macros abstract common operations like creating, freeing, and manipulating arrays, making the code cleaner and easier to manage.

---

## Macros

### **`array_make(T, size)`**
Creates a new dynamic array for a specified type and size.  

**Usage:**
```c
Array(int) myArray = array_make(int, 10);
```

- **Parameters:**
  - `T`: The type of elements in the array.
  - `size`: Initial capacity of the array.
- **Returns:** A pointer to the new dynamic array.
- **Notes:** Memory is allocated using `malloc`. Ensure enough memory is available.

---

### **`array_free(arr)`**
Frees the memory allocated for the array.  

**Usage:**
```c
array_free(myArray);
```

- **Parameters:**
  - `arr`: The array to free.
- **Notes:** Memory is deallocated using `free`. Ensure the pointer is valid before calling.

---

### **`array_push(arr, value)`**
Appends a value to the end of the array.  

**Usage:**
```c
array_push(myArray, 42);
```

- **Parameters:**
  - `arr`: The array to which the value is added.
  - `value`: The value to add to the array.
- **Behavior:**
  - Doubles the array's capacity using `realloc` if the current capacity is exceeded.
  - Updates the array's count.
- **Notes:** Memory allocation can fail during reallocation. Ensure proper error handling if used in critical applications.

---

### **`array_start(arr)`**
Returns a pointer to the first element of the array.  

**Usage:**
```c
int *start = array_start(myArray);
```

- **Parameters:**
  - `arr`: The array to access.
- **Returns:** Pointer to the first element.

---

### **`array_end(arr)`**
Returns a pointer to the last element of the array.  

**Usage:**
```c
int *end = array_end(myArray);
```

- **Parameters:**
  - `arr`: The array to access.
- **Returns:** Pointer to the last element.

---

### **`array_at(arr, idx)`**
Accesses the element at a specific index in the array.  

**Usage:**
```c
int value = array_at(myArray, 2);
```

- **Parameters:**
  - `arr`: The array to access.
  - `idx`: The index of the element.
- **Returns:** The value at the specified index.

---

### **`array_length(arr)`**
Returns the current number of elements in the array.  

**Usage:**
```c
usize length = array_length(myArray);
```

- **Parameters:**
  - `arr`: The array to query.
- **Returns:** The number of elements in the array.

---

### **`array_for_each(arr, el)`**
Iterates over each element in the array.  

**Usage:**
```c
array_for_each(myArray, el)
{
    printf("%d\n", *el);
}
```

- **Parameters:**
  - `arr`: The array to iterate over.
  - `el`: A pointer to each element during the iteration.

---

## Example

```c
#include <stdio.h>
#include <stdlib.h>

// Assuming the macros are included here

int main()
{
    // Create an array of integers with an initial capacity of 5
    Array(int) myArray = array_make(int, 5);

    // Add some values to the array
    array_push(myArray, 10);
    array_push(myArray, 20);
    array_push(myArray, 30);

    // Iterate through the array and print each element
    array_for_each(myArray, el)
    {
        printf("%d\n", *el);
    }

    // Free the array
    array_free(myArray);

    return 0;
}
```

---

## Notes

- Ensure sufficient memory is available before using these macros, especially when resizing arrays with `array_push`.
- Use these macros in conjunction with error handling to manage memory allocation failures.
- Always free arrays with `array_free` to avoid memory leaks.
