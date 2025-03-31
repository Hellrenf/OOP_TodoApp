class Task {
  constructor(task, id = Date.now(), status = "pending") {
    this.id = id;
    this.task = task;
    this.status = status;
  }
}

class TaskReducer {
  reduce(state, action) {
    switch (action.type) {
      case "ADD_TASK":
        return {
          ...state,
          tasks: [...state.tasks, action.payload],
        };
      case "DELETE_TASK":
        return {
          ...state,
          tasks: state.tasks.filter(
            (task) => task.id !== Number(action.payload),
          ),
        };
      case "TOGGLE_TASK_STATUS":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === Number(action.payload)
              ? task.status === "pending"
                ? { ...task, status: "done" }
                : { ...task, status: "pending" }
              : task,
          ),
        };
      case "EDIT_TASK":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === Number(action.payload.id)
              ? { ...task, task: action.payload.text }
              : task,
          ),
        };
      case "CLEAR_COMPLETED":
        return {
          ...state,
          tasks: state.tasks.filter((task) => task.status === "pending"),
        };
      default:
        return state;
    }
  }
}

class Store {
  state;
  reducer;
  subscribers;

  constructor(initialState, reducer) {
    this.state = initialState;
    this.reducer = reducer;
    this.subscribers = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    this.state = this.reducer.reduce(this.state, action);
    this.notifySubscribers();
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  notifySubscribers() {
    this.subscribers.forEach((subscriber) => subscriber.render());
  }
}

class TaskList {
  store;

  constructor(store) {
    this.store = store;
  }

  addTask(task) {
    this.store.dispatch({ type: "ADD_TASK", payload: task });
  }

  deleteTask(taskId) {
    this.store.dispatch({ type: "DELETE_TASK", payload: taskId });
  }

  toggleTaskStatus(taskId) {
    this.store.dispatch({ type: "TOGGLE_TASK_STATUS", payload: taskId });
  }

  editTask(taskId, text) {
    this.store.dispatch({ type: "EDIT_TASK", payload: { id: taskId, text } });
  }

  clearCompleted() {
    this.store.dispatch({ type: "CLEAR_COMPLETED" });
  }

  getTasks() {
    return this.store.getState().tasks;
  }
}

class UserAccount {
  taskList;
  store;

  constructor(username, password, initialTasks = []) {
    this.username = username;
    this.password = password;
    this.store = new Store({ tasks: initialTasks }, new TaskReducer());
    this.taskList = new TaskList(this.store);
  }

  getStore() {
    return this.store;
  }
}

class AccountManager {
  #regexUsername;
  #regexPassword;
  constructor() {
    this.accounts = this.loadAccounts();
    this.#regexUsername = /^(?![0-9_])[a-zA-Z0-9_]{3,20}$/;
    this.#regexPassword = /^[A-Za-z0-9@$!%*?&]{8,20}$/g;
    this.message = "";
  }

  addAccount(account) {
    this.accounts.push(account);
    this.saveAccounts();
  }

  saveAccounts() {
    const accountsToSave = this.accounts.map((account) => ({
      username: account.username,
      password: account.password,
      tasks: account.taskList.getTasks(),
    }));
    localStorage.setItem("accounts", JSON.stringify(accountsToSave));
  }

  loadAccounts() {
    const storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    return storedAccounts.map((acc) => {
      const initialTasks = (acc.tasks || []).map(
        (task) => new Task(task.task, task.id, task.status),
      );
      return new UserAccount(acc.username, acc.password, initialTasks);
    });
  }

  getAccount(username) {
    return this.accounts.find((account) => account.username === username);
  }

  isUsernameValid(username) {
    const accAlreadyInUse = this.getAccount(username);
    if (accAlreadyInUse) {
      this.message = "Username is already in use.";
      return false;
    }
    if (!username.trim()) {
      this.message = "Username cannot be empty.";
      return false;
    }
    if (!this.#regexUsername.test(username)) {
      this.message =
        "Username must be 3-20 characters long, start with a letter, and contain only Latin letters, digits, and '_'.";
      return false;
    }
    return true;
  }

  isPasswordValid(password) {
    if (!password.trim()) {
      this.message = "Password cannot be empty.";
      return false;
    }
    if (!this.#regexPassword.test(password)) {
      this.message =
        "Password must be 8-20 characters long and contain only allowed characters.";
      return false;
    }
    return true;
  }
}

class Button {
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

class Input {
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
    this.input = new Input();
    this.button = new Button();
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

    this.button.loginFormLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const username = this.input.loginFormUsernameInput.value;
      const password = this.input.loginFormPasswordInput.value;

      if (!username.trim()) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Username cannot be empty.";
          this.showMessage();
        }
        return;
      }

