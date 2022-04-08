cmake_minimum_required(VERSION 3.2)
project(game)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_EXECUTABLE_SUFFIX ".html")

add_executable(game 
    src/box.hpp
    src/box.cpp
    src/game_logic.cpp
)

set(EM_FLAGS "")
set(EM_FLAGS "${EM_FLAGS} -std=c++17 -fsanitize=address --profiling")
set(EM_FLAGS "${EM_FLAGS} --shell-file ../index.html --preload-file ../assets@/assets/")
set(EM_FLAGS "${EM_FLAGS} -O0 -g -gsource-map --source-map-base http://localhost:8080/build/")
set(EM_FLAGS "${EM_FLAGS} -s USE_SDL=2 -s USE_SDL_TTF=2")
set(EM_FLAGS "${EM_FLAGS} -s DEMANGLE_SUPPORT=1 -s INITIAL_MEMORY=256MB -s TOTAL_MEMORY=256MB -s ALLOW_MEMORY_GROWTH=1")
target_compile_features(game PRIVATE cxx_std_17)
set_target_properties(game PROPERTIES LINK_FLAGS ${EM_FLAGS})