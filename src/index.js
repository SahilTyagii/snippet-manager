#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Low, JSONFile } from 'lowdb';
import inquirer from 'inquirer';
import chalk from 'chalk';
import readline from 'readline';
import figlet from 'figlet';

const dbDir = path.join(os.homedir(), '.snippet-manager');
const dbFilePath = path.join(dbDir, 'db.json');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter);

async function initDB() {
    await db.read();
    db.data ||= { snippets: [] };
    await db.write();
}

function displayTitle() {
    figlet.text('Snippet Manager', { font: 'Slant' }, (err, data) => {
        if (err) {
            console.log(chalk.red('Something went wrong...'));
            console.dir(err);
            return;
        }
        console.log(chalk.blue(data));
    });
}

async function addSnippet(title, code) {
    await db.read();
    db.data.snippets.push({ title, code, version: 1, createdAt: new Date() });
    await db.write();
    console.log(chalk.green('Snippet added successfully!'));
}

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

async function appendSnippetToFile() {
    await db.read();
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

    let filePath = '';
    while (!filePath) {
        const { inputFilePath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'inputFilePath',
                message: 'Enter the file path where you want to append the snippet (Example: ./controllers/user.js):',
                validate: (input) => {
                    if (!input) return 'File path cannot be empty.';
                    return true;
                },
            },
        ]);
        filePath = inputFilePath;
    }

    const snippetContent = `// Snippet: ${db.data.snippets[snippetIndex].title}\n${db.data.snippets[snippetIndex].code}\n\n`;
    try {
        fs.appendFileSync(path.resolve(filePath), snippetContent);
        console.log(chalk.green(`Snippet appended to ${filePath} successfully!`));
    } catch (error) {
        console.error(chalk.red(`Failed to append to file: ${error.message}`));
    }
}


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
            break;
        }
        lines.push(line);
    }

    rl.close();

    const code = lines.join('\n');
    const { title } = await inquirer.prompt([
        { name: 'title', message: 'Snippet Title:' },
    ]);

    await addSnippet(title, code);
}

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

    console.log(chalk.yellow('Enter the new multi-line code snippet. Type "END" on a new line when you are done:\n'));

    const lines = [];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    for await (const line of rl) {
        if (line.trim() === 'END') {
            break;
        }
        lines.push(line);
    }

    rl.close();

    const newCode = lines.join('\n');
    await updateSnippet(snippetIndex, newCode);
}

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
                if (await addMultiLineSnippet()) return;
                break;
            case 'List Snippets':
                await listSnippets();
                break;
            case 'Update Snippet':
                if (await updateMultiLineSnippet()) return;
                break;
            case 'Delete Snippet':
                await deleteSnippet();
                break;
            case 'Inject Snippet in File':
                await appendSnippetToFile();
                break;
            case 'Exit':
                console.log(chalk.yellow('Exiting...'));
                console.clear();
                return;
        }
    }
}

async function main() {
    displayTitle();
    await initDB();
    await promptUser();
}

main().catch(err => {
    console.error(chalk.red('An error occurred:', err));
});