      if (!password.trim()) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Password cannot be empty.";
          this.showMessage();
        }
        return;
      }

      const acc = this.accManager.getAccount(username);

      if (!acc || password !== acc.password) {
        if (!this.messageIsVisible) {
          this.accManager.message = "Wrong login or password.";
          this.showMessage();
        }
        return;
      }

      this.overlay.classList.remove("active");
      this.todoListContainer.style.display = "flex";

      this.loginFormContainer.style.display = "none";

      this.currentAccount = acc;
      this.currentAccount.getStore().subscribe(this);
      this.render();
    });

    this.loginFormContainer.addEventListener("click", (e) => {
      this.togglePasswordVisibility(e);
    });

    this.signupFormContainer.addEventListener("click", (e) => {
      this.togglePasswordVisibility(e, false);
    });

    this.button.signupFormSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const username = this.input.signupFormUsernameInput.value;
      const password = this.input.signupFormPasswordInput.value;
      const confirmationPassword =
        this.input.signupFormConfirmPasswordInput.value;

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
      this.toggleForm();
      this.input.signupFormUsernameInput.value = "";
      this.input.signupFormPasswordInput.value = "";
      this.input.signupFormConfirmPasswordInput.value = "";
    });

    this.button.loginFormSignupBtn.addEventListener("click", () => {
      this.toggleForm();
    });

    this.button.returnBtn.addEventListener("click", () => {
      this.toggleForm();
    });

    window.addEventListener("keydown", (e) => {
      if (
        this.overlay.classList.contains("active") &&
        this.editTaskContainer.classList.contains("active")
      ) {
        if (e.key === "Escape") {
          this.toggleEditModal();
          document.activeElement.blur();
        }
      }
    });

    this.button.addBtn.addEventListener("click", () => {
      this.handleAddTask();
    });

    this.button.clearBtn.addEventListener("click", () => {
      this.currentAccount.taskList.clearCompleted();
      this.accManager.saveAccounts();
      this.render();
    });

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        if (this.editTaskContainer.classList.contains("active"))
          this.toggleEditModal();
      }
    });

    this.button.closeBtn.addEventListener("click", () => {
      this.toggleEditModal();
    });

    this.button.okBtn.addEventListener("click", () => {
      const taskId = this.editTaskContainer.dataset.editId;
      this.handleEditTask(taskId);
      this.closeEditModal();
      this.render();
    });

    this.input.taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleAddTask();
      }
    });

    this.input.editTaskInput.addEventListener("keydown", (e) => {
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

      if (target.classList.contains("toggle-btn")) {
        this.currentAccount.taskList.toggleTaskStatus(taskId);
      } else if (target.classList.contains("delete-btn")) {
        this.handleDeleteTask(taskId);
      } else if (target.classList.contains("edit-btn")) {
        this.toggleEditModal();
        const task = this.currentAccount.taskList
          .getTasks()
          .find((t) => t.id === Number(taskId));
        this.input.editTaskInput.value = task.task;
        this.editTaskContainer.dataset.editId = taskId;
      }
      this.accManager.saveAccounts();
    });

    this.render();
  }

  handleAddTask() {
    const taskInputValue = this.input.taskInput.value;
    if (!taskInputValue.trim()) return;

    const text =
      taskInputValue.trim()[0].toUpperCase() + taskInputValue.slice(1);

    this.currentAccount.taskList.addTask(new Task(text));
    this.input.taskInput.value = "";
    this.accManager.saveAccounts();
    this.render();
  }

  handleDeleteTask(taskId) {
    this.currentAccount.taskList.deleteTask(taskId);
    this.accManager.saveAccounts();
    this.render();
  }

  handleEditTask(taskId) {
    const editTaskInputValue = this.input.editTaskInput.value;
    if (!editTaskInputValue.trim()) return;

    const editedText =
      editTaskInputValue.trim()[0].toUpperCase() + editTaskInputValue.slice(1);

    this.currentAccount.taskList.editTask(taskId, editedText);
    this.accManager.saveAccounts();
  }

  toggleEditModal() {
    if (this.overlay.classList.contains("active")) {
      this.closeEditModal();
    } else {
      this.overlay.classList.add("active");
      this.editTaskContainer.classList.add("active");
      this.button.closeBtn.classList.add("active");
    }
  }

  closeEditModal() {
    this.overlay.classList.remove("active");
    this.editTaskContainer.classList.remove("active");
    this.button.closeBtn.classList.remove("active");
  }

  toggleForm() {
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
    this.messageIsVisible = true;

    const container = isSuccess ? this.successContainer : this.errorContainer;
    if (!isSuccess) this.errorMsgText.textContent = this.accManager.message;

    container.style.display = "flex";

    setTimeout(() => {
      container.style.transform = "translateY(-50%)";
    }, 10);

    setTimeout(() => this.hideMessage(isSuccess), 5000);
  }

  hideMessage(isSuccess = false) {
    const container = isSuccess ? this.successContainer : this.errorContainer;
    container.style.transform = "translateY(-200%)";

    setTimeout(() => {
      container.style.display = "none";
      this.messageIsVisible = false;
    }, 500);
  }

  toggleEyeBtn(inputContainer, loginForm = true) {
    if (!loginForm) {
      inputContainer
        .querySelector(".sign-up-form__eye-btn")
        .classList.toggle("active");
      inputContainer.querySelector(".closed").classList.toggle("active");
    } else {
      inputContainer.querySelector(".eye-btn").classList.toggle("active");
      inputContainer.querySelector(".closed").classList.toggle("active");
    }
  }

  togglePasswordVisibility(e, loginForm = true) {
    const target = e.target;
    if (
      !target.classList.contains(
        loginForm ? "eye-btn" : "sign-up-form__eye-btn",
      )
    )
      return;

    const eyeBtn = target.closest(
      loginForm ? ".eye-btn" : ".sign-up-form__eye-btn",
    );
    const passwordInputContainer = target.closest(".password-input-container");
    const passwordInput =
      passwordInputContainer.querySelector(".password-input");

    passwordInput.type = eyeBtn.classList.contains("closed")
      ? "password"
      : "text";

    this.toggleEyeBtn(passwordInputContainer, loginForm);
  }

  render() {
    this.taskListContainer.innerHTML = "";

    if (!this.currentAccount?.taskList?.getTasks()?.length) return;

    this.currentAccount.taskList.getTasks().forEach((task) => {
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
