# Full Changelog

## v1.1 <-- NEW

**Additions**

- Added the Quiz Editor and Custom Quiz player. Currently supports Pokemon, Move, and Ability quizzes as well as question shuffling for settings.
- Improved visuals for mobile devices.

**Fixes**

- Fixed the background image stretching if the page content required scrolling to see all of it.
- Fixed the title cards for the different quizzes being different lengths.
- Fixed text on the title cards for the default quizzes displaying incorrect information about the number of rounds (It is not always ten rounds).

### v1.0.5

**Additions**

- Pokemon with special forms (Ex. Urshifu Rapid Strike) or otherwise special names (Ex. Nidoran-f) now have properly formatted names.

**Fixes**

- Fixed multiple timers running if the Time Between Rounds setting was set to a value other than 0.

### v1.0.4

**Additions**

- Added styling support for mobile devices.
- Text now updates when clicking the reset button in settings.

**Fixes**

- Fixed the info button not working on the sprites quiz page.

### v1.0.3

**Additions**

- Settings now apply immediately after being saved, instead of requiring a page refresh. If a game is in progress, they will be stored and applied once the game ends or a new quiz is selected.
- Added a button to close the settings box within the box itself.

**Fixes**

- Fixed empty values being present in settings. Settings should now always have a default value.
- Fixed the lack of an indicator when hovering over the setting descriptions in the settings box.

### v1.0.2

**Additions**

- Added the changelog page and a one time notification to the navigation bar when an update to the page happens.

**Fixes**

- Fixed being able to use the enter key to guess on the cries and sprites quizzes.
- Fixed text error in the info page.

### v1.0.1

**Additions**

- Created a simple quiz based on guessing Pokemon names from the sprite.
- Added a new setting that lets users customize the time between rounds. Setting to 0 creates a New Round button in place of the timer to advance to the next round.
- Added hover descriptions for the settings.
- Made code less messy woooo.

**Fixes**

- Fixed settings being saved as strings instead of numbers which resulted in a few issues when using the setting.
- Fixed the abilities check in the Pokemon Quiz failing if the Pokemon only has 1 ability.
- Statistics now reset when pressing the Play Again button.
- Fixed additional timers being created when pressing Play Again.

## v1.0

- Finished first build of PokeQuiz. Currently has Home, Pokemon Quiz, Move Quiz, Cries Quiz, Info Page, and Settings.
