# Contributing to B78X Heavy

## What can be worked on/altered? 

Thank you for your interest in contributing to the B78X Heavy project. Before you begin, it is necessary to understand what you want to work on, and whether it is possible due to the encryption of various 787-10 source code files. 

> Keep in mind this list is not set in stone, and Asobo may unlock more of the files to allow 3rd party changes. 

## Setup

To get started, you'll need to download
and install the following: 

1. An IDE of your choice
> Recommended IDEs: [Visual Studio Code](https://code.visualstudio.com/), [IntellJ IDEA Community Version](https://www.jetbrains.com/idea/download/#section=windows)

2. After installing an IDE you will need to install [node.js](https://nodejs.org/en/) and [git](https://git-scm.com/downloads)

3. Open the B78XH [repository](https://github.com/Heavy-Division/B78XH.git) and create a fork (upper right corner)

 > It is highly recommended to use git bash as your default terminal

4. Open the terminal in your IDE and type the following:<br>
 `git clone <your repo URL>`


5. In the terminal, create a new branch based off the ***main*** with a clear name of what you are changing. (e.g. adding sound files for engines):<br>
`git branch engine-custom-sounds main`


6. Run the following in the terminal:<br>
 - `npm i`
 - `cd src`
 - `npm i`
 - `cd ..` 

7. Make your changes in the 'src' files or base aircraft package, and run `npm build:b78xh`
# Pull Requests 
We welcome pull requests with fixes and improvements to the project.

If you wish to add a new feature, or you spot a bug that you wish to fix, please open an issue for it first on the B78XH issue tracker.

The work-flow for submitting a new pull request is designed to be simple, but also to ensure consistency from all contributors:

* Fork the project into your personal space on GitHub.com.
* Create a new branch (with a clear name of what is being changed).
* Add changes to CHANGELOG.md with credits to yourself.
* Commit your changes. 
* When writing commit messages make sure they are clear about what has been changed.
* Push the commit(s) to your fork.
* Submit a pull request (PR) to the main branch.
* The PR title should describe the change that has been made.
* Follow the PR template and write as much detail as necessary for your changes and include documents/screenshots if needed.
* Be prepared to answer any questions about your PR when it is reviewed for acceptance.

Please keep your changes in a single PR as small as possible (relating to one issue) as this makes it easier to review and accept. Large PRs with a small error will prevent the entire PR from being accepted.

Ensure that you include a CHANGELOG with your PR.
