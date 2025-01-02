<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/assets/images/banner_1_white.png">
  <source media="(prefers-color-scheme: light)" srcset="/assets/images/banner_1_black.png">
  <img alt="Banner" src="/assets/images/banner_1_white.png">
</picture>

---

## ⚠️ THIS PROJECT IS UNDER HEAVY DEVELOPMENT. The project is not  yet ready for public use, as breaking updates and refactoring are quite a common happening at this stage.
### This README page is also under development.

---

The **Demido Shell** serves as the core component of the **Demido** project, providing a unified and efficient interface
for managing and interacting with Demido services. It is designed to streamline the process of running, monitoring, and
controlling various platform bots from a single, cohesive environment.

This shell allows to easily initiate and manage services, ensuring seamless communication and operation between
different services and platform bots. Its intuitive architecture simplifies complex tasks, making it accessible for
developers and system administrators alike.

The Demido Shell is the backbone of the Demido ecosystem, ensuring that all components work together in harmony,
empowering us to focus on our development goals without worrying about underlying complexities.

## Installation and runtime

### Clone the repository
```shell
git clone https://github.com/Demido-Ltd/shell.git
```

### Install packages
> We highly recommend and support the use of [bun](https://bun.sh) for optimal performance. While you can still install
packages using `npm install`, building and running the shell with tools other than bun may result in unforeseen issues.
Please note that we do not offer support for problems arising from using alternative tools.
```shell
bun install
```

### Start the shell
```shell
bun run start
```

###### It is also possible to start the shell by running `bun index.ts`.
