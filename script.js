
  document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const createTaskBtn = document.getElementById('createTaskBtn');
    let activeTask = null;

    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    for (const task of savedTasks) {
      addTaskToTable(task);
    }

    function clickCreateTaskButton() {
        createTaskBtn.click();
      }

      function clickDeleteButton() {
        const deleteBtn = document.querySelector('.deleteBtn');
        if (deleteBtn) {
          deleteBtn.click();
        }
      }

      const intro = introJs();
      intro.setOptions({
      
        steps: [
          {
            intro: "Добро пожаловать в YouTrack!",
          },
          {
            element: createTaskBtn,
            intro: "Нажмите эту кнопку, чтобы создать новую задачу.",
          },
          {
            element: taskList.querySelector('td[contenteditable]'),
            intro: "Нажмите на название задачи, чтобы отредактировать ее.",
          },
          {
            element: taskList.querySelector('.startBtn'),
            intro: "Нажмите «Старт», чтобы начать отслеживать время выполнения задачи.",
          },
          {
            element: taskList.querySelector('.pauseBtn'),
            intro: "Нажмите «Пауза», чтобы приостановить таймер задачи.",
          },
          {
            element: taskList.querySelector('.deleteBtn'),
            intro: "Нажмите «Удалить», чтобы удалить задачу.",
          },
          {
            intro: "Вот и все! Все готово для эффективного управления вашими задачами.",
          },
        ],
        
        oncomplete: function () {
        
          clickDeleteButton();
        },
      });

      if (!localStorage.getItem('onboardingCompleted')) {
        intro.onafterchange(function (element) {
         
          if (element.step === intro._options.steps.length) {
            clickDeleteButton();
          }
        });
        intro.oncomplete(clickDeleteButton);
        intro.start();

     
        intro.onexit(function () {
          localStorage.setItem('onboardingCompleted', true);
        });

    
        clickCreateTaskButton();
      }


    createTaskBtn.addEventListener('click', () => {
      const task = {
        name: 'Новая задача',
        time: 0,
        paused: true,
        timerInterval: null,
      };
      savedTasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(savedTasks));
      addTaskToTable(task);
    });

    function addTaskToTable(task) {
      const taskRow = document.createElement('tr');
      taskRow.innerHTML = `
        <td contenteditable="true">${task.name}</td>
        <td><span>${formatTime(task.time)}</span></td>
        <td>
          <button class="pauseBtn">${task.paused ? 'Продолжить' : 'Пауза'}</button>
          <button class="startBtn">${task.paused ? 'Запустить' : 'Пауза'}</button>
          <button class="deleteBtn">Удалить</button>
        </td>
      `;
      taskList.appendChild(taskRow);

      const taskNameCell = taskRow.querySelector('td[contenteditable]');
      const pauseBtn = taskRow.querySelector('.pauseBtn');
      const startBtn = taskRow.querySelector('.startBtn');
      const deleteBtn = taskRow.querySelector('.deleteBtn');

      function updateTimer() {
        if (!task.paused) {
          task.time += 1000;
        }
        taskRow.querySelector('span').textContent = formatTime(task.time);

        if (task.time >= 6 * 60 * 60 * 1000) {
          taskRow.classList.add('green');
          taskRow.classList.remove('orange');
        } else if (task.time >= 3 * 60 * 60 * 1000) {
          taskRow.classList.add('orange');
          taskRow.classList.remove('green');
        } else {
          taskRow.classList.remove('green', 'orange');
        }

       
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
      }

      function showStartButton() {
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
      }

      function showPauseButton() {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
      }

      if (task.paused) {
        showStartButton();
      } else {
        showPauseButton();
        if (activeTask && activeTask !== task) {
          activeTask.paused = true;
          clearInterval(activeTask.timerInterval);
          showStartButton();
        }
        activeTask = task;
      }

      pauseBtn.addEventListener('click', () => {
        task.paused = !task.paused;
        if (task.paused) {
          clearInterval(task.timerInterval);
          pauseBtn.textContent = 'Продолжить';
          showStartButton();
        } else {
          task.timerInterval = setInterval(updateTimer, 1000);
          pauseBtn.textContent = 'Пауза';
          showPauseButton();
          if (activeTask && activeTask !== task) {
            activeTask.paused = true;
            clearInterval(activeTask.timerInterval);
            showStartButton();
          }
          activeTask = task;
        }
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
      });

      startBtn.addEventListener('click', () => {
        task.paused = false;
        pauseBtn.textContent = 'Пауза';
        showPauseButton();
        if (task.timerInterval) {
          clearInterval(task.timerInterval);
        }
        task.timerInterval = setInterval(updateTimer, 1000);
        if (activeTask && activeTask !== task) {
          activeTask.paused = true;
          clearInterval(activeTask.timerInterval);
          showStartButton();
        }
        activeTask = task;
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
      });

      deleteBtn.addEventListener('click', () => {
        clearInterval(task.timerInterval);
        const index = savedTasks.indexOf(task);
        if (index !== -1) {
          savedTasks.splice(index, 1);
          localStorage.setItem('tasks', JSON.stringify(savedTasks));
        }
        taskList.removeChild(taskRow);


        if (activeTask === task) {
          activeTask = null;
        }
      });


      if (!task.paused) {
        task.timerInterval = setInterval(updateTimer, 1000);
        showPauseButton();
        activeTask = task;
      }


      taskNameCell.addEventListener('input', () => {
        task.name = taskNameCell.textContent.trim();
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
      });
    }

    function formatTime(time) {
      const seconds = Math.floor(time / 1000) % 60;
      const minutes = Math.floor(time / 1000 / 60) % 60;
      const hours = Math.floor(time / 1000 / 3600);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  });

