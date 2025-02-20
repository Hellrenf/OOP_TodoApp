class Task {
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
  taskList;
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
  currentAccount;
  constructor() {
    this.taskList = new TaskList();
    this.inputs = new Inputs();
    this.buttons = new Buttons();
    this.accManager = new AccountManager();

    this.taskListContainer = document.querySelector(".task-list-container");
    this.todoListContainer = document.querySelector(".todo-list-container");
    this.overlay = document.querySelector(".overlay");
    this.editTaskContainer = document.querySelector(".edit-container");

    this.loginFormContainer = document.querySelector(".log-in-form");
    this.signupFormContainer = document.querySelector(".sign-up-form");
    this.errorContainer = document.querySelector(".error-container");
    this.successContainer = document.querySelector(".success-container");

    this.errorMsgText = document.querySelector(".error-text");

    this.messageIsVisible = false;

    this.buttons.loginFormLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const username = this.inputs.loginFormUsernameInput.value;
      const password = this.inputs.loginFormPasswordInput.value;

      if (!username.trim()) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Username cannot be empty";
          this.showMessage();
        }
        return;
      }

      if (!password.trim()) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Password cannot be empty";
          this.showMessage();
        }
        return;
      }

      const acc = this.accManager.accounts.find(
        (acc) => acc.username === username,
      );

      if (!acc) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Wrong login or password";
          this.showMessage();
        }
        return;
      }

      if (password !== acc.password) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Wrong login or password";
          this.showMessage();
        }
        return;
      }

      this.overlay.classList.remove("active");
      this.todoListContainer.style.display = "flex";

      this.loginFormContainer.style.display = "none";

      this.currentAccount = acc;
    });

    // this.loginFormContainer.addEventListener("click", (e) => {
    //   const target = e.target;
    //   if (!target.classList.contains("eye-btn")) return;
    //
    //   const eyeBtn = target.closest(".eye-btn");
    //   const passwordInput = target
    //     .closest(".password-input-container")
    //     .querySelector(".password-input");
    //
    //   if (eyeBtn.classList.contains("closed")) {
    //     passwordInput.type = "password";
    //     this.toggleEyeBtn(eyeBtn);
    //   } else if (!eyeBtn.classList.contains("closed")) {
    //     passwordInput.type = "text";
    //     this.toggleEyeBtn(eyeBtn);
    //   }
    // });

    this.buttons.signupFormSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const username = this.inputs.signupFormUsernameInput.value;
      const password = this.inputs.signupFormPasswordInput.value;
      const confirmationPassword =
        this.inputs.signupFormConfirmPasswordInput.value;

      if (!this.accManager.isUsernameValid(username)) {
        if (!this.messageIsVisible) {
          this.showMessage();
        }
        return;
      }

      if (!this.accManager.isPasswordValid(password)) {
        if (!this.messageIsVisible) {
          this.showMessage();
        }
        return;
      }

      if (confirmationPassword !== password) {
        this.accManager.message = "Passwords do not match";
        this.showMessage();
        return;
      }

      this.accManager.addAccount(new UserAccount(username, password));
      this.showMessage(true);
      this.switchForm();
      this.inputs.signupFormUsernameInput.value = "";
      this.inputs.signupFormPasswordInput.value = "";
      this.inputs.signupFormConfirmPasswordInput.value = "";
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
        if (this.editTaskContainer.classList.contains("active"))
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
    this.syncTaskList(this.currentAccount);
    this.render();
  }

  toggleTask(task) {
    if (task.status === "pending") {
      task.markAsDone();
    } else {
      task.markAsPending();
    }
    this.syncTaskList(this.currentAccount);
    this.render();
  }

  handleDeleteTask(taskId) {
    this.taskList.deleteTask(taskId);
    this.syncTaskList(this.currentAccount);
    this.render();
  }

  handleEditTask(taskId) {
    const editTaskInputValue = this.inputs.editTaskInput.value;
    if (!editTaskInputValue.trim()) return;

    const editedText =
      editTaskInputValue.trim()[0].toUpperCase() + editTaskInputValue.slice(1);

    const task = this.taskList.tasks.find((t) => t.id === Number(taskId));

    task.task = editedText;
    this.syncTaskList(this.currentAccount);
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

  //   toggleEyeBtn(eyeBtn) {
  //     if (!eyeBtn.classList.contains("closed")) {
  //       eyeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-btn closed">
  //   <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  // </svg>
  // `;
  //     } else {
  //       eyeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-btn">
  //               <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  //               <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  //             </svg>`;
  //     }
  //   }

  syncTaskList(acc) {
    acc.taskList = this.taskList;
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
