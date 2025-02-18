class Task {
  status;
  constructor(task) {
    this.id = Date.now();
    this.task = task;
    this.status = "pending";
  }

  markAsDone() {
    this.status = "done";
  }

  markAsPending() {
    this.status = "pending";
  }
}

class TaskList {
  tasks;
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== Number(taskId));
  }
}

class UserAccount {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.taskList = new TaskList();
  }
}

class AccountManager {
  #validUsernameChars;
  #validPasswordChars;
  constructor() {
    this.accounts = [];
    this.#validUsernameChars = [
      ..."abcdefghijklmnopqrstuvwxyz",
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      ..."0123456789",
      "_",
    ];
    this.#validPasswordChars = [
      ..."abcdefghijklmnopqrstuvwxyz",
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ];
    this.message = "";
  }

  addAccount(account) {
    this.accounts.push(account);
  }

  isUsernameValid(username) {
    const accAlreadyInUse = this.accounts.find(
      (account) => account.username === username,
    );

    if (!username.trim()) {
      this.message = "Username cannot be empty";
      return false;
    } else if (!isNaN(username[0])) {
      this.message = "Username cannot start with a number";
      return false;
    } else if (username[0] === "_") {
      this.message = "Username cannot start with '_'";
      return false;
    } else if (
      ![...username].every((char) => this.#validUsernameChars.includes(char))
    ) {
      this.message =
        "Only Latin letters, digits, and the underscore '_' are allowed.";
      return false;
    } else if (accAlreadyInUse) {
      this.message = "Username is already in use";
      return false;
    } else {
      return true;
    }
  }

  isPasswordValid(password) {
    if (password.length < 8) {
      this.message = "Password must be at least 8 characters long";
      return false;
    } else if (password.length > 20) {
      this.message = "Password must be less than 20 characters long";
      return false;
    } else if (!password.trim()) {
      this.message = "Password cannot be empty";
      return false;
    } else {
      return true;
    }
  }
}

class Buttons {
  constructor() {
    this.addBtn = document.querySelector(".add-btn");
    this.okBtn = document.querySelector(".ok-btn");
    this.clearBtn = document.querySelector(".clear-btn");
    this.closeBtn = document.querySelector(".close-icon");

    this.loginFormSignupBtn = document.querySelector(
      ".log-in-form__sign-up-btn",
    );
    this.loginFormLoginBtn = document.querySelector(".log-in-form__log-in-btn");

    this.signupFormSignupBtn = document.querySelector(
      ".sign-up-form__sign-up-btn",
    );
    this.returnBtn = document.querySelector(".return-btn");
  }
}

class Inputs {
  constructor() {
    this.taskInput = document.querySelector(".task-input");
    this.editTaskInput = document.querySelector(".edit-task-input");

    this.loginFormUsernameInput = document.querySelector(
      ".log-in-form__username-input",
    );
    this.loginFormPasswordInput = document.querySelector(
      ".log-in-form__password-input",
    );

    this.signupFormUsernameInput = document.querySelector(
      ".sign-up-form__username-input",
    );
    this.signupFormPasswordInput = document.querySelector(
      ".sign-up-form__password-input",
    );
    this.signupFormConfirmPasswordInput = document.querySelector(
      ".sign-up-form__confirm-password-input",
    );
  }
}

