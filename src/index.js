#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Low, JSONFile } from 'lowdb';
import inquirer from 'inquirer';
import chalk from 'chalk';
import readline from 'readline';
import figlet from 'figlet';
import FileTreeSelectionPrompt from 'inquirer-file-tree-selection-prompt';

// Register the file-tree-selection prompt
inquirer.registerPrompt('file-tree-selection', FileTreeSelectionPrompt);

// Define database paths
const dbDir = path.join(os.homedir(), '.snippet-manager');
const dbFilePath = path.join(dbDir, 'db.json');

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter);

// Initialize the database
async function initDB() {
    await db.read();
    db.data ||= { snippets: [] };
    await db.write();
}

// Display app title using figlet
function displayTitle() {
    figlet.text('Snippet Manager', { font: 'Slant' }, (err, data) => {
        if (err) {
            console.log(chalk.red('Something went wrong...'));
            return;
        }
        console.log(chalk.blue(data));
    });
}

// Add a new snippet
async function addSnippet(title, code) {
    await db.read();
    db.data.snippets.push({ title, code, version: 1, createdAt: new Date() });
    await db.write();
    console.log(chalk.green('Snippet added successfully!'));
}

// List all snippets
async function listSnippets() {
    await db.read();
    if (db.data.snippets.length === 0) {
        console.log(chalk.yellow('No snippets found.'));
        return;
    }
    db.data.snippets.forEach((snippet, index) => {
        console.log(chalk.blue(`${index + 1}. ${snippet.title} (Version: ${snippet.version})`));
    });
}

// View a specific snippet
async function viewSnippet() {
    await listSnippets();
    const { index } = await inquirer.prompt([
        { type: 'number', name: 'index', message: 'Enter the snippet index to view:' },
    ]);

    const snippetIndex = index - 1;
    await db.read();

    if (snippetIndex < 0 || snippetIndex >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return;
    }

    const snippet = db.data.snippets[snippetIndex];
    console.log(
        chalk.green(`\nTitle: ${snippet.title}\n`) +
        chalk.cyan(`Version: ${snippet.version}\nCreated At: ${snippet.createdAt}\n`) +
        chalk.white('Code:\n') +
        chalk.gray(`${snippet.code}\n`)
    );
}

// Update an existing snippet
async function updateSnippet(index, newCode) {
    await db.read();
    if (index < 0 || index >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return;
    }
    db.data.snippets[index].code = newCode;
    db.data.snippets[index].version += 1;
    await db.write();
    console.log(chalk.green('Snippet updated successfully!'));
}

// Delete a snippet
async function deleteSnippet() {
    await listSnippets();
    const { index } = await inquirer.prompt([
        { name: 'index', message: 'Enter snippet index to delete:', type: 'number' },
    ]);
    const snippetIndex = index - 1;
    if (snippetIndex < 0 || snippetIndex >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return;
    }
    const deletedSnippet = db.data.snippets.splice(snippetIndex, 1);
    await db.write();
    console.log(chalk.green(`Snippet "${deletedSnippet[0].title}" deleted successfully!`));
}

// Append a snippet to a file
async function appendSnippetToFile() {
    await db.read();
    const { snippetIndex } = await inquirer.prompt([
        {
            type: 'list',
            name: 'snippetIndex',
            message: 'Select a snippet to append to a file:',
            choices: db.data.snippets.map((snippet, index) => ({
                name: `${snippet.title} (Version: ${snippet.version})`,
                value: index,
            })),
        },
    ]);

    const snippetContent = `// Snippet: ${db.data.snippets[snippetIndex].title}\n${db.data.snippets[snippetIndex].code}\n\n`;

    const { method } = await inquirer.prompt([
        {
            type: 'list',
            name: 'method',
            message: 'How would you like to select the file?',
            choices: ['Manual Path Entry', 'File Tree Selection'],
        },
    ]);

    let filePath;
    if (method === 'Manual Path Entry') {
        const { inputFilePath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputFilePath',
                message: 'Enter the file path (Example: ./controllers/user.js):',
                validate: (input) => (input ? true : 'File path cannot be empty.'),
            },
        ]);
        filePath = path.resolve(inputFilePath);
    } else {
        const { selectedFilePath } = await inquirer.prompt([
            {
                type: 'file-tree-selection',
                name: 'selectedFilePath',
                message: 'Select the file from the tree:',
            },
        ]);
        filePath = path.resolve(selectedFilePath);
    }

    try {
        fs.appendFileSync(filePath, snippetContent);
        console.log(chalk.green(`Snippet appended to ${filePath} successfully!`));
    } catch (error) {
        console.error(chalk.red(`Failed to append snippet: ${error.message}`));
    }
}

// Add a multi-line snippet
async function addMultiLineSnippet() {
    console.log(chalk.yellow('Enter your multi-line code snippet. Type "END" when done:'));

    const lines = [];
    const rl = readline.createInterface({ input: process.stdin });

    for await (const line of rl) {
        if (line.trim() === 'END') break;
        lines.push(line);
    }

    rl.close();

    const { title } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Snippet Title:' },
    ]);

    await addSnippet(title, lines.join('\n'));
}

// Update a multi-line snippet
async function updateMultiLineSnippet() {
    await listSnippets();
    const { index } = await inquirer.prompt([
        { name: 'index', message: 'Enter snippet index to update:', type: 'number' },
    ]);

    const snippetIndex = index - 1;
    if (snippetIndex < 0 || snippetIndex >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return;
    }

    console.log(chalk.yellow('Enter the new multi-line code snippet. Type "END" when done:'));

    const lines = [];
    const rl = readline.createInterface({ input: process.stdin });

    for await (const line of rl) {
        if (line.trim() === 'END') break;
        lines.push(line);
    }

    rl.close();
    await updateSnippet(snippetIndex, lines.join('\n'));
}

// Main prompt for user actions
async function promptUser() {
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'Add Snippet',
                    'List Snippets',
                    'View Snippet',
                    'Update Snippet',
                    'Delete Snippet',
                    'Inject Snippet in File',
                    'Exit',
                ],
            },
        ]);

        switch (action) {
            case 'Add Snippet':
                await addMultiLineSnippet();
                break;
            case 'List Snippets':
                await listSnippets();
                break;
            case 'View Snippet':
                await viewSnippet();
                break;
            case 'Update Snippet':
                await updateMultiLineSnippet();
                break;
            case 'Delete Snippet':
                await deleteSnippet();
                break;
            case 'Inject Snippet in File':
                await appendSnippetToFile();
                break;
            case 'Exit':
                console.log(chalk.yellow('Exiting...'));
                return;
        }
    }
}

// Main function to start the app
async function main() {
    displayTitle();
    await initDB();
    await promptUser();
}

// Run the app
main().catch((err) => console.error(chalk.red(`Error: ${err.message}`)));
