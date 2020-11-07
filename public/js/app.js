import {service, url} from './api.js';
import {authView, notifyView, projectView, taskView} from './view.js';

$('a.google-btn').attr('href', url.GOOGLE_AUTH);
$('a.facebook-btn').attr('href', url.FACEBOOK_AUTH);
$('a.github-btn').attr('href', url.GITHUB_AUTH);

$(`#task_on_hover`).click(function () {
    $(`.tasks tr .status-navbar`).css('display', $(this).attr('aria-pressed') === `false` ? 'block' : '')
})

service.load();

const auth = {
    singIn: $('form#sign_in').on('submit', function () {
        service.request(
            url.LOGIN,
            service.REQUEST_TYPE.POST,
            authView.signIn,
            service.prepareData($(this)[0]),
        );
        return false;
    }),
    singUp: $('form#sign_up').on('submit', function () {
        service.request(
            url.SING_UP,
            service.REQUEST_TYPE.POST,
            authView.singUp,
            service.prepareData($(this)[0]),
        );
        return false;
    }),
    logout: $('#logout').on('click', () => {
        localStorage.clear();
        authView.isAuthorized(false);
        authView.logout();
    })
};

const projectAction = {
    requestType: null,
    editAddModal: $('#projectName').on({
        'show.bs.modal': function (event) {
            let button = $(event.relatedTarget);
            let modal = $(this);
            if (button.data('is_new')) {
                projectAction.requestType = service.REQUEST_TYPE.POST;
                modal.find(`input[name='name']`).val('');
                modal.find(`button.b-submit`).text('Add');
            } else {
                modal.find(`button.b-submit`).text('Rename');
                projectAction.requestType = service.REQUEST_TYPE.PUT;
                let $project = $(event.relatedTarget).closest('.project');
                modal.find(`input[name='id']`).val($project.data('id'));
                modal.find(`input[name='name']`).val($project.find('.pr-header-name').text());
            }
        },
        'shown.bs.modal': function () {
            $(this).find(`input[name='name']`).trigger('focus');
        },
        submit: function () {
            let $this = $(this);
            service.request(
                url.PROJECT,
                projectAction.requestType,
                projectAction.requestType === service.REQUEST_TYPE.POST ? projectView.add : projectView.rename,
                service.prepareData($this.find('form')[0]),
            );
            $this.find('form').trigger('reset');
            $this.closest('.modal').modal('hide');
            return false;
        }
    }),
    submitIfRenameValid: $(`#projectName form input[name='name']`).on('keyup', function (e) {
        if (e.key === 'Enter') {
            $(this).closest(`form`).find(`button[type='submit']`).click();
        }
    }),
    validEditName: $(document).on('click', '#projectName form button', function () {
        let $inputName = $(this).closest(`form`).find(`input[name='name']`);
        let name = $inputName.val().trim();
        $inputName.val(name);
    }),
    delete: $(document).on('click', `.project .project-header .bi-trash`, function () {
        let $project = $(this).closest(`.project[data-id]`);
        if (confirm(`Delete project ${$project.find(`.pr-header-name`).text()}?`)) {
            service.request(
                url.PROJECT,
                service.REQUEST_TYPE.DELETE,
                projectView.delete,
                service.prepareData({id: $project.data(`id`)}),
            );
        }
    })
};

