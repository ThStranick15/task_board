const date = $('#task-due-date')
const submit = $('#submit')
//target the parent object for items that have not been put in yet
const deleteBtn = $('.task-lanes')
const toDoSection = $('#todo-cards')
const inProgressSection = $('#in-progress-cards')
const doneSection = $('#done-cards')

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    const ID = Math.floor(Math.random()*100)
    return ID
}

// Todo: create a function to create a task card
function createTaskCard(task,index) {
    const section = task.loc === 'toDo' ? toDoSection : task.loc === 'inProgress' ? inProgressSection : doneSection
    const titleInput = task.title
    const dateInput = task.date
    const descInput = task.desc
    //Determine the due date
    const taskStyle = dayjs().isAfter(dayjs(dateInput), 'day') ? 'bg-danger' : dayjs().isSame(dayjs(dateInput), 'day') ? 'bg-warning' : 'bg-primary'
    const finalStyle = task.loc === 'done' ? 'bg-success' : taskStyle
    //Create Card
    section.append(`
        <article data-index="${index}" class="d-flex flex-column w-100 align-items-center ${finalStyle} p-2 mt-2 to-do">
            <h2>${titleInput}</h2>
            <p>${descInput}</p>
            <p>${dateInput}</p>
            <button data-index="${index}" class="btn shadow-sm btn-danger w-30 delete-button" >Delete</button>
        </article>
    `);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const taskList = JSON.parse(localStorage.getItem('tasks'))  || []
    toDoSection.empty()
    inProgressSection.empty()
    doneSection.empty()
    taskList.forEach(function(element,index) {
        createTaskCard(element,index)
    });

    $('article').draggable({
        //Make sure dragged is above everything
        zIndex: 100,
        //helper function to determine the draggable component and make a clone to drag
        helper: function(e){
            const original = $(e.target).hasClass('ui-draggable') ? $(e.target): $(e.target).closest('.ui-draggable');

        return original.clone().css({
            maxWidth: original.outerWidth(),
        });
        }
    })
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    //Get Form Values and Store in LocalStorage
    event.preventDefault()
    let titleInput = $('#task-title').val()
    let dateInput = $('#task-due-date').val()
    let descInput = $('#task-description').val()
    const uniqueID = generateTaskId()
    const toDo = 'toDo'

    task = {
        id: uniqueID,
        title: titleInput,
        date: dateInput,
        desc: descInput,
        loc: toDo
    }

    if(!titleInput || !dateInput || !descInput){
        alert("Please fill out all task elements before submitting.")
    }

    else{
        const tasksParse = JSON.parse(localStorage.getItem("tasks"))
        const tasks = tasksParse || []
        tasks.push(task)
        localStorage.setItem('tasks', JSON.stringify(tasks))
        // const index = tasks.length-1
        // createTaskCard(task,index)
        renderTaskList()
    }
    $('#form')[0].reset()
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    event.preventDefault()
    const del = $(event.target)
    const tasks = JSON.parse(localStorage.getItem('tasks'))  || []
    const index = del.data('index')
    tasks.splice(index, 1)

    localStorage.setItem('tasks', JSON.stringify(tasks))

    del.parent().remove()
    //resets indexes that were set on first render
    renderTaskList()
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const tasks = JSON.parse(localStorage.getItem('tasks'))  || []
    const section = $(event.target)
    const task = $(ui.draggable[0])
    const index = task.data('index')
    const taskStyle = dayjs().isAfter(dayjs(tasks[index].date), 'day') ? 'bg-danger' : dayjs().isSame(dayjs(tasks[index].date), 'day') ? 'bg-warning' : 'bg-primary'
    //Checking which section it was dropped into and appending
    if(section.is('#to-do')){
        task.appendTo('#todo-cards')
        tasks[index].loc = 'toDo'
        task.removeClass('bg-success')
        task.addClass(taskStyle)
    }
    else if(section.is('#in-progress')){
        task.appendTo('#in-progress-cards')
        tasks[index].loc = 'inProgress'
        task.removeClass('bg-success')
        task.addClass(taskStyle)
    }
    else{
        task.appendTo('#done-cards')
        tasks[index].loc = 'done'
        task.removeClass('bg-danger') 
        task.removeClass('bg-warning')
        task.addClass('bg-success')
    }

    localStorage.setItem('tasks', JSON.stringify(tasks))
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    //Render Task List
    renderTaskList()
    //Event Listners for Modal Form & Datepicker
    date.datepicker()
    submit.on('click', handleAddTask)
    deleteBtn.on('click', 'button', handleDeleteTask)

    //Droppable
    $('#to-do, #in-progress, #done').droppable({
        accept: 'article',
        drop: handleDrop
    })
});
