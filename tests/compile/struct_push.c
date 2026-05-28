#include "../../array.h"

typedef struct
{
    int x;
    int y;
} Point;

generate_array_type(Point);

int main(void)
{
    Array(Point) points = array_make(Point, 0);
    Point p = {.x = 1, .y = 2};

    if (!points)
    {
        return 1;
    }

    if (!array_try_push_lvalue(points, p))
    {
        array_free(points);
        return 1;
    }

    if (points->count != 1 || points->elements[0].x != 1 || points->elements[0].y != 2)
    {
        array_free(points);
        return 1;
    }

    array_free(points);
    return 0;
}