const minDate = new Date().toISOString().split('T')[0];
const taskAction = {
    editModal: $('#taskModal').on({
        'show.bs.modal': function (event) {
            let $task = $(event.relatedTarget).closest('.task');
            let modal = $(this);
            modal.find(`[data-status]`).removeClass('active');
            modal.find(`input[name='oldName']`).val($task.find('.task-name').text());
            modal.find(`input[name='id']`).val($task.data('id'));
            modal.find(`[data-status='${$task.data('status')}']`).button('toggle');
            modal.find(`input[name='name']`).val($task.find('.task-name').text());
            $('#deadline').attr({min: minDate}).attr('data-deadline', $task.data('deadline'));
        },
        'shown.bs.modal': function () {
            $(this).find(`input[name='name']`).trigger('focus');
            $(`#taskStatus`).data('ready', true);
        },
        'hide.bs.modal': function () {
            $(this).find(`#taskStatus[data-ready]`).data('ready', false);
        },
        submit: function () {
            service.request(
                url.TASK,
                service.REQUEST_TYPE.PUT,
                taskView.update,
                service.prepareData($(this).find('form')[0]),
            );
            return false;
        },
        updateStatusSelect: $(document).on('change', `.task-status`, function () {
            statusRequest($(this).closest(`.task`).data(`id`), $(this).find(`:selected`).html());
        }),
        updateStatus: $(document).on('change', `#taskStatus input`, function () {
            let $this = $(this);
            if ($this.closest('#taskStatus').data('ready')) {
                statusRequest($this.closest(`form`).find(`input[name="id"]`).val(), $this.parent().data('status'));
            } else {
                return false;
            }
        }),
        updateDeadline: $(document).on('change', `input#deadline, input.deadline`, function () {
            let $this = $(this);
            let date = $this.val();
            $this.attr('data-deadline', date);
            let id = $this.closest(`form`).find(`input[name="id"]`).val();
            service.request(
                url.TASK,
                service.REQUEST_TYPE.PUT,
                taskView.updateDeadline,
                service.prepareData({
                    id: id ? id : $this.closest(`.task`).data(`id`),
                    deadline: date,
                }),
            );
        }),
    }),
    validEditName: $(document).on('click', '#taskModal form button', function () {
        let $inputName = $(this).closest(`form`).find(`input[name='name']`);
        let name = $inputName.val().trim();
        $inputName.val(name);
        let oldName = $($inputName).siblings(`input[name='oldName']`).val().trim();
        $inputName[0].setCustomValidity(name === oldName ? 'please change name' : '');
    }),
    validNewName: $(document).on('click', '.task-add form button', function () {
        let $name = $(this).closest('form').find(`input[name='name']`);
        if (!$name.val().trim()) {
            $name.val('');
        }
        $name.focus();
    }),
    submitIfRenameValid: $(`#taskModal form input[name='name']`).on('keyup', function (e) {
        if (e.key === 'Enter') {
            $(this).closest(`form`).find(`button[type='submit']`).click();
        }
    }),
    add: $(document).on('submit', '.task-add form', function () {
        let lastTask = $(this).closest(`.project`).find(`.task:last`);
        $(this).find(`[name="pos"]`).val(lastTask.length ? parseInt(lastTask.data(`pos`)) + 1 : 1)
        service.request(url.TASK, service.REQUEST_TYPE.POST, taskView.add, service.prepareData(this));
        $(this).find(`input[name='name']`).val('');
        return false;
    }),
    delete: $(document).on('click', `.task .bi-trash`, function () {
        let $task = $(this).closest(`.task[data-id]`);
        if (confirm('Delete task ' + $task.find(`.task-name`).text() + '?')) {
            service.request(
                url.TASK,
                service.REQUEST_TYPE.DELETE,
                taskView.delete,
                service.prepareData({id: $task.data(`id`)}),
            );
        }
    }),
    checkToDelete: $(document).on('click', `.task input[type="checkbox"]`, function () {
        let $checkbox = $(this);
        let projectId = $checkbox.closest(`.project`).data('id');
        if (!$(`.project[data-id='${projectId}'] .task-delete`).length) {
            notifyView.tasksDelete(projectId, $checkbox.data('id'),
                $(`.task-delete`).length);
        } else {
            let $taskBtn = $(`.project[data-id='${projectId}'] .task-delete button[data-task_ids]`);
            let ids = new Set($taskBtn.data('task_ids'));
            if ($checkbox.is(':checked')) {
                ids.add($checkbox.data('id'));
            } else {
                ids.delete($checkbox.data('id'));
            }
            if (ids.size) {
                $(`.project[data-id='${projectId}'] .task-delete span`).text(ids.size);
            } else {
                $(`.project[data-id='${projectId}'] .task-delete button.close`).click();
            }
            $taskBtn.data('task_ids', ids);
        }
    }),
    deleteMultiple: $(document).on('click', `.project .task-delete [data-task_ids]`, function () {
        let $this = $(this);
        let ids = Array.from($this.data('task_ids'));
        if (confirm('Delete ' + ids.length + ' tasks?')) {
            service.request(
                url.TASK + `/multiple`,
                service.REQUEST_TYPE.DELETE,
                taskView.deleteMultiple,
                service.prepareData({
                    id: $this.closest(`.project`).data('id'),
                    tasks: ids.map(id => ({id: id}))
                })
            );
        }
    })
};

function statusRequest(id, status) {
    service.request(
        url.TASK,
        service.REQUEST_TYPE.PUT,
        taskView.updateStatus,
        service.prepareData({id: id, status: status}),
    )
}