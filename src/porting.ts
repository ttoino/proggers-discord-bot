const string GENERIC_ERROR = "Invalid input!"s;

const string CELL_OCCUPIED = "That cell is occupied!"s;
const string OUT_OF_BOUNDS = "Cannot move out of bounds!"s;

const string INVALID_MAZE_NUMBER = "Must be a number from 1 to 99!"s;
const string MAZE_NOT_FOUND = "That maze could not be found!"s;
const string INVALID_MAZE_HEADER_SIZE = "Invalid maze size in header!"s;
const string INVALID_MAZE_SIZE = "Maze does not match size in header!"s;
const string MULTIPLE_PLAYERS = "Maze has multiple players!"s;
const string INVALID_MAZE_CHARACTER = "Invalid character found in maze!"s;

const string INVALID_NAME = "Must have 15 characters or fewer!"s;
const string ANOTHER_NAME = "";

/**
 * This struct represents an entry on the leaderboard.
 */
interface LeaderboardEntry
{
    /** The player's name */
    name: string;
    /** The player's points */
    points: number;
};

/**
 * This type represents the leaderboard.
 */
type Leaderboard = Array<LeaderboardEntry>;

/**
 * This struct represents a robot or the player.
 */
interface Entity
{
    /** Position on the x-axis */
    column: number;
    /** Position on the y-axis */
    line: number;
    /** Whether the entity is alive or dead */
    alive: boolean = true;
};

/**
 * This struct holds all the information needed for a game to be played.
 */
interface Maze
{
    /** Size of the maze on the x-axis */
    nCols: number;
    /** Size of the maze on the y-axis */
    nLines: number;
    /** The maze number, "01" to "99", used to save high scores at the end of the game */
    mazeNumber: string;
    /** When the player started playing */
    startTime: number;

    /** Maze map containing only the fences/posts */
    fenceMap: Array<string>;
    /** The full maze map, created from the fenceMap */
    visualMap: Array<string>;
    /** A vector that holds all the robots */
    robots: Array<Entity>;
    /** The player */
    player: Entity;

    /**
     * Converts a column and a line into an index usable with this struct's maps.
     * 
     * @param column The column
     * @param line The line
     * 
     * @returns The index
     */
    // index = (column: number, line: number) => line * this.nCols + column;
};

/**
 * This enum represents state the game is in.
 */
enum GameState
{
    /** Game is in the main menu */
    mainMenu,
    /** User is selecting the maze */
    mazeMenu,
    /** User is playing game */
    inGame,
    /** Game has finished and the user is entering their name */
    finished
};

/**
 * Normalizes input. 
 * Replaces all tabs with spaces, removes duplicate spaces and trims spaces from the start and the end.
 * 
 * @param input The input to normalize
 */
function normalizeInput(input: string): void
{
    char last = 0;
    size_t i = 0;
    while (i < input.length())
    {
        char &c = input.at(i);

        // Replace tabs with spaces
        if (c == '\t')
            c = ' ';

        // Delete character if it is a space at the begining, at the end or after another space
        if (c == ' ' && (last == ' ' || last == 0 || i == input.length() - 1 || i == 0))
        {
            input.erase(i, 1);

            // If we're outside the string, go back one
            if (i == input.length())
                i--;
        }
        else
        {
            i++;
            last = c;
        }
    }
}

/**
 * Gets a line from stdin, normalizes it, and returns false if the eof bit is set.
 * 
 * @param input Where to store the input
 * @returns false if the eof bit is set, true otherwise
 */
function getInput(input: string): boolean
{
    getline(cin, input);
    normalizeInput(input);

    if (cin.eof())
        return false;

    return true;
}

/**
 * Checks if a char represents the first byte in a UTF8 encoded character. 
 * (More specifically, checks if it does not represent any byte that is not the first, 
 * as those always follow the same pattern.)
 * 
 * @param c The byte to check
 * 
 * @returns Whether it is the first byte
 */
function isUtf8Byte1(const char c): boolean
{
    // In a UTF8 encoded character, any byte after the first follows the pattern 0b10xxxxxx
    return ((c & 0b11000000) != 0b10000000);
}

/**
 * Counts the number of UTF8 encoded characters in a string. 
 * (More specifically, counts the number of bytes that represent the first byte of a UTF8 encoded character.)
 * 
 * @param str The string to get the length of
 * 
 * @returns The length of the string
 */
function utf8Length(const string &str): number
{
    size_t length = 0;

    for (char c : str)
        length += isUtf8Byte1(c);

    return length;
}

/**
 * Returns the sign of a number.
 * 
 * @param x The number to check
 * @returns 1 if x is positive, -1 if x is negative, 0 if x is 0
 */
