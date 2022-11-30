# Contributing to B78X Heavy



<div style="color:red; font-size: medium; font-weight: bold">
    **This guide is deprecated**
</div>

**The systems and display implementations have been moved to our [WASM repo](https://github.com/Heavy-Division/B78XH-wasm).**

**If you would like to contribute to the displays, equipment, or systems logic, please see the contributing guide in the
WASM repo.**

[B78XH-wasm Contributing](https://github.com/Heavy-Division/B78XH-wasm/blob/master/.github/CONTRIBUTING.md)

---------------------------------------

Thank you for your interest in contributing to the B78X Heavy project. Before you begin, it is necessary to understand what you want to work on, and whether it is possible due to the encryption of various 787-10 source code files. 

> Keep in mind this list is not set in stone, and Asobo may unlock more of the files to allow 3rd party changes. 
## What can be worked on/altered?
### Possible projects/changes ✅
* All display frontends (Except EFB)
* Autopilot logic
* Custom Sounds (Engines, Cockpit, Switches, etc.)
* Flight Model and Behavior
* Lighting
* System Connections (e.g. Hydraulic systems affect on 3d model animations and flight behavior)


### Unable to alter/add due to encryption ❌
* Forking into a separate aircraft from the default
* Alterations to the 3D model (e.g. EFB)
* Cockpit Textures/Text

## Setup

To get started, you'll need to download
and install the following: 

1. An IDE of your choice
> Recommended IDEs: [Visual Studio Code](https://code.visualstudio.com/), [IntellJ IDEA Community Version](https://www.jetbrains.com/idea/download/#section=windows)

2. After installing an IDE you will need to install [node.js](https://nodejs.org/en/) and [git](https://git-scm.com/downloads)

3. Open the Command Prompt (Terminal for Mac users) and run the following two separately: 
`npm install -g npm`, `npm install -g gulp-cli`

>Q: "What is Gulp and why do I need it?"<br><br>
>A: The B78XH isn't one Javascript application but rather a collection of applications working in sync.<br>
>Normally you would need to run the following to build the aircraft in the simulator: 

* `npm run rollup HDSDK`
* `npm run rollup HDLogger`
* `npm run rollup HDFMC`
* `npm run build`

>Gulp allows us to bundle these tasks into one command to make this task less tedious:

* `gulp buildB78XH`

4. Open the B78XH [repository](https://github.com/Heavy-Division/B78XH.git) and create a fork (upper right corner)


5. Open the terminal in your IDE and type the following:<br>
 `git clone <your repo URL>`


6. In the terminal, create a new branch based off the ***main*** with a clear name of what you are changing. (e.g. adding sound files for engines):<br>
`git branch engine-custom-sounds main`


7. Run the following in the terminal:<br>
`npm i`
>Installs all of the required packages to run the mod

8. If working on displays such as the FMC you will need to download the [msfs web developer kit](https://github.com/dga711/msfs-webui-devkit) and extract the zipfile to your community folder.<br><br>

9. Once you've installed the web dev kit, download the [Core html_ui file](https://cdn.discordapp.com/attachments/915345919690555412/966878170479476806/Core.zip) and extract it to the following directory:

B78XH/html_ui/Pages/VCockpit

11. Remove/delete the current version of the B78XH in your community folder if you haven't already and use a [symbolic link program](https://schinagl.priv.at/nt/hardlinkshellext/HardLinkShellExt_X64.exe) to link the B78XH folder you are developing to your community folder. In the IDE terminal, run `gulp buildDEV`. Once the manifest is created, enter the src directory by typing `cd src` then build the aircraft by typing `gulp monitor`. Once you're done you can open the sim, and you're all set to begin developing the 787-10 Heavy!

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
