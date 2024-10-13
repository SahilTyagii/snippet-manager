# Snippet Manager

Snippet Manager is a simple command-line tool for managing code snippets, similar to a mini Git for your snippets. You can easily add, list, update, delete, and inject snippets into files. This tool helps you keep your code snippets organized and accessible whenever you need them.

![Snippet Manager](https://img.shields.io/badge/snippet--manager-easy--to--use-blueviolet?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)
![npm](https://img.shields.io/npm/dt/snippet-manager?color=blue&label=Downloads&logo=npm&style=for-the-badge)


## Features

- Add code snippets with titles
- List all saved snippets
- Update existing snippets
- Delete snippets
- Inject snippets directly into files

## Installation

To install Snippet Manager, run the following command:

```bash
npm install -g snippet-manager
```

## Usage

Once installed, you can start using Snippet Manager by running:

```bash
snip
```
or
```bash
snippet-manager
```

## Screenshots
![image](https://github.com/user-attachments/assets/9c6de265-c38e-4fa5-8538-e6f68fa15ba6)
![image](https://github.com/user-attachments/assets/961952dc-e3ef-4eac-8a7e-b2bcea3b52d9)
![image](https://github.com/user-attachments/assets/ea2c7670-0ddf-45ca-9594-2876bfa82cef)


### Features

1. **Add Snippet**: 
   - You will be prompted to enter a title and your multi-line code snippet. Type `END` on a new line to finish entering your snippet.

2. **List Snippets**: 
   - Displays all your saved snippets along with their version numbers.

3. **Update Snippet**: 
   - You will be prompted to select a snippet by its index. You can then enter a new multi-line code snippet, finishing with `END`.

4. **Delete Snippet**: 
   - Lists all snippets and prompts you to enter the index of the snippet you wish to delete.

5. **Inject Snippet in File**: 
   - Select a snippet and specify the file path where you want to append the snippet content.

6. **Exit**: 
   - Exit the Snippet Manager.

## Example Usage

To add a snippet, you might see the following prompt:

```
Enter your multi-line code snippet. Type "END" on a new line when you are done:
```

After entering your snippet and title, it will be saved, and you can view it by listing snippets.

## File Structure

Snippet Manager stores your snippets in a local JSON file located at:

```
~/.snippet-manager/db.json
```

This file is created automatically upon the first run of the program.

## Requirements

- Node.js (v12 or higher)
- npm (Node package manager)

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.
Do give this repo a star⭐!

## License

This project is open-source and available under the [MIT License](LICENSE).
