mkdir -p build;
pushd build;
if [ "$1" = "clean" ]; then
    emmake make clean;
fi
emcmake cmake .. && emmake make;
popd;