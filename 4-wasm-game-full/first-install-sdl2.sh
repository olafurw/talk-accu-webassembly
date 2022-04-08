# Only needed for a first install of SDL2 to your system
# Hurray for the chicken and the egg problem.
# If you want, you can delete this file and the cpp later
emcc -s USE_SDL=2 -s USE_SDL_TTF=2 first-install-sdl2.cpp -o first-install-sdl2.html;