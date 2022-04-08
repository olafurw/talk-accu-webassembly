#ifndef BOX_H
#define BOX_H

struct Box
{
    int xGrid = 0;
    int yGrid = 0;
    int xGridNext = 0;
    int yGridNext = 0;
    float x = 0.0f;
    float y = 0.0f;
    float xNext = 0.0f;
    float yNext = 0.0f;
    bool isValid = false;
    bool isMoving = false;
    bool deleteAfterMerge = false;
    int height = 0;
    int width = 0;
    int boardScale = 0;
    int number = 0;
    int numberNext = 0;

    Box() = default;
    Box(int x, int y, int boardScale, int boxSize, int number);

    void setLocation(int newX, int newY);
    void merge();
    void update();
};

#endif // BOX_H