function sign(int x): number
{
    return (x > 0) - (x < 0);
}

/**
 * Prints the game's rules.
 * 
 * @returns false if the user wants to exit the game
 */
function printRules(): boolean
{
    cout << "This game takes place in a maze made up of robots and electrical fences/posts.\n"
            "A fence/post is represented by an '*', a robot by an 'R' if alive, and an 'r' if dead, and you are represented by an 'H' if alive, and an 'h' if dead.\n"
            "When you touch a fence/post or a robot you die. The same rules apply to robots.\n"
            "The objective of the game is to survive until all robots die.\n"
            "You can move to any of the 8 cells adjacent to your position using the following keys:\n"
            "\tQ W E\n"
            "\tA S D\n"
            "\tZ X C\n"
            "(Where 'S' keeps you in your current position)\n"
            "After you move all alive robots will move towards you without avoiding obstacles.\n"
            "You may leave the game at any time by typing Ctrl-Z on Windows or Ctrl-D on Linux.\n\n"

            "Press enter to continue\n";

    string s;
    return getInput(s);
}

/**
 * The start of the game. Asks the user what he wants to do.
 * 
 * @param gameState The game state
 * @returns false if the user wants to exit the game
 */
function mainMenu(GameState &gameState, boolean &validInput, string &errorMessage): boolean
{
    string input;

    // Print menu
    if (validInput)
        cout << "Main menu: \n\n"
                "1) Rules \n"
                "2) Play \n"
                "0) Exit \n\n";

    cout << "Please insert option: ";

    // Get input
    if (!getInput(input))
        return false; // EOF, exit game

    validInput = true;

    if (input == "1")
    {
        // New line for spacing
        cout << "\n";
        return printRules(); // Show the rules
    }
    else if (input == "2")
    {
        // New line for spacing
        cout << "\n";
        gameState = GameState::mazeMenu; // Pick the maze
    }
    else if (input == "0")
    {
        return false; // Leave the game
    }
    else
    {
        validInput = false;
        errorMessage = GENERIC_ERROR;
    }

    return true;
}

/**
 * Checks if a maze number is valid.
 * A number is considered valid if it falls in the range "00" to "99" (needs two characters).
 * 
 * @param number The maze number
 * @returns true if the number is valid
 */
function validMazeNumber(const string &number): boolean
{
    return number.length() == 2 && isdigit(number.at(0)) && isdigit(number.at(1));
}

/**
 * Loads a maze from the respective file. 
 * Tries to handle invalid files.
 * 
 * @param maze The maze
 * @param validInput Whether the last input was valid. Set to false if file is invalid
 * @param errorMessage The reason why the file is invalid
 * 
 * @returns false if the maze was not loaded
 */
function loadMaze(Maze &maze, boolean &validInput, string &errorMessage): boolean
{
    // Open file
    ifstream file("MAZE_"s + maze.mazeNumber + ".txt"s);

    // File doesn't exist
    if (!file.is_open())
    {
        validInput = false;
        errorMessage = MAZE_NOT_FOUND;
        return false;
    }

    // Get number of rows and columns from top of file
    char x;
    file >> maze.nLines >> x >> maze.nCols;

    if (x != 'x' || file.fail())
    {
        validInput = false;
        errorMessage = INVALID_MAZE_HEADER_SIZE;
        return false;
    }

    char c;
    maze.player.alive = false;
    size_t i = 0;
    while (file.get(c))
    {
        switch (c)
        {
        case '\n':
            // Ignore newlines
            continue;
        case 'R':
            maze.robots.push_back(Entity(i % maze.nCols, i / maze.nCols));
            maze.fenceMap.push_back(' ');
            break;
        case 'H':
            if (maze.player.alive)
            {
                // Found two players
                validInput = false;
                errorMessage = MULTIPLE_PLAYERS;
                return false;
            }
            maze.player = Entity(i % maze.nCols, i / maze.nCols);
            maze.fenceMap.push_back(' ');
            break;
        case ' ':
            maze.fenceMap.push_back(' ');
            break;
        case '*':
            maze.fenceMap.push_back('*');
            break;
        default:
            // Found an invalid character
            validInput = false;
            errorMessage = INVALID_MAZE_CHARACTER;
            return false;
        }

        i++;
    }

    if (maze.nCols * maze.nLines != maze.fenceMap.size())
    {
        // Size in header does not match maze size
        validInput = false;
        errorMessage = INVALID_MAZE_SIZE;
        return false;
    }

    file.close();
    return true;
}

