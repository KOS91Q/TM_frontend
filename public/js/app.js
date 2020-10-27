import {service, url} from './api.js'
import {authView, projectView, taskView, utilView} from './view.js'

$('a.google-btn').attr('href', url.GOOGLE_AUTH)
$('a.facebook-btn').attr('href', url.FACEBOOK_AUTH)
$('a.github-btn').attr('href', url.GITHUB_AUTH)
$('.toast').toast('show')

service.load();
const auth = {
    singIn: $('form#sign_in').on('submit', function () {
        service.request(
            url.LOGIN,
            service.REQUEST_TYPE.POST,
            authView.signIn,
            service.prepareData($(this)[0])
        )
        return false;
    }),
    singUp: $('form#sign_up').on('submit', function () {
        service.request(
            url.SING_UP,
            service.REQUEST_TYPE.POST,
            authView.singUp,
            service.prepareData($(this)[0])
        );
        return false;
    }),
    logout: $('#logout').on('click', () => {
        localStorage.clear();
        utilView.isAuthorized(false);
        authView.logout()
    })
}
const projectAction = {
    requestType: null,
    editAddModal: $('#projectName').on({
        'show.bs.modal': function (event) {
            let button = $(event.relatedTarget);
            let modal = $(this)
            if (button.data('is_new')) {
                projectAction.requestType = service.REQUEST_TYPE.POST;
                modal.find(`input[name='name']`).val('');
            } else {
                projectAction.requestType = service.REQUEST_TYPE.PUT;
                let $project = $(event.relatedTarget).closest('.project')
                modal.find(`input[name='id']`).val($project.data('id'));
                modal.find(`input[name='name']`).val($project.find('.pr-header-name').text())
            }
        },
        'shown.bs.modal': function () {
            $(this).find(`input[name='name']`).trigger('focus')
        },
        submit: function () {
            let $this = $(this);
            service.request(
                url.PROJECT,
                projectAction.requestType,
                projectAction.requestType === service.REQUEST_TYPE.POST ? projectView.add : projectView.rename,
                service.prepareData($this.find('form')[0])
            );
            $this.find('form').trigger('reset')
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
        let name = $inputName.val().trim()
        $inputName.val(name)
    }),
    delete: $(document).on('click', `.project .project-header .bi-trash`, function () {
        let $project = $(this).closest(`.project[data-id]`);
        if (confirm('Delete project ' + $project.find(`.pr-header-name`).text() + '?')) {
            service.request(
                url.PROJECT,
                service.REQUEST_TYPE.DELETE,
                projectView.delete,
                service.prepareData({id: $project.data(`id`)})
            )
        }
    })
}
const taskAction = {
    editModal: $('#taskModal').on({
        'show.bs.modal': function (event) {
            let $task = $(event.relatedTarget).closest('.task')
            let modal = $(this)
            modal.find(`[data-status]`).removeClass('active');
            modal.find(`input[name='oldName']`).val($task.find('.task-name').text())
            modal.find(`input[name='id']`).val($task.data('id'));
            modal.find(`[data-status='${$task.data('status')}']`).button('toggle');
            modal.find(`input[name='name']`).val($task.find('.task-name').text())
        },
        'shown.bs.modal': function () {
            $(this).find(`input[name='name']`).trigger('focus')
            $(`#taskStatus`).data('ready', true);
        },
        'hide.bs.modal': function () {
            $(this).find(`#taskStatus[data-ready]`).data('ready', false);
        },
        submit: function () {
            let $this = $(this);
            service.request(
                url.TASK,
                service.REQUEST_TYPE.PUT,
                taskView.update,
                service.prepareData($this.find('form')[0])
            );
            $this.closest('.modal').modal('hide');
            return false;
        },
        changeStatus: $(document).on('change', `#taskStatus input`, function () {
            let $this = $(this);
            if ($this.closest('#taskStatus').data('ready')) {
                service.request(
                    url.TASK,
                    service.REQUEST_TYPE.PUT,
                    taskView.changeStatus,
                    service.prepareData(
                        {
                            id: $this.closest(`form`).find(`input[name="id"]`).val(),
                            status: $this.parent().data('status')
                        }
                    )
                )
            } else {
                return false;
            }
        })
    }),
    validEditName: $(document).on('click', '#taskModal form button', function () {
        let $inputName = $(this).closest(`form`).find(`input[name='name']`);
        let name = $inputName.val().trim()
        $inputName.val(name)
        let oldName = $($inputName).siblings(`input[name='oldName']`).val().trim()
        $inputName[0].setCustomValidity(name === oldName ? 'please change name' : '');
    }),
    validNewName: $(document).on('click', '.task-add form button', function () {
        let $name = $(this).closest('form').find(`input[name='name']`)
        if (!$name.val().trim()) {
            $name.val('')
        }
        $name.focus()
    }),
    submitIfRenameValid: $(`#taskModal form input[name='name']`).on('keyup', function (e) {
        if (e.key === 'Enter') {
            $(this).closest(`form`).find(`button[type='submit']`).click();
        }
    }),
    add: $(document).on('submit', '.task-add form', function () {
        service.request(url.TASK, service.REQUEST_TYPE.POST, taskView.add, service.prepareData(this))
        $(this).find(`input[name='name']`).val('')
        return false
    }),
    delete: $(document).on('click', `.task .bi-trash`, function () {
        let $task = $(this).closest(`.task[data-id]`);
        if (confirm('Delete task ' + $task.find(`.task-name`).text() + '?')) {
            service.request(
                url.TASK,
                service.REQUEST_TYPE.DELETE,
                taskView.delete,
                service.prepareData({id: $task.data(`id`)})
            )
        }
    })
}