class App {
  constructor() {
    this.taskList = new TaskList();
    this.inputs = new Inputs();
    this.buttons = new Buttons();
    this.accManager = new AccountManager();

    this.taskListContainer = document.querySelector(".task-list-container");
    this.overlay = document.querySelector(".overlay");
    this.editTaskContainer = document.querySelector(".edit-container");

    this.loginFormContainer = document.querySelector(".log-in-form");
    this.signupFormContainer = document.querySelector(".sign-up-form");
    this.errorContainer = document.querySelector(".error-container");
    this.successContainer = document.querySelector(".success-container");

    this.errorMsgText = document.querySelector(".error-text");

    this.messageIsVisible = false;

    this.buttons.signupFormSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const username = this.inputs.signupFormUsernameInput.value;
      const password = this.inputs.signupFormPasswordInput.value;
      const confirmationPassword =
        this.inputs.signupFormConfirmPasswordInput.value;

      if (!this.accManager.isUsernameValid(username) && !this.messageIsVisible)
        this.showMessage();
      else if (
        !this.accManager.isPasswordValid(password) &&
        !this.messageIsVisible
      )
        this.showMessage();
      else if (confirmationPassword !== password) {
        this.accManager.message = "Passwords do not match";
        this.showMessage();
      } else {
        this.accManager.addAccount(new UserAccount(username, password));
        this.showMessage(true);
        this.switchForm();
      }
    });

    this.buttons.loginFormSignupBtn.addEventListener("click", () => {
      this.switchForm();
    });

    this.buttons.returnBtn.addEventListener("click", () => {
      this.switchForm();
    });

    window.addEventListener("keydown", (e) => {
      if (
        this.overlay.classList.contains("active") &&
        this.editTaskContainer.classList.contains("active")
      ) {
        if (e.key === "Escape") {
          this.closeEditModal();
          document.activeElement.blur();
        }
      }
    });

    this.buttons.addBtn.addEventListener("click", () => {
      this.handleAddTask();
    });

    this.buttons.clearBtn.addEventListener("click", () => {
      this.taskList.tasks = this.taskList.tasks.filter(
        (task) => task.status === "pending",
      );
      this.render();
    });

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.closeEditModal();
      }
    });

    this.buttons.closeBtn.addEventListener("click", () => {
      this.closeEditModal();
    });

    this.buttons.okBtn.addEventListener("click", () => {
      const taskId = this.editTaskContainer.dataset.editId;
      this.handleEditTask(taskId);
      this.closeEditModal();
      this.render();
    });

    this.inputs.taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleAddTask();
      }
    });

    this.inputs.editTaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const taskId = this.editTaskContainer.dataset.editId;
        this.handleEditTask(taskId);
        this.closeEditModal();
        this.render();
      }
    });

    this.taskListContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (!target.classList.contains("buttons-container-btn")) return;

      const taskContainer = target.closest(".task-container");
      const taskId = taskContainer.dataset.taskId;
      const task = this.taskList.tasks.find((t) => t.id === Number(taskId));

      if (target.classList.contains("toggle-btn")) {
        this.toggleTask(task);
      } else if (target.classList.contains("delete-btn")) {
        this.handleDeleteTask(taskId);
      } else if (target.classList.contains("edit-btn")) {
        this.openEditModal();
        this.inputs.editTaskInput.value = task.task;
        this.editTaskContainer.dataset.editId = taskId;
      }
    });

    this.render();
  }

  handleAddTask() {
    const taskInputValue = this.inputs.taskInput.value;
    if (!taskInputValue.trim()) return;

    const text =
      taskInputValue.trim()[0].toUpperCase() + taskInputValue.slice(1);

    this.taskList.addTask(new Task(text));
    this.inputs.taskInput.value = "";
    this.render();
  }

  toggleTask(task) {
    if (task.status === "pending") {
      task.markAsDone();
    } else {
      task.markAsPending();
    }

    this.render();
  }

  handleDeleteTask(taskId) {
    this.taskList.deleteTask(taskId);

    this.render();
  }

  handleEditTask(taskId) {
    const editTaskInputValue = this.inputs.editTaskInput.value;
    if (!editTaskInputValue.trim()) return;

    const editedText =
      editTaskInputValue.trim()[0].toUpperCase() + editTaskInputValue.slice(1);

    const task = this.taskList.tasks.find((t) => t.id === Number(taskId));

    task.task = editedText;
  }

  closeEditModal() {
    this.overlay.classList.remove("active");
    this.editTaskContainer.classList.remove("active");
    this.buttons.closeBtn.classList.remove("active");
  }

  openEditModal() {
    this.overlay.classList.add("active");
    this.editTaskContainer.classList.add("active");
    this.buttons.closeBtn.classList.add("active");
  }

  switchForm() {
    const loginDisplay = getComputedStyle(this.loginFormContainer).display;

    if (loginDisplay === "none") {
      this.loginFormContainer.style.display = "flex";
      this.signupFormContainer.style.display = "none";
    } else {
      this.loginFormContainer.style.display = "none";
      this.signupFormContainer.style.display = "flex";
    }
  }

  showMessage(isSuccess = false) {
    if (!isSuccess) {
      this.messageIsVisible = true;

      this.errorMsgText.textContent = this.accManager.message;
      this.errorContainer.style.display = "flex";

      setTimeout(() => {
        this.errorContainer.style.transform = "translateY(-50%)";
      }, 10);

      setTimeout(() => this.hideMessage(), 3000);
    } else {
      this.messageIsVisible = true;
      this.successContainer.style.display = "flex";

      setTimeout(() => {
        this.successContainer.style.transform = "translateY(-50%)";
      }, 10);

      setTimeout(() => this.hideMessage(true), 3000);
    }
  }

  hideMessage(isSuccess = false) {
    if (!isSuccess) {
      this.errorContainer.style.transform = "translateY(-200%)";

      setTimeout(() => {
        this.errorContainer.style.display = "none";
        this.messageIsVisible = false;
      }, 500);
    } else {
      this.successContainer.style.transform = "translateY(-200%)";

      setTimeout(() => {
        this.successContainer.style.display = "none";
        this.messageIsVisible = false;
      }, 500);
    }
  }

  render() {
    this.taskListContainer.innerHTML = "";

    if (this.taskList.tasks.length === 0) return;

    this.taskList.tasks.forEach((task) => {
      // const HTML = `
      //             <div class="task-container ${task.status === "done" ? "completed" : ""}" data-task-id="${i}">
      //               <p class="task-paragraph">${task.task}</p>
      //               <div class="buttons-container">
      //                 <button class="buttons-container-btn toggle-btn">Toggle</button>
      //                 <button class="buttons-container-btn edit-btn">Edit</button>
      //                 <button class="buttons-container-btn delete-btn">Delete</button>
      //               </div>
      //             </div>`;
      //
      // this.taskListContainer.insertAdjacentHTML("afterbegin", HTML);

      const taskDiv = document.createElement("div");
      taskDiv.classList.add("task-container");
      if (task.status === "done") taskDiv.classList.add("completed");
      taskDiv.dataset.taskId = task.id;

      const taskParagraph = document.createElement("p");
      taskParagraph.classList.add("task-paragraph");

      taskParagraph.textContent = task.task;

      taskParagraph.title = task.task;

      taskDiv.appendChild(taskParagraph);

      const btnDiv = document.createElement("div");
      btnDiv.classList.add("buttons-container");

      const btnTexts = ["Toggle", "Edit", "Delete"];

      btnTexts.forEach((text) => {
        const btn = document.createElement("button");
        btn.textContent = text;

        btn.classList.add("buttons-container-btn");

        if (btn.textContent === "Toggle") btn.classList.add("toggle-btn");
        else if (btn.textContent === "Edit") btn.classList.add("edit-btn");
        else if (btn.textContent === "Delete") btn.classList.add("delete-btn");

        btnDiv.appendChild(btn);
      });

      taskDiv.appendChild(btnDiv);

      this.taskListContainer.appendChild(taskDiv);
    });
  }
}

new App();