/**
 * Receives input from the player and loads the respective maze.
 * 
 * @param gameState The game state
 * @param maze Where the maze is stored
 * 
 * @returns false if the player wants to exit the game
 */
function mazeMenu(GameState &gameState, Maze &maze, boolean &validInput, string &errorMessage): boolean
{
    // Reset maze variable
    maze = Maze();

    validInput = true;

    // Ask user for input
    cout << "Input number of the maze: ";

    // Get input
    if (!getInput(maze.mazeNumber))
        return false;

    // Pad out maze number
    // "" -> "0" -> "00"
    // "5" -> "05"
    while (maze.mazeNumber.length() < 2)
    {
        maze.mazeNumber = "0"s + maze.mazeNumber;
    }

    // User wants to return to main menu
    if (maze.mazeNumber == "00")
    {
        cout << "\n";
        gameState = GameState::mainMenu;
        return true;
    }

    // Maze number is invalid
    if (!validMazeNumber(maze.mazeNumber))
    {
        validInput = false;
        errorMessage = INVALID_MAZE_NUMBER;
        return true;
    }

    if (!loadMaze(maze, validInput, errorMessage))
    {
        return true;
    }

    // Start the game
    gameState = GameState::inGame;
    maze.startTime = chrono::steady_clock::now();
    return true;
}

/**
 * Does a player move if it is valid.
 * If it's not, returns a useful error message.
 * 
 * @param maze The maze
 * @param errorMessage The error message returned if the movement is invalid
 * @param columnDelta How many cells to move in the x axis
 * @param lineDelta How many cells to move in the y axis
 * 
 * @returns false if the movement is invalid
 */
function doPlayerMove(Maze &maze, string &errorMessage, int columnDelta, int lineDelta): boolean
{
    int newCol = maze.player.column + columnDelta;
    int newLine = maze.player.line + lineDelta;

    if (newCol < 0 || newCol >= maze.nCols || newLine < 0 || newLine >= maze.nLines)
    {
        errorMessage = OUT_OF_BOUNDS;
        return false;
    }
    else if (maze.visualMap.at(maze.index(newCol, newLine)) == 'r')
    {
        errorMessage = CELL_OCCUPIED;
        return false;
    }

    maze.player.column = newCol;
    maze.player.line = newLine;
    return true;
}

/**
 * Asks the user for movement and does it if it's valid.
 * If it's invalid shows a helpful error message.
 * 
 * @param maze The maze
 * @param validInput Whether the input was valid
 * @param errorMessage The error message returned if the input is invalid
 * 
 * @returns false if the user wants to exit the game
 */
function movePlayer(Maze &maze, boolean &validInput, string &errorMessage): boolean
{
    string input;

    cout << "Insert movement: ";

    if (!getInput(input))
        return false;

    if (input.length() != 1)
    {
        validInput = false;
        errorMessage = GENERIC_ERROR;
        return true;
    }

    char move = tolower(input.at(0));

    switch (move)
    {
    case 'q':
        validInput = doPlayerMove(maze, errorMessage, -1, -1);
        return true;
    case 'w':
        validInput = doPlayerMove(maze, errorMessage, 0, -1);
        return true;
    case 'e':
        validInput = doPlayerMove(maze, errorMessage, 1, -1);
        return true;
    case 'a':
        validInput = doPlayerMove(maze, errorMessage, -1, 0);
        return true;
    case 's':
        validInput = doPlayerMove(maze, errorMessage, 0, 0);
        return true;
    case 'd':
        validInput = doPlayerMove(maze, errorMessage, 1, 0);
        return true;
    case 'z':
        validInput = doPlayerMove(maze, errorMessage, -1, 1);
        return true;
    case 'x':
        validInput = doPlayerMove(maze, errorMessage, 0, 1);
        return true;
    case 'c':
        validInput = doPlayerMove(maze, errorMessage, 1, 1);
        return true;
    default:
        validInput = false;
        errorMessage = GENERIC_ERROR;
        return true;
    }
}

/**
 * Checks if two entities occupy the same cell.
 * 
 * @param e1 The first entity
 * @param e2 The second entity
 * 
 * @returns true if the entities collided
 */
function entityEntityCollision(const Entity &e1, const Entity &e2): boolean
{
    return e1.line == e2.line && e1.column == e2.column;
}

/**
 * Checks if an entity occupies the same cell as a fence.
 * 
 * @param entity The entity
 * @param maze The second entity
 * 
 * @returns true if the entities collided
 */
function entityFenceCollision(const Entity &entity, const Maze &maze): boolean
{
    return maze.fenceMap.at(maze.index(entity.column, entity.line)) == '*';
}

