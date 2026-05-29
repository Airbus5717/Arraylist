#include "../../array.h"

typedef struct
{
    int x;
    int y;
} Point;

generate_array_type(Point);

int main(void)
{
    Array(Point) points = array_make(Point, 8);
    Point p = {.x = 1, .y = 2};

    if (!points)
    {
        return 1;
    }

    if (!array_try_push(points, p))
    {
        array_free(points);
        return 1;
    }

    if (!array_try_push(points, ((Point){.x = 3, .y = 4})))
    {
        array_free(points);
        return 1;
    }

    if (points->count != 2 || points->elements[0].x != 1 || points->elements[0].y != 2 ||
        points->elements[1].x != 3 || points->elements[1].y != 4)
    {
        array_free(points);
        return 1;
    }

    array_free(points);
    return 0;
}
