# Mongo Express Typescript

This project is a MongoDB and Express.js application implemented in TypeScript. It uses Git for version control and Yarn as the package manager. This setup is designed for modern web application development with a focus on type safety and efficient data handling with MongoDB, a popular NoSQL database.

## Setup

### Machine Requrements
Ensure running machine has Mongo Database installed.

### Git
To set up your project with version control using Git:

1. Create a new directory for your project:
```bash
mkdir <project-dirname>
```
2. Change into your project directory:
```bash
cd <project-dirname>
```
3. Initialize a new Git repository:
```bash
git init
```
4. Create an empty Git repository on a platform like GitHub or GitLab
5. Add the remote repository URL to your local repository: 
```bash
git remote add origin <repository clone url>
```

### Yarn - Package Manager
To set up Yarn as your package manager:

- Download and install Yarn from [Yarn Installation Guide](https://classic.yarnpkg.com/en/docs/install)
- Ensure you are in your project directory:
```bash
cd <project-dirpath>
```
- Initialize your project with Yarn:
```bash
yarn init -y
```

### MongoDB Installation Instructions
Update your package database
```bash
sudo apt-get update
```

Install MongoDB
```bash
sudo apt-get install -y mongodb
```

## Usage

### Install Yarn Dependencies
To install all the project dependencies defined in your `package.json`, run:
```bash
yarn install
```

#### Activate MongoDB
Start MongoDB service
```bash
sudo systemctl start mongod
```

Optionally, run MongoDB on a specific port (default is 27017)
```bash
mongod --port 27017
```

#### Run the Application
- Compile TypeScript to JavaScript: `yarn build`
- Start your Express application using Yarn: `yarn start`

### Configure the Application
To configure the application either create a `.env` file at root directory with the following environment variables:
```bash
DB_NAME=sample_training
PORT=3000
# Either dev or release
ENV=release
CONNECTION_STRING=mongodb://localhost:27017
```

Or define following as environment variables: `DB_NAME`, `PORT`, `ENV`, `CONNECTION_STRING`.

## Test
To run TypeScript tests for your application, use the following command:
```bash
yarn test
```

## Suggested Development Tools
### Postman
Postman is a popular API client that makes it easy to create, share, test, and document APIs. It offers a straightforward user interface for sending HTTP requests and viewing responses. 

- Download and installation instructions: [Download Postman](https://www.postman.com/downloads/)

### Mongo Compass
Mongo Compass is the official GUI for MongoDB. It allows you to visually explore your data, run queries, and interact with your MongoDB database.

- Download and installation instructions: [Download MongoDB Compass](https://www.mongodb.com/try/download/compass)

## References
- For a comprehensive guide on MongoDB Data Model Design, see the "Data Model Design for MongoDB.pdf" file located in the root directory of this project. Might be outdated as it was public at 2015.