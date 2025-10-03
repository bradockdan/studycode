// Dados do usuário e progresso
let userData = {
    name: "Estudante",
    streak: 0,
    overallProgress: 0,
    areas: {
        frontend: { progress: 25, completed: false },
        backend: { progress: 15, completed: false },
        mobile: { progress: 10, completed: false },
        datascience: { progress: 5, completed: false }
    },
    tasks: [
        { id: 1, title: "Praticar JavaScript", description: "Resolver 5 problemas no HackerRank", time: 30, completed: false },
        { id: 2, title: "Estudar React Hooks", description: "Assistir tutorial e criar um projeto simples", time: 45, completed: false }
    ]
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateUI();
});

function initializeApp() {
    // Carregar dados do localStorage se existirem
    const savedData = localStorage.getItem('studyCodeData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    
    // Verificar streak (se o usuário já estudou hoje)
    checkDailyStreak();
}

function setupEventListeners() {
    // Navegação do menu
    const navItems = document.querySelectorAll('.nav-menu a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
            
            // Atualizar estado ativo do menu
            navItems.forEach(nav => nav.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    // Áreas de estudo - clique
    const areaCards = document.querySelectorAll('.area-card');
    areaCards.forEach(card => {
        card.addEventListener('click', function() {
            const area = this.dataset.area;
            showAreaDetails(area);
        });
    });

    // Botões de tarefas
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-complete')) {
            completeTask(e.target.closest('.task-card'));
        }
        
        if (e.target.classList.contains('btn-snooze')) {
            snoozeTask(e.target.closest('.task-card'));
        }
    });

    // Adicionar nova tarefa
    document.getElementById('add-task-btn').addEventListener('click', addNewTask);
    document.getElementById('new-task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
}

function showSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Mostrar seção específica
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

function showAreaDetails(area) {
    const areaNames = {
        frontend: "Frontend Development",
        backend: "Backend Development", 
        mobile: "Mobile Development",
        datascience: "Data Science"
    };

    alert(`Detalhes de ${areaNames[area]}:\nProgresso: ${userData.areas[area].progress}%`);
}

function completeTask(taskCard) {
    const taskTitle = taskCard.querySelector('h3').textContent;
    
    // Encontrar e marcar tarefa como concluída
    const task = userData.tasks.find(t => t.title === taskTitle);
    if (task) {
        task.completed = true;
        
        // Atualizar progresso
        updateProgress(5); // +5% por tarefa concluída
        
        // Animação de conclusão
        taskCard.style.opacity = '0.5';
        setTimeout(() => {
            taskCard.remove();
            checkAllTasksCompleted();
        }, 500);
    }
    
    saveData();
}

function snoozeTask(taskCard) {
    taskCard.style.transform = 'translateX(100px)';
    taskCard.style.opacity = '0';
    
    setTimeout(() => {
        taskCard.style.transform = 'translateX(0)';
        taskCard.style.opacity = '1';
        alert('Tarefa adiada para amanhã!');
    }, 1000);
}

function addNewTask() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            title: taskText,
            description: "Nova tarefa adicionada",
            time: 30,
            completed: false
        };
        
        userData.tasks.push(newTask);
        renderNewTask(newTask);
        input.value = '';
        saveData();
    }
}

function renderNewTask(task) {
    const tasksContainer = document.querySelector('.tasks-container');
    const addTaskElement = document.querySelector('.add-task');
    
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.innerHTML = `
        <div class="task-header">
            <h3>${task.title}</h3>
            <span class="task-time">${task.time} min</span>
        </div>
        <p>${task.description}</p>
        <div class="task-actions">
            <button class="btn-complete">Concluir</button>
            <button class="btn-snooze">Adiar</button>
        </div>
    `;
    
    tasksContainer.insertBefore(taskCard, addTaskElement);
}

function checkAllTasksCompleted() {
    const remainingTasks = userData.tasks.filter(task => !task.completed);
    if (remainingTasks.length === 0) {
        showCongratulations();
    }
}

function showCongratulations() {
    const congratulation = document.createElement('div');
    congratulation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        z-index: 1000;
    `;
    congratulation.innerHTML = `
        <h2>🎉 Parabéns! 🎉</h2>
        <p>Você completou todas as tarefas de hoje!</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 15px; padding: 10px 20px; background: white; color: #27ae60; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Fechar</button>
    `;
    
    document.body.appendChild(congratulation);
}

function updateProgress(increment) {
    userData.overallProgress = Math.min(userData.overallProgress + increment, 100);
    updateUI();
}

function checkDailyStreak() {
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    const today = new Date().toDateString();
    
    if (lastStudyDate !== today) {
        // Novo dia - incrementar streak se estudou ontem
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudyDate === yesterday.toDateString()) {
            userData.streak++;
        } else if (!lastStudyDate) {
            // Primeiro acesso
            userData.streak = 1;
        } else {
            // Quebrou a sequência
            userData.streak = 1;
        }
        
        localStorage.setItem('lastStudyDate', today);
        saveData();
    }
}

function updateUI() {
    // Atualizar progresso geral
    document.getElementById('overall-progress').style.width = userData.overallProgress + '%';
    document.getElementById('progress-text').textContent = userData.overallProgress + '% Completo';
    document.getElementById('progress-percent').textContent = userData.overallProgress + '%';
    
    // Atualizar círculo de progresso
    const circle = document.querySelector('.circle');
    circle.style.background = `conic-gradient(#3498db ${userData.overallProgress * 3.6}deg, #e0e0e0 0deg)`;
    
    // Atualizar streak
    document.getElementById('streak-count').textContent = userData.streak;
    
    // Atualizar próxima meta
    const nextGoal = document.getElementById('next-goal');
    if (userData.overallProgress < 25) {
        nextGoal.textContent = "Completar 25% do curso de Frontend";
    } else if (userData.overallProgress < 50) {
        nextGoal.textContent = "Alcançar 50% de progresso geral";
    } else if (userData.overallProgress < 75) {
        nextGoal.textContent = "Dominar conceitos avançados";
    } else {
        nextGoal.textContent = "Finalizar todos os cursos!";
    }
}

function saveData() {
    localStorage.setItem('studyCodeData', JSON.stringify(userData));
}

// Inicializar primeira seção
showSection('areas');