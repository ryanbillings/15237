15237 Homework 1
================

Arjuna Hayes - achayes
Karl Hellstern - khellste
Ryan Billings - rbilling

This game is based off of the puzzles found in the Pokemon video game series.

To play the game, click 'Start Game' after going to the index.html file.

You will enter the game and have control over the Penguin character.
The objective is to slide the penguin on the ice and reach the Igloo.
Throughout the game, you will encounter obstacles such as boulders, bombs, portals, etc.

Boulders - Stop the penguin in its path
Bombs - Destroy the penguin and start the level over
Portals - Transport the penguin to another portal with the same color
Arrows - Change the direction that the penguin is sliding
Ice Cubes - Can slide on the ice and destroy any bombs in its path

There is also a create level mode. From the start screen, click 'Create Level'.
You will be brought to an empty level with a bar to the right containing editable content.
You can click on any item on the right bar, then click again on the map to place it.
Once you have placed all your items, you can click 'PLAY' on the bottom right to start your created game.

*For testing purposes you have access to the following cheats during Gameplay:

ESC - Main Menu
R - Restart the level
] - Move to the next level
[ - Move to the previous level

*While this game works on all HTML5 Browsers, some people have experienced slow gameplay on Firefox.
To get the maximum speed out of the game, play on Chrome.


15237 Concepts Applied

This game uses Object-Oriented Design in many ways. From a high level standpoint:
- We use a GameState object which contains information about the entire state of the game.
- The GameState contains multiple levels, which are also their own objects.
- Each type of block on a level is an object. These items all inherit from BaseObject, which contains generic data such as position and speed.

All of the items and levels are drawn on the canvas using functions that we learned in class.
We make use of lines, shapes, arcs, curves and text on the canvas.

Mouse listeners are used within the start screen and the create level mode.
Keyboard listeners are used while controlling the penguin throughout the game.

Enjoy!!

