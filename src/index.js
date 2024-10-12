#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Low, JSONFile } from 'lowdb'; // Import Low and JSONFile from lowdb
import inquirer from 'inquirer'; // Import Inquirer for prompts
import chalk from 'chalk'; // Import Chalk for colored output
import readline from 'readline'; // Import the readline module
import figlet from 'figlet'; // Import figlet

// Set up the JSON adapter for lowdb, pointing to the global .snippet-manager directory
const dbDir = path.join(os.homedir(), '.snippet-manager'); // Global storage path
const dbFilePath = path.join(dbDir, 'db.json'); // Full path to the db.json file

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true }); // Create the directory if it doesn't exist
}

const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter);

// Initialize the database
async function initDB() {
    await db.read(); // Read the database file
    db.data ||= { snippets: [] }; // Initialize snippets array if it doesn't exist
    await db.write(); // Write the initial state back to db.json
}

// Display the application title using figlet
function displayTitle() {
    figlet.text('Snippet Manager', { font: 'Slant' }, (err, data) => {
        if (err) {
            console.log(chalk.red('Something went wrong...'));
            console.dir(err);
            return;
        }
        console.log(chalk.blue(data)); // Display the title in blue
    });
}

// Add a new snippet
async function addSnippet(title, code) {
    await db.read(); // Read the current database
    db.data.snippets.push({ title, code, version: 1, createdAt: new Date() }); // Add the new snippet
    await db.write(); // Save changes to the database
    console.log(chalk.green('Snippet added successfully!'));
}

// List all snippets
async function listSnippets() {
    await db.read(); // Read the current database
    if (db.data.snippets.length === 0) {
        console.log(chalk.yellow('No snippets found.'));
        return; // Exit if no snippets are found
    }
    db.data.snippets.forEach((snippet, index) => {
        console.log(chalk.blue(`${index + 1}. ${snippet.title} (Version: ${snippet.version})`));
    });
}

// Update a snippet
async function updateSnippet(index, newCode) {
    await db.read(); // Read the current database
    if (index < 0 || index >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return; // Exit if the index is invalid
    }
    db.data.snippets[index].code = newCode; // Update the code
    db.data.snippets[index].version += 1; // Increment version
    await db.write(); // Save changes to the database
    console.log(chalk.green('Snippet updated successfully!'));
}

// Delete a snippet
async function deleteSnippet() {
    await listSnippets(); // List snippets to choose from

    const { index } = await inquirer.prompt([
        { name: 'index', message: 'Enter snippet index to delete:', type: 'number' },
    ]);

    const snippetIndex = index - 1; // Adjust for 0-based index
    if (snippetIndex < 0 || snippetIndex >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return; // Exit if the index is invalid
    }

    const deletedSnippet = db.data.snippets.splice(snippetIndex, 1); // Remove the snippet
    await db.write(); // Save changes to the database
    console.log(chalk.green(`Snippet "${deletedSnippet[0].title}" deleted successfully!`));
}

// Append snippet to a specified file
async function appendSnippetToFile() {
    await db.read(); // Read the current database
    const { snippetIndex } = await inquirer.prompt([ 
        {
            type: 'list',
            name: 'snippetIndex',
            message: 'Select a snippet to append to a file:',
            choices: db.data.snippets.map((snippet, index) => ({
                name: `${snippet.title} (Version: ${snippet.version})`,
                value: index
            })),
        },
    ]);

    const { filePath } = await inquirer.prompt([
        {
            type: 'input',
            name: 'filePath',
            message: 'Enter the file path where you want to append the snippet (Example: ./controllers/user.js):',
            validate: (input) => {
                if (!input) return 'File path cannot be empty.';
                return true;
            },
        },
    ]);

    const snippetContent = `// Snippet: ${db.data.snippets[snippetIndex].title}\n${db.data.snippets[snippetIndex].code}\n\n`; // Format the snippet
    try {
        fs.appendFileSync(path.resolve(filePath), snippetContent); // Append to the specified file
        console.log(chalk.green(`Snippet appended to ${filePath} successfully!`));
    } catch (error) {
        console.error(chalk.red(`Failed to append to file: ${error.message}`));
    }
}

// Function to add a multi-line snippet
async function addMultiLineSnippet() {
    console.log(chalk.yellow('Enter your multi-line code snippet. Type "END" on a new line when you are done:\n'));

    const lines = [];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    for await (const line of rl) {
        if (line.trim() === 'END') {
            break; // Stop reading lines if user types "END"
        }
        lines.push(line); // Add the line to the array
    }

    rl.close(); // Close the readline interface

    const code = lines.join('\n'); // Join lines into a single string
    const { title } = await inquirer.prompt([
        { name: 'title', message: 'Snippet Title:' },
    ]);

    await addSnippet(title, code); // Add the multi-line snippet
}

// Function to update a multi-line snippet
async function updateMultiLineSnippet() {
    await listSnippets(); // List snippets to choose from

    const { index } = await inquirer.prompt([
        { name: 'index', message: 'Enter snippet index to update:', type: 'number' },
    ]);

    const snippetIndex = index - 1; // Adjust for 0-based index
    if (snippetIndex < 0 || snippetIndex >= db.data.snippets.length) {
        console.log(chalk.red('Invalid snippet index.'));
        return; // Exit if the index is invalid
    }

    console.log(chalk.yellow('Enter the new multi-line code snippet. Type "END" on a new line when you are done:\n'));

    const lines = [];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    for await (const line of rl) {
        if (line.trim() === 'END') {
            break; // Stop reading lines if user types "END"
        }
        lines.push(line); // Add the line to the array
    }

    rl.close(); // Close the readline interface

    const newCode = lines.join('\n'); // Join lines into a single string
    await updateSnippet(snippetIndex, newCode); // Update the selected snippet
}

// Prompt the user for action
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
                    'Update Snippet',
                    'Delete Snippet',
                    'Inject Snippet in File',
                    'Exit'
                ],
            },
        ]);

        switch (action) {
            case 'Add Snippet':
                if (await addMultiLineSnippet()) return; // Exit if snippet added successfully
                break;
            case 'List Snippets':
                await listSnippets(); // Call the function to list snippets
                break;
            case 'Update Snippet':
                if (await updateMultiLineSnippet()) return; // Exit if snippet updated successfully
                break;
            case 'Delete Snippet':
                await deleteSnippet(); // Delete a selected snippet
                break;
            case 'Inject Snippet in File':
                await appendSnippetToFile(); // Append snippet to a specified file
                break;
            case 'Exit':
                console.log(chalk.yellow('Exiting...'));
                console.clear(); // Clear the console
                return; // Exit the loop and the application
        }
    }
}

// Main function to run the tracker
async function main() {
    displayTitle(); // Display the application title
    await initDB(); // Initialize the database
    await promptUser(); // Start prompting the user for actions
}

// Start the application
main().catch(err => {
    console.error(chalk.red('An error occurred:', err));
});
