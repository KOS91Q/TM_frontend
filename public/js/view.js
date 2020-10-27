export {taskView, projectView, authView, utilView};
import {service} from './api.js'

const utilView = {
    notify: (message, status) => {
        if (message && status) {
            $.notify(message, {
                className: status,
                showAnimation: 'slideDown',
                position: `bottom right`
            })
        }
    },
    isAuthorized: (is) => {
        $(".authenticated").css({display: is ? 'block' : 'none'});
        $(".unauthenticated").css({display: is ? 'none' : 'block'});
    }
}

const authView = {
    singUp: () => {
        $('#auth #cancel_sign_up').click();
        $(`form#sign_in input[name='email']`).focus()
        resetForms();
    },
    signIn: response => {
        service.saveToken(response);
        utilView.notify("You're successfully signed in", 'success');
        resetForms();
        service.load();
    },
    logout: () => {
        $(`.projects`).empty()
        $('#user').text('')
        $('#user_logo').remove()
    },
    me: (user) => {
        $('#user_email').text(user.name).attr('title', user.provider + ' account')
        projectView.show(user.projects)
        if (service.provider.local !== user.provider && user.imageUrl) {
            $(`#user_email`).after(`<img id="user_logo" src="${user.imageUrl}" alt="${user.name}">`);
        }
    },
    toggleLoginOrSingUp: $('#btn-sign_up, #auth #cancel_sign_up')
        .click(() => $('#auth #sign_in, #btn-sign_up, #auth #sign_up').toggle())
}

function resetForms() {
    $(`form#sign_up, form#sign_in`).trigger('reset')
}

const taskView = {
    add: task => {
        let $tasks = $(`.project[data-id='${task.projectId}'] .tasks`);
        let $taskView = $(prepareTask(task));
        $tasks.find(`.space`).remove()
        $tasks.children().append($taskView);
        $tasks.animate({scrollTop: $tasks.prop("scrollHeight")});
        $taskView.fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500)
    },
    update: task => {
        $(`.project[data-id='${task.projectId}'] .task[data-id='${task.id}'] .task-name`)
            .text(task.name)
            .fadeOut(500)
            .fadeIn(500);
    },
    changeStatus: task => {
        $(`.project[data-id='${task.projectId}'] .task[data-id='${task.id}']`).data('status', task.status);
    },
    delete: task => {
        let $item = $(`.task[data-id='${task.id}']`);
        let $parent = $item.parent();
        $item.remove();
        if (!$parent.children().length) {
            $parent.append(`<tr class="row m-0 border-bottom space task"></tr>`)
        }
    }
}

const projectView = {
    show: projects => {
        $(`.projects`).append(projects.map(project => prepareProject(project)).join('') + addProjectButton);
    },
    add: project => {
        let $projects = $('.projects');
        let $project = $(prepareProject(project));
        $projects.children().last().before($project);
        $projects.animate({scrollTop: $projects.prop("scrollHeight")});
        $project.fadeOut(500).fadeIn(500)
    },
    rename: project => {
        $(`.project[data-id='${project.id}'] .pr-header-name`).text(project.name)
    },
    delete: project => {
        $(`.project[data-id='${project.id}']`).remove();
    }
}

function makeTasks(tasks) {
    return tasks.map(task => prepareTask(task)).join('')
}

const addProjectButton =
    `<div class="col-10 col-sm-9 col-md-8 col-lg-7 col-xl-5 project-add justify-content-center align-self-center">
            <button data-toggle="modal" data-is_new="true" data-target="#projectName" class="btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="32"
                     height="32" viewBox="0 0 32 32" data-tags="plus,add,sum">
                    <g transform="scale(0.03125 0.03125)">
                        <path d="M992 384h-352v-352c0-17.664-14.304-32-32-32h-192c-17.696 0-32 14.336-32 32v352h-352c-17.696 0-32 14.336-32 32v192c0 17.696 14.304 32 32 32h352v352c0 17.696 14.304 32 32 32h192c17.696 0 32-14.304 32-32v-352h352c17.696 0 32-14.304 32-32v-192c0-17.664-14.304-32-32-32z"/>
                    </g>
                </svg>
                <span class="text-light">Add TODO List</span>
            </button>
        </div>
    </div>`

function prepareProject(project) {
    const tasks = project.tasks.length
        ? makeTasks(project.tasks)
        : `<tr class="row m-0 border-bottom space task"></tr>`;
    return `<div class="col-10 col-sm-9 col-md-8 col-lg-7 col-xl-5 project" data-id="${project.id}">
                <div class="row project-header">
                    <div class="col-1 project-calendar">
                        <svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-calendar2-week"
                             fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                  d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                            <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                        </svg>
                    </div>
                    <div class="col pr-header-name">${project.name}</div>
                    <div class="col-2 ">
                        <div class="row justify-content-end hidden">
                            <div class="project-header-icon">
                                <svg  data-toggle="modal" data-target="#projectName"  width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pen" fill="currentColor"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                                </svg>
                            </div>
                            <div class="project-header-icon-border"></div>
                            <div class="project-header-icon">
                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash"
                                     fill="currentColor"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fill-rule="evenodd"
                                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row task-add">
                    <form class="input-group input-group-sm form-row needs-validation">
                            <div class="input-group-prepend task-add-icon">+</div>
                             <input type="text" class="form-control shadow-sm bg-white rounded"
                                   placeholder="Start typing here to create a task" name="name" required>
                             <input type="text" name="projectId" value="${project.id}" hidden>
                            <div class="input-group-append">
                                <button class="btn b-submit" type="submit">Add Task</button>
                            </div>
                    </form>
                </div>
                <div class="row tasks">
                    <table class="table mb-0 table-light table-bordered table-hover">
                        <tbody>${tasks}</tbody>
                    </table>
                </div>
            </div>`;
}

function prepareTask(task) {
    return `<tr class="row m-0 border-bottom task" data-status="${task.status}" data-id="${task.id}">
                <td class="col-1 border-right modal-dialog-centered">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="task-select_${task.id}">
                        <label class="custom-control-label" for="task-select_${task.id}"></label>
                    </div>
                </td>
                <td class="col-9 border-left border-right"><p class="task-name btn-group-vertical">${task.name}</p></td>
                <td class="col-2 task-change-icons hidden align-self-center">
                    <div class="row form-row">
                        <button  class="btn col-4" data-toggle="tooltip" data-placement="top" title="Tooltip on top">
                            <svg width="1em" height="1em" viewBox="0 0 16 16"
                                 class="bi bi-arrows-expand priority" fill="currentColor"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8zM7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10z"/>
                            </svg>
                        </button>
                        <button class="btn col-4">
                            <svg data-toggle="modal" data-target="#taskModal" class="bi bi-pen edit"
                                 fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                      d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                            </svg>
                        </button>
                        <button class="btn col-4">
                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash"
                                 fill="currentColor"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd"
                                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>`
}