#include <emscripten.h>

#include <algorithm>
#include <array>
#include <string_view>
#include <string>
#include <vector>
#include <set>

#include "words.h"

enum class LetterState
{
	Unknown,
	Wrong,
	WrongPlace,
	Correct
};

struct Cell
{
	char letter{' '};
	LetterState state{LetterState::Unknown};
};

std::array<std::array<Cell, 5>, 6> grid{{{Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
										 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
										 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
										 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
										 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
										 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}}}};

std::vector<std::string_view> possibleWords{words.cbegin(), words.cend()};
std::array<char, 5> correctLetters{' ', ' ', ' ', ' ', ' '};
std::vector<char> wrongLetters;
std::vector<char> wrongPlaceLetters;

uint32_t guessY{0};
uint32_t guessX{0};

std::string_view getRandomWord()
{
	const auto index{emscripten_random() * answers.size()};
	return answers[index];
}

std::string_view getRandomGuess()
{
	const auto index{emscripten_random() * possibleWords.size()};
	return possibleWords[index];
}

std::string_view correctWord{getRandomWord()};

uint32_t gamesPlayed{0};
uint32_t gamesWon{0};

bool containsCorrectLetters(std::string_view word)
{
	for (int index{0}; index < correctLetters.size(); ++index)
	{
		const auto correctLetter{correctLetters[index]};
		if (correctLetter != ' ' && word[index] != correctLetter)
		{
			return false;
		}
	}

	return true;
}

template <typename T>
bool isLetterInList(const char letter, const T &letterList)
{
	return std::any_of(
		letterList.cbegin(),
		letterList.cend(),
		[letter](const char checkLetter)
		{ return letter == checkLetter; });
}

bool containsWrongLetters(std::string_view word)
{
	for (const auto letter : word)
	{
		if (isLetterInList(letter, wrongLetters))
		{
			return true;
		}
	}

	return false;
}

void filterPossibleWords()
{
	const auto oldSize{possibleWords.size()};
	possibleWords.clear();
	possibleWords.reserve(oldSize / 2);

	for (const auto &word : words)
	{
		if (!containsCorrectLetters(word) || containsWrongLetters(word))
		{
			continue;
		}

		possibleWords.emplace_back(word);
	}
}

void reset()
{
	guessY = 0;
	guessX = 0;
	correctWord = getRandomWord();
	grid = {{{Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
			 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
			 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
			 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
			 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}},
			 {Cell{}, Cell{}, Cell{}, Cell{}, Cell{}}}};

	possibleWords = std::vector<std::string_view>{words.cbegin(), words.cend()};
	wrongLetters.clear();
	wrongPlaceLetters.clear();
	correctLetters = {' ', ' ', ' ', ' ', ' '};
}

bool isLegalWord(std::string_view word)
{
	return std::any_of(
		words.cbegin(),
		words.cend(),
		[&](std::string_view w)
		{ return w == word; });
}

bool isSolved()
{
	if (guessY > 5)
	{
		return false;
	}

	const auto &row{grid[guessY]};

	return std::all_of(
		row.cbegin(),
		row.cend(),
		[](const Cell &cell)
		{ return cell.letter != ' ' && cell.state == LetterState::Correct; });
}

bool isLost()
{
	return guessY > 5;
}

bool resolveGuess()
{
	// First, is this a valid word
	std::string guessWord{"     "};
	for (int i{0}; i < grid[guessY].size(); ++i)
	{
		guessWord[i] = grid[guessY][i].letter;
	}

	if (!isLegalWord(guessWord))
	{
		return false;
	}

	std::string wordResolve{correctWord};

	// Resolve first for correct letters
	for (int index{0}; index < wordResolve.size(); ++index)
	{
		const char guessLetter{grid[guessY][index].letter};
		const char answerLetter{wordResolve[index]};
		if (guessLetter == answerLetter)
		{
			grid[guessY][index].state = LetterState::Correct;
			wordResolve[index] = ' ';

			correctLetters[index] = guessLetter;
		}
	}

	// Then resolve for wrong locations
	for (int index{0}; index < wordResolve.size(); ++index)
	{
		if (grid[guessY][index].state != LetterState::Unknown)
		{
			continue;
		}

		const char guessLetter{grid[guessY][index].letter};
		const auto answerIndex{wordResolve.find(guessLetter)};
		if (answerIndex != std::string::npos)
		{
			grid[guessY][index].state = LetterState::WrongPlace;
			wordResolve[answerIndex] = ' ';

			wrongPlaceLetters.push_back(guessLetter);
		}
		else
		{
			grid[guessY][index].state = LetterState::Wrong;

			if (!isLetterInList(guessLetter, wrongLetters) && !isLetterInList(guessLetter, wrongPlaceLetters) && !isLetterInList(guessLetter, correctLetters))
			{
				wrongLetters.push_back(guessLetter);
			}
		}
	}

	return true;
}

void processLetter(const char letter)
{
	// enter
	if (letter == static_cast<char>(13) && guessX == 5 && guessY <= 5 && !isSolved())
	{
		if (resolveGuess() && !isSolved())
		{
			guessY++;
			guessX = 0;
		}
		return;
	}

	// backspace
	if (letter == static_cast<char>(8) && guessX != 0 && !isSolved())
	{
		guessX--;
		grid[guessY][guessX].letter = ' ';
		grid[guessY][guessX].state = LetterState::Unknown;
		return;
	}

	// letter guess
	if (letter >= 65 && letter <= 90 && guessY <= 5 && guessX <= 4)
	{
		grid[guessY][guessX].letter = letter;
		grid[guessY][guessX].state = LetterState::Unknown;
		guessX++;
		return;
	}
}

extern "C"
{
	EMSCRIPTEN_KEEPALIVE
	void update()
	{
		const auto solved{isSolved()};
		const auto lost{isLost()};
		if (solved || lost)
		{
			reset();
			gamesPlayed++;

			if (solved)
			{
				gamesWon++;
			}
		}

		const auto guess{getRandomGuess()};
		processLetter(guess[0]);
		processLetter(guess[1]);
		processLetter(guess[2]);
		processLetter(guess[3]);
		processLetter(guess[4]);
		processLetter(13);

		filterPossibleWords();
	}

	EMSCRIPTEN_KEEPALIVE
	int getGridHeight()
	{
		return grid.size();
	}

	EMSCRIPTEN_KEEPALIVE
	int getGridWidth()
	{
		return grid[0].size();
	}

	EMSCRIPTEN_KEEPALIVE
	char getCellLetter(int x, int y)
	{
		return grid[y][x].letter;
	}

	EMSCRIPTEN_KEEPALIVE
	int getCellState(int x, int y)
	{
		return static_cast<int>(grid[y][x].state);
	}

	EMSCRIPTEN_KEEPALIVE
	int getGamesPlayed()
	{
		return gamesPlayed;
	}

	EMSCRIPTEN_KEEPALIVE
	int getGamesWon()
	{
		return gamesWon;
	}
}