/**
 * Moves the robots that are alive in sequential order.
 * Also checks for collisions between robots, robots and fences, and robots and the player.
 * 
 * @param maze The maze
 */
function moveRobots(Maze &maze): void
{
    for (Entity &robot : maze.robots)
    {
        if (!robot.alive)
            continue;

        robot.line += sign(maze.player.line - robot.line);
        robot.column += sign(maze.player.column - robot.column);

        robot.alive = !entityFenceCollision(robot, maze);

        for (Entity &other : maze.robots)
        {
            if (&robot == &other)
                continue;

            if (entityEntityCollision(robot, other))
            {
                robot.alive = false;
                other.alive = false;
            }
        }

        if (entityEntityCollision(robot, maze.player))
        {
            maze.player.alive = false;
        }
    }
}

/**
 * Checks if the game has ended, either because all robots are dead or because the player is dead.
 * 
 * @param maze The maze
 * 
 * @returns true if the game is over
 */
function isGameOver(const Maze &maze): boolean
{
    boolean allDead = true;
    for (const Entity &robot : maze.robots)
    {
        if (robot.alive)
        {
            allDead = false;
            break;
        }
    }

    return allDead || !maze.player.alive;
}

/**
 * Updates the maze's visualMap with the robots and the player.
 * 
 * @param maze The maze
 */
function updateVisualMap(Maze &maze): void
{
    maze.visualMap = maze.fenceMap;

    for (const Entity &r : maze.robots)
    {
        maze.visualMap.at(r.line * maze.nCols + r.column) = r.alive ? 'R' : 'r';
    }

    maze.visualMap.at(maze.player.line * maze.nCols + maze.player.column) = maze.player.alive ? 'H' : 'h';
}

/**
 * Prints the maze's visualMap.
 * 
 * @param maze The maze
 */
function displayMaze(const Maze &maze): void
{
    for (size_t i = 0; i < maze.visualMap.size(); i++)
    {
        if (i % maze.nCols == 0)
            cout << '\n';

        cout << maze.visualMap.at(i);
    }
    cout << '\n';
}

/**
 * Handles in game logic:
 * - Shows the maze
 * - Asks the player for input and moves him
 * - Moves the robots
 * - Handles collisions
 * 
 * @param gameState The state the game is in
 * @param maze The maze
 * @param validInput Whether the last input was valid
 * @param errorMessage The error message returned if the input was invalid
 * 
 * @returns false if the user wants to exit the game
 */
function inGame(GameState &gameState, Maze &maze, boolean &validInput, string &errorMessage): boolean
{
    // Show maze
    if (validInput)
    {
        updateVisualMap(maze);
        displayMaze(maze);
    }

    // Check if game is over
    if (isGameOver(maze))
    {
        gameState = GameState::finished;
        return true;
    }

    if (!movePlayer(maze, validInput, errorMessage))
        return false;
    if (!validInput)
        return true;

    if (entityFenceCollision(maze.player, maze) || maze.visualMap.at(maze.index(maze.player.column, maze.player.line)) == 'R')
    {
        maze.player.alive = false;
        return true;
    }

    moveRobots(maze);

    return true;
}

/**
 * Reads a leaderboard file.
 * 
 * @param mazeNumber Which maze to read (in the range "01" to "99")
 * @param leaderboard Variable where the leaderboard is stored
 */
function readLeaderboard(const string &mazeNumber, Leaderboard &leaderboard): void
{
    ifstream file("MAZE_"s + mazeNumber + "_WINNERS.txt"s);

    // File doesn't exist
    if (!file.is_open())
        return;

    // Ignore header
    file.ignore(100, '\n');
    file.ignore(100, '\n');

    string line;
    while (getline(file, line))
    {
        stringstream linestream(line);
        LeaderboardEntry person;
        size_t nameLength = 0;
        char c;

        while (nameLength < 15)
        {
            c = linestream.get();
            nameLength += isUtf8Byte1(c);
            person.name += c;
        }

        // Ignore dash
        linestream >> c >> person.points;
        leaderboard.push_back(person);
    }

    file.close();
}

/**
 * Function used with std::sort to sort a leaderboard by points.
 * 
 * @param person1 The first person
 * @param person2 The second person
 * 
 * @returns true if the second person's points are greater than the first's
 */
function compareLeaderboardPoints(LeaderboardEntry person1, LeaderboardEntry person2): boolean
{
    return (person1.points < person2.points);
}

/**
 * Sorts a leaderboard by points.
 * 
 * @param leaderboard The leaderboard
 */
function sortLeaderboard(Leaderboard &leaderboard): void
{
    sort(leaderboard.begin(), leaderboard.end(), compareLeaderboardPoints);
}

