#include "box.hpp"

Box::Box(int x, int y, int boardScale, int boxSize, int number)
    : xGrid(x), yGrid(y), xGridNext(x), yGridNext(y),
    x(boardScale * x), y(boardScale * y), xNext(boardScale * x), yNext(boardScale * y),
    isMoving(false), deleteAfterMerge(false), isValid(true),
    height(boxSize), width(boxSize), boardScale(boardScale),
    number(number), numberNext(number)
{

}

void Box::setLocation(int newX, int newY)
{
    xGridNext = newX;
    yGridNext = newY;
    xNext = boardScale * newX;
    yNext = boardScale * newY;
}

void Box::merge()
{
    number *= 2;
}

void Box::update()
{
    if (xGridNext != xGrid)
    {
        isMoving = true;

        if (xGrid < xGridNext)
        {
            x += 32.0;

            if (x > xNext)
            {
                isMoving = false;
                x = xNext;
                xGrid = xGridNext;
            }
        }
        else if (xGrid > xGridNext)
        {
            x -= 32.0;

            if (x < xNext)
            {
                isMoving = false;
                x = xNext;
                xGrid = xGridNext;
            }
        }
    }

    if (yGridNext != yGrid)
    {
        isMoving = true;

        if (yGrid < yGridNext)
        {
            y += 32.0;

            if (y > yNext)
            {
                isMoving = false;
                y = yNext;
                yGrid = yGridNext;
            }
        }
        else if (yGrid > yGridNext)
        {
            y -= 32.0;

            if (y < yNext)
            {
                isMoving = false;
                y = yNext;
                yGrid = yGridNext;
            }
        }
    }
}