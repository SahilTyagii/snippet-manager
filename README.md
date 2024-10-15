# Snippet Manager

Snippet Manager is a simple **command-line tool** for managing code snippets, similar to a **mini Git** for your snippets. You can easily add, list, update, delete, and inject snippets into files. This tool helps you keep your code snippets organized and accessible whenever you need them.

![Snippet Manager](https://img.shields.io/badge/Snippet--Manager-Organize%20your%20code-blueviolet?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)
![npm](https://img.shields.io/npm/v/snippet-manager?color=green&label=version&logo=npm&style=for-the-badge)
![npm](https://img.shields.io/npm/dt/snippet-manager?label=Downloads&style=for-the-badge)


## 📦 **Features**

- **Add multi-line snippets** with version control.
- **View snippets** with detailed metadata (version, creation date, etc.).
- **Update snippets** with automatic version bumping.
- **Delete snippets** from the database.
- **Inject snippets into files** via:
  - Manual file path input.
  - File-tree selection using interactive prompts.
- **JSON database management**—all snippets stored locally for easy access.

## 📥 **Installation**

Install globally using npm:

```bash
npm install -g snippet-manager
```

## 🛠 **Usage**

Once installed, you can start using Snippet Manager by running:

```bash
snip
```
or:
```bash
snippet-manager
```

## Screenshots
![image](https://github.com/user-attachments/assets/7c7b95ed-c766-4a1e-af0e-5aad707c4a2f)
![image](https://github.com/user-attachments/assets/6332c7c5-f957-4775-8fe5-41d303443b59)
![image](https://github.com/user-attachments/assets/a79808c0-8fb3-409b-9892-f4bfb70cc066)


### 🔧 **Available Commands:**

1. **Add Snippet**  
   - Enter a title and a multi-line code snippet. Use `END` on a new line to complete input.

2. **List Snippets**  
   - Display all saved snippets with version numbers.

3. **View Snippet**  
   - Select a snippet by index to view its details (title, version, code).

4. **Update Snippet**  
   - Pick a snippet to edit. Enter the updated code and use `END` to finish input. Version number is bumped automatically.

5. **Delete Snippet**  
   - Choose a snippet by its index to delete.

6. **Inject Snippet in File**  
   - Select a snippet and inject it directly into any file using:
     - **Manual Path Entry**: Enter the file path manually.
     - **File-Tree Selection**: Use arrow keys to browse files interactively.

7. **Exit**  
   - Quit the tool safely.

## 🖼 **Example Usage**

**Adding a Multi-line Snippet:**

```bash
Enter your multi-line code snippet. Type "END" on a new line when you are done:

> console.log('Hello, World!');
> console.log('Snippet Manager is awesome!');
> END

? Snippet Title: Hello World Example

Snippet added successfully!
```

**Updating a Snippet:**

```bash
? Enter snippet index to update: 1

Enter the new multi-line code snippet. Type "END" on a new line when you are done:

> console.log('Updated Hello World');
> END

Snippet updated successfully!
```


## 🗂 **Where Your Snippets are Stored**

Snippets are saved in a local JSON database located at:

```bash
~/.snippet-manager/db.json
```


## 📋 **Requirements**

- **Node.js** version 12 or higher
- **npm** installed


## 🤝 **Contributing**

Feel free to open issues or submit pull requests for improvements. All contributions are welcome!


## 📝 **License**

This project is licensed under the [MIT License](LICENSE).


🌟 If you like this project, give it a star on GitHub!