/**
 * Prints a formated leaderboard onto an output stream.
 * 
 * @param out Where to print the leaderboard
 * @param leaderboard The leaderboard
 */
function printLeaderboard(ostream &out, Leaderboard &leaderboard): void
{
    out << "Player          - Time\n----------------------\n";

    for (auto person : leaderboard)
    {
        out << person.name << " - " << setw(4) << right << person.points << '\n';
    }
}

/**
 * Saves a formated leaderboard onto a file.
 * 
 * @param mazeNumber Which maze file to save to (in the range "01" to "99")
 * @param leaderboard The leaderboard
 */
function saveLeaderboard(const string &mazeNumber, Leaderboard &leaderboard): void
{
    string fileName = "MAZE_"s + mazeNumber + "_WINNERS.txt"s;

    ofstream file;
    file.open(fileName);

    printLeaderboard(file, leaderboard);
}

/**
 * Searches the leaderboard for an entry with the same name. 
 * If it's found, asks the user if they want to use it or change it.
 * 
 * @param leaderboard The leaderboard
 * @param person The person with the name to search for
 * @param validInput Whether the last input was valid. Is set to false if an entry with the name is found
 * @param errorMessage The error message returned if the input was invalid
 * 
 * @returns false if the user wants to exit the game
 */
function searchSameName(Leaderboard &leaderboard, const LeaderboardEntry &person, boolean &validInput, string &errorMessage): boolean
{
    for (auto &other : leaderboard)
    {
        if (other.name == person.name)
        {
            cout << "That name already exits in the leaderboard! Do you wish to continue with it? (y/N) ";

            string decision;

            if (!getInput(decision))
                return false;

            if (decision == "y" || decision == "Y")
            {
                // Only save new score if it's better than the current one
                if (person.points < other.points)
                    other.points = person.points;
            }
            else
            {
                validInput = false;
                errorMessage = ANOTHER_NAME;
            }
            return true;
        }
    }

    leaderboard.push_back(person);
    return true;
}

/**
 * Shows the game result.
 * If the player won asks for his name and saves it on the leaderboard.
 * 
 * @param gameState The state the game is in
 * @param maze The maze
 * @param validInput Whether the last input was valid
 * @param errorMessage The error message returned if the input was invalid
 * 
 * @returns false if the user wants to exit the game
 */
function finished(GameState &gameState, const Maze &maze, boolean &validInput, string &errorMessage): boolean
{
    if (maze.player.alive)
    {
        if (validInput)
            cout << "You win!\n";

        cout << "Please insert your name: ";

        LeaderboardEntry person;
        Leaderboard leaderboard;

        // Save points as soon as possible
        person.points = chrono::duration_cast<chrono::seconds>(chrono::steady_clock::now() - maze.startTime).count();

        if (!getInput(person.name))
            return false;

        // Check name length
        size_t nameLength = utf8Length(person.name);
        if (nameLength > 15)
        {
            validInput = false;
            errorMessage = INVALID_NAME;
            return true;
        }
        else if (nameLength == 0)
        {
            validInput = false;
            errorMessage = GENERIC_ERROR;
            return true;
        }
        validInput = true;
        // Name is valid, pad it out to a length of 15
        person.name += string(15 - nameLength, ' ');

        readLeaderboard(maze.mazeNumber, leaderboard);

        if (!searchSameName(leaderboard, person, validInput, errorMessage))
            return false;

        if (!validInput)
            return true;

        sortLeaderboard(leaderboard);

        cout << '\n';
        printLeaderboard(cout, leaderboard);
        cout << '\n';

        saveLeaderboard(maze.mazeNumber, leaderboard);
    }
    else
        cout << "You lose :(\n";

    cout << "Press enter to continue\n";
    gameState = GameState::mainMenu;

    string i;
    return getInput(i);
}

int main()
{
    /** Whether the program is running */
    boolean running = true;
    /** Whether the last input was valid */
    boolean validInput = true;
    /** The message to show if the input was invalid */
    string errorMessage;
    /** The game state */
    GameState gameState = GameState::mainMenu;
    /** Information about the maze */
    Maze maze;

    while (running)
    {
        if (!validInput)
            cout << errorMessage << "\n\n";

        switch (gameState)
        {
        case GameState::mainMenu:
            running = mainMenu(gameState, validInput, errorMessage);
            break;
        case GameState::mazeMenu:
            running = mazeMenu(gameState, maze, validInput, errorMessage);
            break;
        case GameState::inGame:
            running = inGame(gameState, maze, validInput, errorMessage);
            break;
        case GameState::finished:
            running = finished(gameState, maze, validInput, errorMessage);
            break;
        }
    }
}
