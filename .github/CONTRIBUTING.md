# Contributing to B78X Heavy
<img src="https://media.discordapp.net/attachments/927293618295824415/966187066058764338/hdgithub_banner.png">

# What can be worked on/altered? 

Before you begin, it may be helpful to understand what you want to work on, and whether it is possible due to the encryption of various 787 source code files. 

> Keep in mind this list is not set in stone, and Asobo may unlock more of the files to allow 3rd party changes. 

### Unable to alter due to encryption
* Forking into a separate aircraft from the default
* Alterations to the 3D model 
* Lighting
* EFB Support 
* Flight Model and Behavior 
* System Connections (e.g. Hydraulic systems affect on 3d model animations and flight behavior)
* Unable to animate currently non-animated switches/knobs/buttons 

### Possible projects:
* All display frontends (Except EFB)
* Autopilot logic (With some exceptions such as using the bank angle variable)
* Custom panel textures (not including text) 
* Custom Sounds (Engines, Cockpit, Switches, etc.)


# Setup
***
Thank you for your interest in contributing to the B78X Heavy project. To get started, you'll need to download
and install the following: 

1. An IDE of your choice
> Recommended IDEs: [Visual Studio Code](https://code.visualstudio.com/), [IntellJ IDEA Community Version](https://www.jetbrains.com/idea/download/#section=windows)

2. After installing an IDE you will need to install [node.js](https://nodejs.org/en/) and [git](https://git-scm.com/downloads)

3. Open the Command Prompt (Terminal for Mac users) and run the following two separately: 
```npm install -g npm``` , ```npm install -g gulp-cli```

>Q: "What is Gulp and why do I need it?"<br>
>A: The B78XH isn't one Javascript application but rather a collection of applications working in sync.<br>
>Normally you would need to run the following to build the aircraft in the simulator: 

* `npm run rollup HDSDK`
* `npm run rollup HDLogger`
* `npm run rollup HDFMC`
* `npm run build`

>Gulp allows us to bundle these tasks into one command to make this task less tedious:

* `gulp buildB78XH`

4. Open the B78X Heavy [repository](https://github.com/Heavy-Division/B78XH.git) and create a fork (upper right corner)


5. Open the terminal in your IDE and type the following:<br>
 ```git clone <your repo URL>```


6. In the terminal, create a new branch based off the ***main*** with a clear name of what you are changing. (e.g. adding sound files for engines):<br>
```git branch main engine-custom-sounds```


7. Run the following in the terminal:<br>
```npm i```

>Installs all of the required packages to run the mod. 

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
* Submit a pull request (PR) to the master branch.
* The PR title should describe the change that has been made.
* Follow the PR template and write as much detail as necessary for your changes and include documents/screenshots if needed.
* Be prepared to answer any questions about your PR when it is reviewed for acceptance.

Please keep your changes in a single PR as small as possible (relating to one issue) as this makes it easier to review and accept. Large PRs with a small error will prevent the entire PR from being accepted.

Ensure that you include a CHANGELOG with your PR.
